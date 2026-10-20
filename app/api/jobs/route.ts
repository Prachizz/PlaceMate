import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { dataStore, InMemoryStudent } from "@/lib/db";
import { evaluateEligibility } from "@/lib/eligibility";
import { telemetry } from "@/lib/telemetry";

const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  role: z.string().min(2, "Role must be specified"),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  salaryPackage: z.string().min(2, "Salary package is required"),
  minCgpa: z.number().min(0).max(10),
  maxBacklogs: z.number().int().min(0),
  eligibleBranches: z.string().min(2, "Specify eligible branches (comma separated)"),
  eligibleBatch: z.number().int().min(2020),
  deadline: z.string().min(5, "Deadline date is required")
});

export async function GET(request: Request) {
  const reqStart = Date.now();
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.toLowerCase();
  const branchFilter = url.searchParams.get("branch");
  const roleFilter = url.searchParams.get("role");

  const user = getSessionFromRequest(request);
  let studentProfile: InMemoryStudent | null = null;
  let studentApplications: Record<string, string> = {};

  if (user && user.role === "STUDENT") {
    studentProfile = dataStore.students.find((s) => s.userId === user.id) || null;
    if (studentProfile) {
      const apps = dataStore.applications.filter((a) => a.studentId === studentProfile?.id);
      for (const a of apps) {
        studentApplications[a.jobId] = a.status;
      }
    }
  }

  let jobs = dataStore.jobs.map((job) => {
    const recruiter = dataStore.recruiters.find((r) => r.id === job.recruiterId);
    const companyName = recruiter?.companyName || "Partner Company";
    const appCount = dataStore.applications.filter((a) => a.jobId === job.id).length;

    let userEligibility = undefined;
    let hasApplied = false;
    let applicationStatus = undefined;

    if (studentProfile) {
      userEligibility = evaluateEligibility(
        {
          branch: studentProfile.branch,
          cgpa: studentProfile.cgpa,
          backlogs: studentProfile.backlogs,
          graduationYear: studentProfile.graduationYear
        },
        {
          minCgpa: job.minCgpa,
          maxBacklogs: job.maxBacklogs,
          eligibleBranches: job.eligibleBranches,
          eligibleBatch: job.eligibleBatch,
          deadline: job.deadline,
          status: job.status
        }
      );

      if (studentApplications[job.id]) {
        hasApplied = true;
        applicationStatus = studentApplications[job.id];
      }
    }

    return {
      id: job.id,
      recruiterId: job.recruiterId,
      companyName,
      title: job.title,
      role: job.role,
      description: job.description,
      location: job.location,
      salaryPackage: job.salaryPackage,
      minCgpa: job.minCgpa,
      maxBacklogs: job.maxBacklogs,
      eligibleBranches: job.eligibleBranches.split(",").map((b) => b.trim()),
      eligibleBatch: job.eligibleBatch,
      deadline: job.deadline.toISOString(),
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      applicationCount: appCount,
      userEligibility,
      hasApplied,
      applicationStatus
    };
  });

  // Apply filters
  if (search) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(search) ||
        j.companyName.toLowerCase().includes(search) ||
        j.role.toLowerCase().includes(search) ||
        j.location.toLowerCase().includes(search)
    );
  }

  if (branchFilter && branchFilter !== "ALL") {
    jobs = jobs.filter(
      (j) =>
        j.eligibleBranches.includes("All") ||
        j.eligibleBranches.some((b) => b.toLowerCase() === branchFilter.toLowerCase())
    );
  }

  telemetry.recordRequest("GET", "/api/jobs", 200, Date.now() - reqStart);
  return NextResponse.json({ jobs, count: jobs.length });
}

export async function POST(request: Request) {
  const reqStart = Date.now();
  const user = getSessionFromRequest(request);

  if (!user || (user.role !== "RECRUITER" && user.role !== "ADMIN")) {
    telemetry.recordRequest("POST", "/api/jobs", 403, Date.now() - reqStart);
    return NextResponse.json(
      { error: "Forbidden: Only verified recruiters or administrators can create job openings" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validated = createJobSchema.safeParse(body);

    if (!validated.success) {
      telemetry.recordRequest("POST", "/api/jobs", 400, Date.now() - reqStart);
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let recruiterId = user.recruiterProfileId;
    if (!recruiterId) {
      // Find or create recruiter profile
      let recruiter = dataStore.recruiters.find((r) => r.userId === user.id);
      if (!recruiter) {
        recruiter = {
          id: "rec_" + Math.random().toString(36).substring(2, 11),
          userId: user.id,
          companyName: user.name + " Corp",
          industry: "Technology"
        };
        dataStore.recruiters.push(recruiter);
      }
      recruiterId = recruiter.id;
    }

    const jobId = "job_" + Math.random().toString(36).substring(2, 11);
    const newJob = {
      id: jobId,
      recruiterId,
      title: validated.data.title,
      role: validated.data.role,
      description: validated.data.description,
      location: validated.data.location,
      salaryPackage: validated.data.salaryPackage,
      minCgpa: validated.data.minCgpa,
      maxBacklogs: validated.data.maxBacklogs,
      eligibleBranches: validated.data.eligibleBranches,
      eligibleBatch: validated.data.eligibleBatch,
      deadline: new Date(validated.data.deadline),
      status: "OPEN" as const,
      createdAt: new Date()
    };

    dataStore.jobs.unshift(newJob);

    telemetry.recordRequest("POST", "/api/jobs", 201, Date.now() - reqStart);
    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating job";
    telemetry.recordRequest("POST", "/api/jobs", 500, Date.now() - reqStart);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
