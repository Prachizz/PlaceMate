import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { dataStore } from "@/lib/db";
import { evaluateEligibility } from "@/lib/eligibility";
import { telemetry } from "@/lib/telemetry";

const applySchema = z.object({
  jobId: z.string().min(1, "Job ID is required")
});

export async function GET(request: Request) {
  const reqStart = Date.now();
  const user = getSessionFromRequest(request);

  if (!user) {
    telemetry.recordRequest("GET", "/api/applications", 401, Date.now() - reqStart);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status");

  let apps = dataStore.applications;

  if (user.role === "STUDENT") {
    const student = dataStore.students.find((s) => s.userId === user.id);
    if (!student) {
      return NextResponse.json({ applications: [], count: 0 });
    }
    apps = apps.filter((a) => a.studentId === student.id);
  } else if (user.role === "RECRUITER") {
    const recruiter = dataStore.recruiters.find((r) => r.userId === user.id);
    if (!recruiter) {
      return NextResponse.json({ applications: [], count: 0 });
    }
    const recruiterJobIds = dataStore.jobs
      .filter((j) => j.recruiterId === recruiter.id)
      .map((j) => j.id);
    apps = apps.filter((a) => recruiterJobIds.includes(a.jobId));
  }
  // ADMIN sees all

  if (statusFilter && statusFilter !== "ALL") {
    apps = apps.filter((a) => a.status === statusFilter);
  }

  const enriched = apps.map((app) => {
    const student = dataStore.students.find((s) => s.id === app.studentId);
    const studentUser = dataStore.users.find((u) => u.id === student?.userId);
    const job = dataStore.jobs.find((j) => j.id === app.jobId);
    const recruiter = dataStore.recruiters.find((r) => r.id === job?.recruiterId);

    return {
      id: app.id,
      studentId: app.studentId,
      studentName: studentUser?.name || "Student Candidate",
      studentEmail: studentUser?.email || "candidate@example.edu",
      branch: student?.branch || "Unknown",
      cgpa: student?.cgpa || 0,
      backlogs: student?.backlogs || 0,
      graduationYear: student?.graduationYear || 2026,
      skills: student?.skills || "",
      resumeUrl: student?.resumeUrl,
      phone: student?.phone,
      jobId: app.jobId,
      jobTitle: job?.title || "Position",
      companyName: recruiter?.companyName || "Company",
      status: app.status,
      feedback: app.feedback,
      appliedAt: app.appliedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString()
    };
  });

  telemetry.recordRequest("GET", "/api/applications", 200, Date.now() - reqStart);
  return NextResponse.json({ applications: enriched, count: enriched.length });
}

export async function POST(request: Request) {
  const reqStart = Date.now();
  const user = getSessionFromRequest(request);

  if (!user || user.role !== "STUDENT") {
    telemetry.recordRequest("POST", "/api/applications", 403, Date.now() - reqStart);
    return NextResponse.json(
      { error: "Forbidden: Only student candidates can apply for placement opportunities" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validated = applySchema.safeParse(body);

    if (!validated.success) {
      telemetry.recordRequest("POST", "/api/applications", 400, Date.now() - reqStart);
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const { jobId } = validated.data;

    // Check student profile
    const student = dataStore.students.find((s) => s.userId === user.id);
    if (!student) {
      telemetry.recordRequest("POST", "/api/applications", 400, Date.now() - reqStart);
      return NextResponse.json(
        { error: "Please complete your student profile before applying for jobs" },
        { status: 400 }
      );
    }

    // Check job existence
    const job = dataStore.jobs.find((j) => j.id === jobId);
    if (!job) {
      telemetry.recordRequest("POST", "/api/applications", 404, Date.now() - reqStart);
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    // Check for duplicate application
    const existingApp = dataStore.applications.find(
      (a) => a.studentId === student.id && a.jobId === jobId
    );
    if (existingApp) {
      telemetry.recordRequest("POST", "/api/applications", 409, Date.now() - reqStart);
      return NextResponse.json(
        { error: "You have already submitted an application for this placement drive" },
        { status: 409 }
      );
    }

    // Server-side eligibility check
    const eligibility = evaluateEligibility(
      {
        branch: student.branch,
        cgpa: student.cgpa,
        backlogs: student.backlogs,
        graduationYear: student.graduationYear
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

    if (!eligibility.isEligible) {
      telemetry.recordRequest("POST", "/api/applications", 403, Date.now() - reqStart);
      return NextResponse.json(
        {
          error: "Ineligible for this drive",
          summary: eligibility.summary,
          criteria: eligibility.criteria
        },
        { status: 403 }
      );
    }

    const newApp = {
      id: "app_" + Math.random().toString(36).substring(2, 11),
      studentId: student.id,
      jobId,
      status: "APPLIED" as const,
      appliedAt: new Date(),
      updatedAt: new Date()
    };

    dataStore.applications.unshift(newApp);

    telemetry.recordRequest("POST", "/api/applications", 201, Date.now() - reqStart);
    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully! Recruiter has been notified.",
        application: newApp
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error submitting application";
    telemetry.recordRequest("POST", "/api/applications", 500, Date.now() - reqStart);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
