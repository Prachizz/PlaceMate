import { NextResponse } from "next/server";
import { dataStore } from "@/lib/db";
import { telemetry } from "@/lib/telemetry";
import { PlatformAnalytics } from "@/lib/types";

export async function GET() {
  const reqStart = Date.now();

  const totalStudents = dataStore.students.length;
  const totalRecruiters = dataStore.recruiters.length;
  const totalJobs = dataStore.jobs.length;
  const activeJobs = dataStore.jobs.filter((j) => j.status === "OPEN").length;
  const totalApplications = dataStore.applications.length;
  const selectedCount = dataStore.applications.filter((a) => a.status === "SELECTED").length;

  const placementRatePercent =
    totalStudents > 0 ? Number(((selectedCount / totalStudents) * 100).toFixed(1)) : 0;

  // Branch statistics
  const branchMap: Record<string, { students: number; placed: number }> = {};
  for (const s of dataStore.students) {
    if (!branchMap[s.branch]) {
      branchMap[s.branch] = { students: 0, placed: 0 };
    }
    branchMap[s.branch].students += 1;

    // Check if student has at least one SELECTED application
    const isPlaced = dataStore.applications.some(
      (a) => a.studentId === s.id && a.status === "SELECTED"
    );
    if (isPlaced) {
      branchMap[s.branch].placed += 1;
    }
  }

  const branchStats = Object.keys(branchMap).map((b) => ({
    branch: b,
    students: branchMap[b].students,
    placed: branchMap[b].placed
  }));

  // Status distribution
  const statusCounts: Record<string, number> = {
    APPLIED: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0
  };

  for (const a of dataStore.applications) {
    if (statusCounts[a.status] !== undefined) {
      statusCounts[a.status] += 1;
    }
  }

  const applicationStatusDistribution = Object.keys(statusCounts).map((status) => ({
    status,
    count: statusCounts[status]
  }));

  // Recent jobs
  const recentJobs = dataStore.jobs.slice(0, 5).map((j) => {
    const recruiter = dataStore.recruiters.find((r) => r.id === j.recruiterId);
    const appCount = dataStore.applications.filter((a) => a.jobId === j.id).length;
    return {
      id: j.id,
      title: j.title,
      company: recruiter?.companyName || "Partner Company",
      applications: appCount
    };
  });

  const analytics: PlatformAnalytics = {
    totalStudents,
    totalRecruiters,
    totalJobs,
    activeJobs,
    totalApplications,
    selectedCount,
    placementRatePercent,
    branchStats,
    applicationStatusDistribution,
    recentJobs
  };

  telemetry.recordRequest("GET", "/api/admin/stats", 200, Date.now() - reqStart);
  return NextResponse.json({ analytics });
}
