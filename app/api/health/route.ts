import { NextResponse } from "next/server";
import { telemetry } from "@/lib/telemetry";

export async function GET() {
  const reqStart = Date.now();
  const mem = process.memoryUsage();
  const snapshot = telemetry.getSnapshot();

  const health = {
    status: snapshot.errorRatePercent > 20 ? "degraded" : "healthy",
    service: "PlaceMate Campus Placement Engine",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    uptimeSeconds: snapshot.uptimeSeconds,
    timestamp: new Date().toISOString(),
    database: "PostgreSQL (Neon) with Prisma ORM",
    memory: {
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
    },
    platformStats: {
      registeredStudents: snapshot.business.totalStudents,
      activeJobs: snapshot.business.activeJobs,
      totalApplications: snapshot.business.totalApplications,
      placementRate: `${snapshot.business.placementRate}%`
    }
  };

  telemetry.recordRequest("GET", "/api/health", 200, Date.now() - reqStart);
  return NextResponse.json(health, { status: 200 });
}
