import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { dataStore } from "@/lib/db";
import { telemetry } from "@/lib/telemetry";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const reqStart = Date.now();
  const { id } = await params;

  const job = dataStore.jobs.find((j) => j.id === id);
  if (!job) {
    telemetry.recordRequest("GET", `/api/jobs/${id}`, 404, Date.now() - reqStart);
    return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
  }

  const recruiter = dataStore.recruiters.find((r) => r.id === job.recruiterId);
  const applications = dataStore.applications.filter((a) => a.jobId === id);

  telemetry.recordRequest("GET", `/api/jobs/${id}`, 200, Date.now() - reqStart);
  return NextResponse.json({
    job: {
      ...job,
      companyName: recruiter?.companyName || "Partner Company",
      recruiterWebsite: recruiter?.website,
      eligibleBranches: job.eligibleBranches.split(",").map((b) => b.trim()),
      applicationCount: applications.length,
      deadline: job.deadline.toISOString(),
      createdAt: job.createdAt.toISOString()
    }
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const reqStart = Date.now();
  const { id } = await params;
  const user = getSessionFromRequest(request);

  if (!user || (user.role !== "RECRUITER" && user.role !== "ADMIN")) {
    telemetry.recordRequest("PUT", `/api/jobs/${id}`, 403, Date.now() - reqStart);
    return NextResponse.json({ error: "Forbidden: Recruiter access required" }, { status: 403 });
  }

  const job = dataStore.jobs.find((j) => j.id === id);
  if (!job) {
    telemetry.recordRequest("PUT", `/api/jobs/${id}`, 404, Date.now() - reqStart);
    return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
  }

  // Authorization check: recruiter must own the job unless admin
  if (user.role === "RECRUITER" && job.recruiterId !== user.recruiterProfileId) {
    telemetry.recordRequest("PUT", `/api/jobs/${id}`, 403, Date.now() - reqStart);
    return NextResponse.json(
      { error: "Forbidden: You are not authorized to modify another recruiter's job posting" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    if (body.title) job.title = body.title;
    if (body.role) job.role = body.role;
    if (body.description) job.description = body.description;
    if (body.location) job.location = body.location;
    if (body.salaryPackage) job.salaryPackage = body.salaryPackage;
    if (body.minCgpa !== undefined) job.minCgpa = parseFloat(body.minCgpa);
    if (body.maxBacklogs !== undefined) job.maxBacklogs = parseInt(body.maxBacklogs, 10);
    if (body.eligibleBranches) job.eligibleBranches = body.eligibleBranches;
    if (body.eligibleBatch !== undefined) job.eligibleBatch = parseInt(body.eligibleBatch, 10);
    if (body.deadline) job.deadline = new Date(body.deadline);
    if (body.status) job.status = body.status;

    telemetry.recordRequest("PUT", `/api/jobs/${id}`, 200, Date.now() - reqStart);
    return NextResponse.json({ success: true, job });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating job";
    telemetry.recordRequest("PUT", `/api/jobs/${id}`, 500, Date.now() - reqStart);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const reqStart = Date.now();
  const { id } = await params;
  const user = getSessionFromRequest(request);

  if (!user || (user.role !== "RECRUITER" && user.role !== "ADMIN")) {
    telemetry.recordRequest("DELETE", `/api/jobs/${id}`, 403, Date.now() - reqStart);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const jobIndex = dataStore.jobs.findIndex((j) => j.id === id);
  if (jobIndex === -1) {
    telemetry.recordRequest("DELETE", `/api/jobs/${id}`, 404, Date.now() - reqStart);
    return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
  }

  const job = dataStore.jobs[jobIndex];
  if (user.role === "RECRUITER" && job.recruiterId !== user.recruiterProfileId) {
    telemetry.recordRequest("DELETE", `/api/jobs/${id}`, 403, Date.now() - reqStart);
    return NextResponse.json({ error: "Forbidden: Unauthorized to delete this job" }, { status: 403 });
  }

  dataStore.jobs.splice(jobIndex, 1);
  telemetry.recordRequest("DELETE", `/api/jobs/${id}`, 200, Date.now() - reqStart);
  return NextResponse.json({ success: true, message: "Job deleted successfully" });
}
