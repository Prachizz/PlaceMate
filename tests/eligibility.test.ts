import { describe, it, expect } from "vitest";
import { evaluateEligibility } from "../lib/eligibility";

describe("PlaceMate Automated Eligibility Engine Tests", () => {
  const futureDeadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  const pastDeadline = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

  const standardJob = {
    minCgpa: 7.5,
    maxBacklogs: 0,
    eligibleBranches: "Computer Engineering, Information Technology, Data Science",
    eligibleBatch: 2026,
    deadline: futureDeadline,
    status: "OPEN"
  };

  it("marks fully qualified student as eligible with all criteria passed", () => {
    const student = {
      branch: "Computer Engineering",
      cgpa: 8.5,
      backlogs: 0,
      graduationYear: 2026
    };

    const result = evaluateEligibility(student, standardJob);
    expect(result.isEligible).toBe(true);
    expect(result.criteria.every((c) => c.passed)).toBe(true);
    expect(result.summary).toContain("fully eligible");
  });

  it("marks student ineligible if CGPA is below threshold", () => {
    const student = {
      branch: "Computer Engineering",
      cgpa: 7.2, // Below 7.5
      backlogs: 0,
      graduationYear: 2026
    };

    const result = evaluateEligibility(student, standardJob);
    expect(result.isEligible).toBe(false);

    const cgpaCriterion = result.criteria.find((c) => c.criterion === "CGPA");
    expect(cgpaCriterion?.passed).toBe(false);
    expect(cgpaCriterion?.message).toContain("below requirement");
  });

  it("marks student ineligible if active backlogs exceed maximum allowed", () => {
    const student = {
      branch: "Computer Engineering",
      cgpa: 8.2,
      backlogs: 1, // Job requires 0
      graduationYear: 2026
    };

    const result = evaluateEligibility(student, standardJob);
    expect(result.isEligible).toBe(false);

    const backlogCriterion = result.criteria.find((c) => c.criterion === "BACKLOGS");
    expect(backlogCriterion?.passed).toBe(false);
  });

  it("marks student ineligible if branch does not match allowed branches", () => {
    const student = {
      branch: "Civil Engineering", // Not in CE, IT, DS
      cgpa: 9.0,
      backlogs: 0,
      graduationYear: 2026
    };

    const result = evaluateEligibility(student, standardJob);
    expect(result.isEligible).toBe(false);

    const branchCriterion = result.criteria.find((c) => c.criterion === "BRANCH");
    expect(branchCriterion?.passed).toBe(false);
  });

  it("marks student ineligible if graduation batch year differs", () => {
    const student = {
      branch: "Computer Engineering",
      cgpa: 8.5,
      backlogs: 0,
      graduationYear: 2025 // Job is for 2026
    };

    const result = evaluateEligibility(student, standardJob);
    expect(result.isEligible).toBe(false);

    const batchCriterion = result.criteria.find((c) => c.criterion === "GRADUATION_YEAR");
    expect(batchCriterion?.passed).toBe(false);
  });

  it("marks opening ineligible if application deadline has passed", () => {
    const expiredJob = {
      ...standardJob,
      deadline: pastDeadline
    };

    const student = {
      branch: "Computer Engineering",
      cgpa: 8.5,
      backlogs: 0,
      graduationYear: 2026
    };

    const result = evaluateEligibility(student, expiredJob);
    expect(result.isEligible).toBe(false);

    const deadlineCriterion = result.criteria.find((c) => c.criterion === "DEADLINE");
    expect(deadlineCriterion?.passed).toBe(false);
  });

  it("marks opening ineligible if job status is CLOSED", () => {
    const closedJob = {
      ...standardJob,
      status: "CLOSED"
    };

    const student = {
      branch: "Computer Engineering",
      cgpa: 8.5,
      backlogs: 0,
      graduationYear: 2026
    };

    const result = evaluateEligibility(student, closedJob);
    expect(result.isEligible).toBe(false);

    const statusCriterion = result.criteria.find((c) => c.criterion === "STATUS");
    expect(statusCriterion?.passed).toBe(false);
  });
});
