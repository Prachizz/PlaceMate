import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, signToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { dataStore } from "@/lib/db";
import { telemetry } from "@/lib/telemetry";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "RECRUITER"]),
  // Student fields
  branch: z.string().optional(),
  graduationYear: z.number().int().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  backlogs: z.number().int().min(0).optional(),
  skills: z.string().optional(),
  phone: z.string().optional(),
  // Recruiter fields
  companyName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional()
});

export async function POST(request: Request) {
  const reqStart = Date.now();
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      telemetry.recordRequest("POST", "/api/auth/register", 400, Date.now() - reqStart);
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = dataStore.users.find((u) => u.email === normalizedEmail);
    if (existing) {
      telemetry.recordRequest("POST", "/api/auth/register", 409, Date.now() - reqStart);
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = "usr_" + Math.random().toString(36).substring(2, 11);

    const newUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      createdAt: new Date()
    };
    dataStore.users.push(newUser);

    let studentProfileId: string | undefined;
    let recruiterProfileId: string | undefined;
    let companyName: string | undefined;

    if (role === "STUDENT") {
      studentProfileId = "stud_" + Math.random().toString(36).substring(2, 11);
      dataStore.students.push({
        id: studentProfileId,
        userId,
        branch: validated.data.branch || "Computer Engineering",
        graduationYear: validated.data.graduationYear || 2026,
        cgpa: validated.data.cgpa ?? 7.5,
        backlogs: validated.data.backlogs ?? 0,
        skills: validated.data.skills || "JavaScript, Problem Solving",
        phone: validated.data.phone || null
      });
    } else if (role === "RECRUITER") {
      recruiterProfileId = "rec_" + Math.random().toString(36).substring(2, 11);
      companyName = validated.data.companyName || name + " Corp";
      dataStore.recruiters.push({
        id: recruiterProfileId,
        userId,
        companyName,
        industry: validated.data.industry || "Technology",
        website: validated.data.website || null
      });
    }

    const sessionUser = {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentProfileId,
      recruiterProfileId,
      companyName
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json(
      { success: true, message: "Registration successful", user: sessionUser },
      { status: 201 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_OPTIONS.name,
      value: token,
      ...AUTH_COOKIE_OPTIONS.options
    });

    telemetry.recordRequest("POST", "/api/auth/register", 201, Date.now() - reqStart);
    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    telemetry.recordRequest("POST", "/api/auth/register", 500, Date.now() - reqStart);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
