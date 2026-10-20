"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { EligibilityModal } from "@/components/EligibilityModal";
import { CreateJobModal } from "@/components/CreateJobModal";
import { EditJobModal } from "@/components/EditJobModal";
import { AuthModal } from "@/components/AuthModal";
import { ProfileManager } from "@/components/ProfileManager";
import { ApplicationTracker } from "@/components/ApplicationTracker";
import { CandidateReviewCard } from "@/components/CandidateReviewCard";
import { AdminAnalyticsDashboard } from "@/components/AdminAnalyticsDashboard";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Terminal,
  ExternalLink,
  Edit,
  Power
} from "lucide-react";
import {
  SessionUser,
  UserRole,
  JobPostingData,
  JobApplicationData,
  PlatformAnalytics
} from "@/lib/types";

export default function PlaceMatePortal() {
  const [currentUser, setCurrentUser] = useState<SessionUser>({
    id: "usr_stud_1",
    name: "Prachi Sonawane",
    email: "prachi@pccoepune.org",
    role: "STUDENT",
    studentProfileId: "stud_prof_1"
  });

  const [activeTab, setActiveTab] = useState<"jobs" | "applications" | "analytics" | "profile">("jobs");
  const [jobs, setJobs] = useState<JobPostingData[]>([]);
  const [applications, setApplications] = useState<JobApplicationData[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("ALL");
  const [applicantSearch, setApplicantSearch] = useState("");

  // Modals state
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobPostingData | null>(null);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<JobPostingData | null>(null);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, appsRes, analyticsRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/applications"),
        fetch("/api/admin/stats")
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics || null);
      }
    } catch {
      // Use existing state
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Demo Role Switcher
  const handleSelectRole = (role: UserRole) => {
    if (role === "STUDENT") {
      setCurrentUser({
        id: "usr_stud_1",
        name: "Prachi Sonawane",
        email: "prachi@pccoepune.org",
        role: "STUDENT",
        studentProfileId: "stud_prof_1"
      });
    } else if (role === "RECRUITER") {
      setCurrentUser({
        id: "usr_rec_1",
        name: "Priya Nair",
        email: "recruiter@google.com",
        role: "RECRUITER",
        recruiterProfileId: "rec_prof_1",
        companyName: "Google India"
      });
    } else {
      setCurrentUser({
        id: "usr_admin_1",
        name: "Prof. Suresh Sharma (TPO)",
        email: "admin@placemate.edu",
        role: "ADMIN"
      });
    }
    fetchData();
  };

  const handleAuthSuccess = (user: SessionUser) => {
    setCurrentUser(user);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    handleSelectRole("STUDENT");
  };

  const handleOpenEligibility = (job: JobPostingData) => {
    setSelectedJobForModal(job);
    setIsEligibilityModalOpen(true);
  };

  const handleOpenEditJob = (job: JobPostingData) => {
    setSelectedJobForEdit(job);
    setIsEditJobModalOpen(true);
  };

  const handleToggleJobStatus = async (job: JobPostingData) => {
    const nextStatus = job.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // Ignore
    }
  };

  const handleApplySuccess = () => {
    fetchData();
  };

  const handleStatusUpdated = (appId: string, newStatus: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus as any } : a))
    );
    fetchData();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch =
      selectedBranchFilter === "ALL" ||
      job.eligibleBranches.includes("All") ||
      job.eligibleBranches.some((b) => b.toLowerCase() === selectedBranchFilter.toLowerCase());

    return matchesSearch && matchesBranch;
  });

  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      applicantStatusFilter === "ALL" || app.status === applicantStatusFilter;

    const matchesSearch =
      applicantSearch === "" ||
      app.studentName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.branch.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(applicantSearch.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Notice Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-blue-950/40 border border-blue-900/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              2026
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                PlaceMate Automated Eligibility & Recruitment System
              </div>
              <div className="text-xs text-blue-300/80">
                PostgreSQL (Neon) • Prisma ORM • Role:{" "}
                <strong className="text-white uppercase font-bold">{currentUser.role}</strong>
                {currentUser.companyName && (
                  <span className="text-gray-300"> ({currentUser.companyName})</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 flex items-center space-x-1.5"
            >
              <span>/api/health</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            <a
              href="/api/metrics"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 flex items-center space-x-1.5"
            >
              <Terminal className="w-3 h-3 text-blue-400" />
              <span>/api/metrics</span>
            </a>
          </div>
        </div>

        {/* TAB 1: PLACEMENT DRIVES / JOBS */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            {/* Action Bar & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 items-center space-x-3 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by company, job title, or role..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedBranchFilter}
                    onChange={(e) => setSelectedBranchFilter(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Branches</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electronics & Telecommunication">ENTC</option>
                  </select>
                </div>
              </div>

              {(currentUser.role === "RECRUITER" || currentUser.role === "ADMIN") && (
                <button
                  onClick={() => setIsCreateJobModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post New Drive</span>
                </button>
              )}
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => {
                const isEligible = job.userEligibility?.isEligible;
                const isOwnerOrAdmin =
                  currentUser.role === "ADMIN" ||
                  (currentUser.role === "RECRUITER" && job.recruiterId === currentUser.recruiterProfileId);

                return (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-900/50 shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Company & Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                            <Building className="w-3.5 h-3.5" />
                            <span>{job.companyName}</span>
                          </div>
                          <h4 className="text-lg font-bold text-white mt-1">{job.title}</h4>
                          <div className="text-xs text-gray-400">{job.role}</div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              job.status === "OPEN"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : "bg-rose-950 text-rose-400 border-rose-800"
                            }`}
                          >
                            {job.status}
                          </span>

                          {isOwnerOrAdmin && (
                            <button
                              onClick={() => handleOpenEditJob(job)}
                              title="Edit Drive Criteria"
                              className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Package & Location */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mb-4">
                        <span className="flex items-center space-x-1 font-semibold text-emerald-400">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{job.salaryPackage}</span>
                        </span>

                        <span className="flex items-center space-x-1 text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{job.location}</span>
                        </span>

                        <span className="flex items-center space-x-1 text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        </span>
                      </div>

                      {/* Criteria Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-gray-950 text-gray-300 border border-gray-800">
                          Min CGPA: <strong>{job.minCgpa.toFixed(1)}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-950 text-gray-300 border border-gray-800">
                          Backlogs: <strong>Max {job.maxBacklogs}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-950 text-gray-300 border border-gray-800">
                          Batch: <strong>{job.eligibleBatch}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Eligibility Badge & CTA */}
                    <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                      {currentUser.role === "STUDENT" ? (
                        <>
                          {job.hasApplied ? (
                            <span className="inline-flex items-center space-x-1.5 text-xs text-blue-400 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-blue-400" />
                              <span>Applied ({job.applicationStatus})</span>
                            </span>
                          ) : isEligible ? (
                            <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Eligible</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 text-xs text-rose-400 font-semibold">
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span>Ineligible</span>
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenEligibility(job)}
                            className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition-colors"
                          >
                            {job.hasApplied
                              ? "View Status"
                              : isEligible
                              ? "Review & Apply"
                              : "Why Ineligible?"}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full text-xs text-gray-400">
                          <span>
                            Applications: <strong className="text-white">{job.applicationCount}</strong>
                          </span>
                          <div className="flex items-center space-x-2">
                            {isOwnerOrAdmin && (
                              <button
                                onClick={() => handleToggleJobStatus(job)}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
                                  job.status === "OPEN"
                                    ? "bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900"
                                    : "bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900"
                                }`}
                              >
                                <Power className="w-3 h-3" />
                                <span>{job.status === "OPEN" ? "Close Drive" : "Reopen"}</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActiveTab("applications");
                              }}
                              className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium text-xs transition-colors"
                            >
                              Review Applicants
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS (STUDENT TRACKER OR RECRUITER REVIEW) */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {currentUser.role === "STUDENT"
                    ? "My Application Progress Tracker"
                    : currentUser.role === "RECRUITER"
                    ? "Applicant Submissions & Evaluation Pipeline"
                    : "All Platform Campus Applications"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time recruitment pipeline with status transition audit trail
                </p>
              </div>

              {currentUser.role !== "STUDENT" && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                    placeholder="Search candidate name or branch..."
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={applicantStatusFilter}
                    onChange={(e) => setApplicantStatusFilter(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              )}
            </div>

            {currentUser.role === "STUDENT" ? (
              <ApplicationTracker applications={applications} />
            ) : (
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl p-8 bg-gray-950/40">
                    <p className="text-xs text-gray-500">
                      No candidate applications matching your search or filters.
                    </p>
                  </div>
                ) : (
                  filteredApplications.map((app) => (
                    <CandidateReviewCard
                      key={app.id}
                      application={app}
                      onStatusUpdated={handleStatusUpdated}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE MANAGER (STUDENT ACADEMIC & RECRUITER COMPANY) */}
        {activeTab === "profile" && (
          <ProfileManager
            currentUser={currentUser}
            onProfileUpdated={fetchData}
          />
        )}

        {/* TAB 4: TPO ANALYTICS & MONITORING */}
        {activeTab === "analytics" && (
          <AdminAnalyticsDashboard analytics={analytics} />
        )}
      </main>

      {/* Modals */}
      <EligibilityModal
        job={selectedJobForModal}
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onApplySuccess={handleApplySuccess}
      />

      <CreateJobModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onCreated={fetchData}
      />

      <EditJobModal
        job={selectedJobForEdit}
        isOpen={isEditJobModalOpen}
        onClose={() => setIsEditJobModalOpen(false)}
        onUpdated={fetchData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950/60 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            PlaceMate — Full-Stack Campus Placement Management Platform. Built for Final-Year Viva.
          </div>
          <div className="flex items-center space-x-4">
            <span>Next.js 15 • PostgreSQL (Neon) • Prisma ORM</span>
            <span>GitHub Actions CI/CD • Grafana Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
