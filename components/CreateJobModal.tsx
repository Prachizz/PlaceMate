"use client";

import React, { useState } from "react";
import { X, PlusCircle, AlertCircle } from "lucide-react";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AVAILABLE_BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering"
];

export function CreateJobModal({ isOpen, onClose, onCreated }: CreateJobModalProps) {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("Software Development Engineer");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Pune / Hybrid");
  const [salaryPackage, setSalaryPackage] = useState("14 LPA (Fixed: 11 LPA + Retention Bonus)");
  const [minCgpa, setMinCgpa] = useState("7.5");
  const [maxBacklogs, setMaxBacklogs] = useState("0");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    "Computer Engineering",
    "Information Technology"
  ]);
  const [eligibleBatch, setEligibleBatch] = useState("2026");
  const [deadline, setDeadline] = useState("2026-11-30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      const res = await fetch("/api/jobs", {
        method: "POST",
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
          deadline
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onCreated();
        onClose();
      } else {
        setError(data.error || "Failed to create job posting");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-white">Create Campus Placement Opening</h3>
            <p className="text-xs text-gray-400 mt-0.5">Specify job requirements and automated eligibility gates</p>
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
                placeholder="e.g. Graduate Software Engineer"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Primary Role / Domain</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Development Engineer"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Salary Package (CTC)</label>
              <input
                type="text"
                required
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                placeholder="e.g. 14 LPA"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Eligibility Criteria Controls */}
          <div className="p-4 rounded-xl bg-gray-950/70 border border-blue-900/30 space-y-4">
            <div className="text-xs uppercase font-bold text-blue-400 tracking-wider">
              Automated Eligibility Gates
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Minimum CGPA (out of 10.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Maximum Active Backlogs</label>
                <select
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                >
                  <option value="0">0 (Strictly zero active backlogs)</option>
                  <option value="1">Up to 1 active backlog</option>
                  <option value="2">Up to 2 active backlogs</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Eligible Graduation Batch</label>
                <select
                  value={eligibleBatch}
                  onChange={(e) => setEligibleBatch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                >
                  <option value="2026">Batch of 2026</option>
                  <option value="2025">Batch of 2025</option>
                  <option value="2027">Batch of 2027</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">Eligible Engineering Branches</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_BRANCHES.map((b) => (
                  <label key={b} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(b)}
                      onChange={() => handleBranchToggle(b)}
                      className="rounded bg-gray-900 border-gray-800 text-blue-600 focus:ring-0"
                    />
                    <span className="text-[11px]">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full sm:w-1/2 bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Role Description & Responsibilities</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline candidate responsibilities, required skills, and interview rounds..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Publish Job Opening"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
