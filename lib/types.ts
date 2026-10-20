export type UserRole = "STUDENT" | "RECRUITER" | "ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentProfileId?: string;
  recruiterProfileId?: string;
  companyName?: string;
}

export interface EligibilityCriterionResult {
  criterion: "BRANCH" | "CGPA" | "BACKLOGS" | "GRADUATION_YEAR" | "DEADLINE" | "STATUS";
  name: string;
  required: string | number;
  actual: string | number;
  passed: boolean;
  message: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  criteria: EligibilityCriterionResult[];
  summary: string;
}

export interface StudentProfileData {
  id: string;
  userId: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  backlogs: number;
  skills: string;
  resumeUrl?: string | null;
  phone?: string | null;
}

export interface RecruiterProfileData {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  website?: string | null;
  description?: string | null;
}

export interface JobPostingData {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  role: string;
  description: string;
  location: string;
  salaryPackage: string;
  minCgpa: number;
  maxBacklogs: number;
  eligibleBranches: string[];
  eligibleBatch: number;
  deadline: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  createdAt: string;
  applicationCount?: number;
  userEligibility?: EligibilityResult;
  hasApplied?: boolean;
  applicationStatus?: string;
}

export interface JobApplicationData {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  graduationYear: number;
  resumeUrl?: string | null;
  skills: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED";
  feedback?: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface PlatformAnalytics {
  totalStudents: number;
  totalRecruiters: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  selectedCount: number;
  placementRatePercent: number;
  branchStats: { branch: string; students: number; placed: number }[];
  applicationStatusDistribution: { status: string; count: number }[];
  recentJobs: { id: string; title: string; company: string; applications: number }[];
}
