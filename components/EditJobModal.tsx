"use client";

import React, { useState, useEffect } from "react";
import { X, Edit3, AlertCircle, Save, Trash2 } from "lucide-react";
import { JobPostingData } from "@/lib/types";

interface EditJobModalProps {
  job: JobPostingData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const AVAILABLE_BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering"
];

export function EditJobModal({ job, isOpen, onClose, onUpdated }: EditJobModalProps) {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryPackage, setSalaryPackage] = useState("");
  const [minCgpa, setMinCgpa] = useState("7.0");
  const [maxBacklogs, setMaxBacklogs] = useState("0");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [eligibleBatch, setEligibleBatch] = useState("2026");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"OPEN" | "CLOSED" | "ARCHIVED">("OPEN");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setRole(job.role);
      setDescription(job.description);
      setLocation(job.location);
      setSalaryPackage(job.salaryPackage);
      setMinCgpa(String(job.minCgpa));
      setMaxBacklogs(String(job.maxBacklogs));
      setSelectedBranches(job.eligibleBranches || []);
      setEligibleBatch(String(job.eligibleBatch));
      setStatus(job.status);
      try {
        setDeadline(new Date(job.deadline).toISOString().split("T")[0]);
      } catch {
        setDeadline("2026-12-31");
      }
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleBranchToggle = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          role,
          description,
          location,
          salaryPackage,
          minCgpa: parseFloat(minCgpa),
          maxBacklogs: parseInt(maxBacklogs, 10),
          eligibleBranches: selectedBranches.join(", "),
          eligibleBatch: parseInt(eligibleBatch, 10),
          deadline,
          status
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUpdated();
        onClose();
      } else {
        setError(data.error || "Failed to update job posting");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this placement drive? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUpdated();
        onClose();
      } else {
        setError(data.error || "Failed to delete job");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>Modify Placement Drive</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Update eligibility criteria, deadline, or toggle opening status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Primary Role</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Opening Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "OPEN" | "CLOSED" | "ARCHIVED")}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="OPEN">OPEN (Accepting Applications)</option>
                <option value="CLOSED">CLOSED (Registration Ended)</option>
                <option value="ARCHIVED">ARCHIVED (Past Drive)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Compensation (CTC)</label>
              <input
                type="text"
                required
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Eligibility Criteria Controls */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800/80 space-y-3">
            <span className="text-gray-300 font-bold block text-xs uppercase tracking-wider">
              Automated Eligibility Gates
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Minimum CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Max Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Eligible Batch Year</label>
                <input
                  type="number"
                  required
                  value={eligibleBatch}
                  onChange={(e) => setEligibleBatch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">Eligible Branches</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_BRANCHES.map((b) => {
                  const isSelected = selectedBranches.includes(b);
                  return (
                    <button
                      type="button"
                      key={b}
                      onClick={() => handleBranchToggle(b)}
                      className={`p-2 rounded-lg text-left border text-[11px] font-medium transition-colors ${
                        isSelected
                          ? "bg-blue-950 border-blue-600 text-blue-200"
                          : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Detailed Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? "Deleting..." : "Delete Drive"}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
