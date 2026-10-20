import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth";
import { SessionUser } from "../lib/types";

describe("PlaceMate Authentication & Cryptographic Tests", () => {
  it("hashes password and verifies match correctly", async () => {
    const raw = "SecureStudentPass@2026";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2a$")).toBe(true);

    const isMatch = await verifyPassword(raw, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword("WrongPassword", hash);
    expect(isWrong).toBe(false);
  });

  it("signs and verifies JWT token with user claims", () => {
    const mockUser: SessionUser = {
      id: "usr_stud_100",
      name: "Aditi Patil",
      email: "aditi@pccoepune.org",
      role: "STUDENT",
      studentProfileId: "stud_100"
    };

    const token = signToken(mockUser);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(mockUser.id);
    expect(decoded?.email).toBe(mockUser.email);
    expect(decoded?.role).toBe("STUDENT");
  });

  it("rejects invalid or tampered JWT tokens gracefully", () => {
    const invalidToken = "eyJh.invalidPayload.invalidSignature";
    const result = verifyToken(invalidToken);
    expect(result).toBeNull();
  });
});
