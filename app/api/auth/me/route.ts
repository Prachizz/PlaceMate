import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { dataStore } from "@/lib/db";

export async function GET(request: Request) {
  const user = getSessionFromRequest(request);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  // Fetch updated profile info
  let profile = null;
  if (user.role === "STUDENT") {
    profile = dataStore.students.find((s) => s.userId === user.id) || null;
  } else if (user.role === "RECRUITER") {
    profile = dataStore.recruiters.find((r) => r.userId === user.id) || null;
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...user,
      profile
    }
  });
}
