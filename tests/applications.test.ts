import { describe, it, expect, beforeEach } from "vitest";
import { POST as postApplication } from "../app/api/applications/route";
import { PATCH as patchApplication } from "../app/api/applications/[id]/route";
import { dataStore } from "../lib/db";
import { signToken, AUTH_COOKIE_OPTIONS } from "../lib/auth";

describe("PlaceMate Job Applications & Access Control Tests", () => {
  beforeEach(() => {
    dataStore.seedDefaultData();
  });

  it("rejects application submission if candidate is not authenticated", async () => {
    const req = new Request("http://localhost:3000/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "job_google_sde" })
    });

    const res = await postApplication(req);
    expect(res.status).toBe(403);
  });

  it("prevents duplicate applications for the same job and candidate", async () => {
    // Prachi already has app_1 for job_google_sde in seeded data
    const studentUser = {
      id: "usr_stud_1",
      name: "Prachi Sonawane",
      email: "prachi@pccoepune.org",
      role: "STUDENT" as const,
      studentProfileId: "stud_prof_1"
    };
    const token = signToken(studentUser);

    const req = new Request("http://localhost:3000/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${AUTH_COOKIE_OPTIONS.name}=${token}`
      },
      body: JSON.stringify({ jobId: "job_google_sde" })
    });

    const res = await postApplication(req);
    expect(res.status).toBe(409);

    const data = await res.json();
    expect(data.error).toContain("already submitted an application");
  });

  it("rejects application if student fails server-side eligibility checks", async () => {
    // Rahul has CGPA 6.9 and 1 backlog, whereas job_ms_cloud requires CGPA 7.5 and 0 backlogs
    const studentUser = {
      id: "usr_stud_2",
      name: "Rahul Verma",
      email: "rahul@pccoepune.org",
      role: "STUDENT" as const,
      studentProfileId: "stud_prof_2"
    };
    const token = signToken(studentUser);

    const req = new Request("http://localhost:3000/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${AUTH_COOKIE_OPTIONS.name}=${token}`
      },
      body: JSON.stringify({ jobId: "job_ms_cloud" })
    });

    const res = await postApplication(req);
    expect(res.status).toBe(403);

    const data = await res.json();
    expect(data.error).toContain("Ineligible");
  });

  it("allows eligible student to apply successfully", async () => {
    // Prachi (CGPA 8.85, 0 backlogs) applying for job_ms_cloud (requires 7.5, 0 backlogs, CE/IT/ENTC)
    const studentUser = {
      id: "usr_stud_1",
      name: "Prachi Sonawane",
      email: "prachi@pccoepune.org",
      role: "STUDENT" as const,
      studentProfileId: "stud_prof_1"
    };
    const token = signToken(studentUser);

    const req = new Request("http://localhost:3000/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${AUTH_COOKIE_OPTIONS.name}=${token}`
      },
      body: JSON.stringify({ jobId: "job_ms_cloud" })
    });

    const res = await postApplication(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.application.status).toBe("APPLIED");
  });

  it("allows recruiter to update application status with authorization check", async () => {
    // Recruiter 1 owns job_google_sde, and app_1 is an application for job_google_sde
    const recruiterUser = {
      id: "usr_rec_1",
      name: "Priya Nair",
      email: "recruiter@google.com",
      role: "RECRUITER" as const,
      recruiterProfileId: "rec_prof_1"
    };
    const token = signToken(recruiterUser);

    const req = new Request("http://localhost:3000/api/applications/app_1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${AUTH_COOKIE_OPTIONS.name}=${token}`
      },
      body: JSON.stringify({ status: "INTERVIEW", feedback: "Selected for round 2" })
    });

    const res = await patchApplication(req, { params: Promise.resolve({ id: "app_1" }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.application.status).toBe("INTERVIEW");
    expect(data.application.feedback).toBe("Selected for round 2");
  });

  it("prevents recruiter from updating application of another company", async () => {
    // Recruiter 2 (Microsoft) attempts to update app_1 (which is for Google)
    const recruiterUser = {
      id: "usr_rec_2",
      name: "Amit Deshmukh",
      email: "recruiter@microsoft.com",
      role: "RECRUITER" as const,
      recruiterProfileId: "rec_prof_2"
    };
    const token = signToken(recruiterUser);

    const req = new Request("http://localhost:3000/api/applications/app_1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${AUTH_COOKIE_OPTIONS.name}=${token}`
      },
      body: JSON.stringify({ status: "REJECTED" })
    });

    const res = await patchApplication(req, { params: Promise.resolve({ id: "app_1" }) });
    expect(res.status).toBe(403);
  });
});
