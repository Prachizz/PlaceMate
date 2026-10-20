import { EligibilityResult, EligibilityCriterionResult, StudentProfileData, JobPostingData } from "./types";

interface JobEligibilityParams {
  minCgpa: number;
  maxBacklogs: number;
  eligibleBranches: string[] | string;
  eligibleBatch: number;
  deadline: string | Date;
  status: string;
}

interface StudentEligibilityParams {
  branch: string;
  cgpa: number;
  backlogs: number;
  graduationYear: number;
}

export function evaluateEligibility(
  student: StudentEligibilityParams,
  job: JobEligibilityParams
): EligibilityResult {
  const criteria: EligibilityCriterionResult[] = [];

  // Parse branches if comma-separated string
  const allowedBranches = Array.isArray(job.eligibleBranches)
    ? job.eligibleBranches.map((b) => b.trim().toLowerCase())
    : job.eligibleBranches
        .split(",")
        .map((b) => b.trim().toLowerCase())
        .filter(Boolean);

  const studentBranch = (student.branch || "").trim().toLowerCase();
  const branchPassed =
    allowedBranches.length === 0 ||
    allowedBranches.includes("all") ||
    allowedBranches.includes(studentBranch);

  criteria.push({
    criterion: "BRANCH",
    name: "Eligible Branches",
    required: Array.isArray(job.eligibleBranches)
      ? job.eligibleBranches.join(", ")
      : job.eligibleBranches,
    actual: student.branch || "Not Specified",
    passed: branchPassed,
    message: branchPassed
      ? `Branch (${student.branch}) is eligible.`
      : `Branch (${student.branch}) is not in eligible branches list.`
  });

  // CGPA Criterion
  const cgpaPassed = student.cgpa >= job.minCgpa;
  criteria.push({
    criterion: "CGPA",
    name: "Minimum CGPA",
    required: `${job.minCgpa.toFixed(1)} / 10.0`,
    actual: `${student.cgpa.toFixed(2)} / 10.0`,
    passed: cgpaPassed,
    message: cgpaPassed
      ? `CGPA meets minimum threshold (${student.cgpa.toFixed(2)} >= ${job.minCgpa.toFixed(1)}).`
      : `CGPA is below requirement (${student.cgpa.toFixed(2)} < ${job.minCgpa.toFixed(1)}).`
  });

  // Backlogs Criterion
  const backlogsPassed = student.backlogs <= job.maxBacklogs;
  criteria.push({
    criterion: "BACKLOGS",
    name: "Maximum Active Backlogs",
    required: job.maxBacklogs === 0 ? "0 (Zero backlogs)" : `Max ${job.maxBacklogs}`,
    actual: `${student.backlogs} active backlogs`,
    passed: backlogsPassed,
    message: backlogsPassed
      ? `Active backlogs within allowed limit (${student.backlogs} <= ${job.maxBacklogs}).`
      : `Active backlogs exceed limit (${student.backlogs} > ${job.maxBacklogs}).`
  });

  // Graduation Year / Batch Criterion
  const batchPassed = student.graduationYear === job.eligibleBatch;
  criteria.push({
    criterion: "GRADUATION_YEAR",
    name: "Eligible Batch / Year",
    required: `Batch of ${job.eligibleBatch}`,
    actual: `Batch of ${student.graduationYear}`,
    passed: batchPassed,
    message: batchPassed
      ? `Graduation batch matches (${student.graduationYear}).`
      : `Batch does not match (${student.graduationYear} != ${job.eligibleBatch}).`
  });

  // Deadline Criterion
  const deadlineDate = new Date(job.deadline);
  const now = new Date();
  const deadlinePassed = deadlineDate.getTime() >= now.getTime();
  criteria.push({
    criterion: "DEADLINE",
    name: "Application Deadline",
    required: deadlineDate.toLocaleDateString(),
    actual: deadlinePassed ? "Active" : "Expired",
    passed: deadlinePassed,
    message: deadlinePassed
      ? "Application window is currently open."
      : "Application deadline has passed."
  });

  // Job Status Criterion
  const statusPassed = job.status === "OPEN";
  criteria.push({
    criterion: "STATUS",
    name: "Opening Status",
    required: "OPEN",
    actual: job.status,
    passed: statusPassed,
    message: statusPassed
      ? "Job drive is actively accepting applications."
      : `Job is currently ${job.status.toLowerCase()}.`
  });

  const isEligible = criteria.every((c) => c.passed);

  const failingCriteria = criteria.filter((c) => !c.passed);
  let summary = "You are fully eligible to apply for this position.";
  if (!isEligible) {
    const reasons = failingCriteria.map((f) => f.name).join(", ");
    summary = `Not eligible: does not satisfy criteria for ${reasons}.`;
  }

  return {
    isEligible,
    criteria,
    summary
  };
}
