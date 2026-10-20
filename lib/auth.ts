import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { SessionUser, UserRole } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "placemate_dev_secret_key_change_in_production_32chars";
const COOKIE_NAME = "placemate_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentProfileId: user.studentProfileId,
      recruiterProfileId: user.recruiterProfileId,
      companyName: user.companyName
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: Request): SessionUser | null {
  try {
    // Check Authorization header first
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const user = verifyToken(token);
      if (user) return user;
    }

    // Check Cookie header
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]*)`));
      if (match && match[2]) {
        return verifyToken(decodeURIComponent(match[2]));
      }
    }

    return null;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
};
