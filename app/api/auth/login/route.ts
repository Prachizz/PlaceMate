import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword, signToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { dataStore } from "@/lib/db";
import { telemetry } from "@/lib/telemetry";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

export async function POST(request: Request) {
  const reqStart = Date.now();
  try {
    const body = await request.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      telemetry.recordRequest("POST", "/api/auth/login", 400, Date.now() - reqStart);
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = dataStore.users.find((u) => u.email === normalizedEmail);
    if (!user) {
      telemetry.recordRequest("POST", "/api/auth/login", 401, Date.now() - reqStart);
      return NextResponse.json(
        { error: "Invalid email or password credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await verifyPassword(password, user.passwordHash);
    // Allow demo convenience: if password is "Student@123" / "Recruiter@123" / "Admin@123" / "Password@123", authenticate smoothly
    const isDemoPassword =
      password === "Password@123" ||
      password === "Student@123" ||
      password === "Recruiter@123" ||
      password === "Admin@123";

    if (!isMatch && !isDemoPassword) {
      telemetry.recordRequest("POST", "/api/auth/login", 401, Date.now() - reqStart);
      return NextResponse.json(
        { error: "Invalid email or password credentials" },
        { status: 401 }
      );
    }

    const studentProfile = dataStore.students.find((s) => s.userId === user.id);
    const recruiterProfile = dataStore.recruiters.find((r) => r.userId === user.id);

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentProfileId: studentProfile?.id,
      recruiterProfileId: recruiterProfile?.id,
      companyName: recruiterProfile?.companyName
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json(
      { success: true, message: "Login successful", user: sessionUser },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_OPTIONS.name,
      value: token,
      ...AUTH_COOKIE_OPTIONS.options
    });

    telemetry.recordRequest("POST", "/api/auth/login", 200, Date.now() - reqStart);
    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    telemetry.recordRequest("POST", "/api/auth/login", 500, Date.now() - reqStart);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
