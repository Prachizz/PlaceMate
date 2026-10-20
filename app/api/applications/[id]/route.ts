import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { dataStore } from "@/lib/db";
import { telemetry } from "@/lib/telemetry";

const updateStatusSchema = z.object({
  status: z.enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"]),
  feedback: z.string().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const reqStart = Date.now();
  const { id } = await params;
  const user = getSessionFromRequest(request);

  if (!user || (user.role !== "RECRUITER" && user.role !== "ADMIN")) {
    telemetry.recordRequest("PATCH", `/api/applications/${id}`, 403, Date.now() - reqStart);
    return NextResponse.json(
      { error: "Forbidden: Only authorized recruiters or administrators can update candidate status" },
      { status: 403 }
    );
  }

  const app = dataStore.applications.find((a) => a.id === id);
  if (!app) {
    telemetry.recordRequest("PATCH", `/api/applications/${id}`, 404, Date.now() - reqStart);
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Verify recruiter owns the job posting
  const job = dataStore.jobs.find((j) => j.id === app.jobId);
  if (user.role === "RECRUITER" && job?.recruiterId !== user.recruiterProfileId) {
    telemetry.recordRequest("PATCH", `/api/applications/${id}`, 403, Date.now() - reqStart);
    return NextResponse.json(
      { error: "Forbidden: You can only update applications for your company's job postings" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validated = updateStatusSchema.safeParse(body);

    if (!validated.success) {
      telemetry.recordRequest("PATCH", `/api/applications/${id}`, 400, Date.now() - reqStart);
      return NextResponse.json(
        { error: "Invalid status value", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    app.status = validated.data.status;
    if (validated.data.feedback !== undefined) {
      app.feedback = validated.data.feedback;
    }
    app.updatedAt = new Date();

    telemetry.recordRequest("PATCH", `/api/applications/${id}`, 200, Date.now() - reqStart);
    return NextResponse.json({
      success: true,
      message: `Candidate status updated to ${app.status}`,
      application: app
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating status";
    telemetry.recordRequest("PATCH", `/api/applications/${id}`, 500, Date.now() - reqStart);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
