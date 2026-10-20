import { describe, it, expect, beforeEach } from "vitest";
import { GET as getHealth } from "../app/api/health/route";
import { GET as getMetrics } from "../app/api/metrics/route";
import { GET as getJobs } from "../app/api/jobs/route";
import { GET as getAdminStats } from "../app/api/admin/stats/route";
import { dataStore } from "../lib/db";

describe("PlaceMate End-to-End API Integration Tests", () => {
  beforeEach(() => {
    dataStore.seedDefaultData();
  });

  it("GET /api/health returns operational status and database engine info", async () => {
    const res = await getHealth();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.service).toContain("PlaceMate");
    expect(data.database).toContain("PostgreSQL");
    expect(data.platformStats).toHaveProperty("registeredStudents");
    expect(data.platformStats).toHaveProperty("activeJobs");
  });

  it("GET /api/metrics returns Prometheus/OpenMetrics text exposition", async () => {
    const res = await getMetrics();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");

    const text = await res.text();
    expect(text).toContain("# HELP placemate_http_requests_total");
    expect(text).toContain("# HELP placemate_applications_total");
    expect(text).toContain("# HELP placemate_placement_rate_percent");
  });

  it("GET /api/jobs returns active campus placement drives", async () => {
    const req = new Request("http://localhost:3000/api/jobs");
    const res = await getJobs(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jobs.length).toBeGreaterThan(0);
    expect(data.jobs[0]).toHaveProperty("title");
    expect(data.jobs[0]).toHaveProperty("companyName");
    expect(data.jobs[0]).toHaveProperty("salaryPackage");
  });

  it("GET /api/admin/stats returns platform KPIs and branch-wise breakdown", async () => {
    const res = await getAdminStats();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.analytics.totalStudents).toBeGreaterThan(0);
    expect(data.analytics.totalJobs).toBeGreaterThan(0);
    expect(data.analytics.branchStats.length).toBeGreaterThan(0);
    expect(data.analytics.applicationStatusDistribution.length).toBeGreaterThan(0);
  });
});
