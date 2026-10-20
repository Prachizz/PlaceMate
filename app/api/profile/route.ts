import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { dataStore } from "@/lib/db";
import { telemetry } from "@/lib/telemetry";

export async function GET(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "STUDENT") {
    const student = dataStore.students.find((s) => s.userId === user.id);
    return NextResponse.json({ profile: student });
  } else if (user.role === "RECRUITER") {
    const recruiter = dataStore.recruiters.find((r) => r.userId === user.id);
    return NextResponse.json({ profile: recruiter });
  }

  return NextResponse.json({ profile: null, role: "ADMIN" });
}

export async function PUT(request: Request) {
  const reqStart = Date.now();
  const user = getSessionFromRequest(request);
  if (!user) {
    telemetry.recordRequest("PUT", "/api/profile", 401, Date.now() - reqStart);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (user.role === "STUDENT") {
      let student = dataStore.students.find((s) => s.userId === user.id);
      if (!student) {
        student = {
          id: "stud_" + Math.random().toString(36).substring(2, 11),
          userId: user.id,
          branch: body.branch || "Computer Engineering",
          graduationYear: body.graduationYear || 2026,
          cgpa: parseFloat(body.cgpa) || 7.0,
          backlogs: parseInt(body.backlogs, 10) || 0,
          skills: body.skills || "",
          resumeUrl: body.resumeUrl || null,
          phone: body.phone || null
        };
        dataStore.students.push(student);
      } else {
        if (body.branch !== undefined) student.branch = body.branch;
        if (body.graduationYear !== undefined) student.graduationYear = parseInt(body.graduationYear, 10);
        if (body.cgpa !== undefined) student.cgpa = parseFloat(body.cgpa);
        if (body.backlogs !== undefined) student.backlogs = parseInt(body.backlogs, 10);
        if (body.skills !== undefined) student.skills = body.skills;
        if (body.resumeUrl !== undefined) student.resumeUrl = body.resumeUrl;
        if (body.phone !== undefined) student.phone = body.phone;
      }
      telemetry.recordRequest("PUT", "/api/profile", 200, Date.now() - reqStart);
      return NextResponse.json({ success: true, profile: student });
    } else if (user.role === "RECRUITER") {
      let recruiter = dataStore.recruiters.find((r) => r.userId === user.id);
      if (!recruiter) {
        recruiter = {
          id: "rec_" + Math.random().toString(36).substring(2, 11),
          userId: user.id,
          companyName: body.companyName || user.name + " Corp",
          industry: body.industry || "Software",
          website: body.website || null,
          description: body.description || null
        };
        dataStore.recruiters.push(recruiter);
      } else {
        if (body.companyName !== undefined) recruiter.companyName = body.companyName;
        if (body.industry !== undefined) recruiter.industry = body.industry;
        if (body.website !== undefined) recruiter.website = body.website;
        if (body.description !== undefined) recruiter.description = body.description;
      }
      telemetry.recordRequest("PUT", "/api/profile", 200, Date.now() - reqStart);
      return NextResponse.json({ success: true, profile: recruiter });
    }

    return NextResponse.json({ error: "No profile needed for this role" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating profile";
    telemetry.recordRequest("PUT", "/api/profile", 500, Date.now() - reqStart);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
