"use client";

import React, { useState } from "react";
import { User, Award, BookOpen, ExternalLink, CheckCircle, Clock, XCircle, Send } from "lucide-react";
import { JobApplicationData } from "@/lib/types";

interface CandidateReviewCardProps {
  application: JobApplicationData;
  onStatusUpdated: (id: string, newStatus: string) => void;
}

export function CandidateReviewCard({ application, onStatusUpdated }: CandidateReviewCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState(application.feedback || "");

  const handleUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, feedback })
      });

      if (res.ok) {
        onStatusUpdated(application.id, newStatus);
      }
    } catch {
      // Keep existing state
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-base font-bold text-white">{application.studentName}</h4>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                application.status === "SELECTED"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : application.status === "REJECTED"
                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                  : "bg-blue-950 text-blue-300 border border-blue-800"
              }`}
            >
              {application.status}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Role: <strong className="text-gray-200">{application.jobTitle}</strong>
          </div>
        </div>

        <div className="text-right text-xs text-gray-400 font-mono">
          Applied: {new Date(application.appliedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Candidate Qualifications Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs">
        <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800">
          <div className="text-gray-400 text-[10px] uppercase font-semibold">Branch</div>
          <div className="text-gray-200 font-semibold truncate">{application.branch}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800">
          <div className="text-gray-400 text-[10px] uppercase font-semibold">CGPA</div>
          <div className="text-emerald-400 font-bold font-mono">{application.cgpa.toFixed(2)} / 10</div>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800">
          <div className="text-gray-400 text-[10px] uppercase font-semibold">Active Backlogs</div>
          <div className={`font-semibold ${application.backlogs === 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {application.backlogs} Backlogs
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800">
          <div className="text-gray-400 text-[10px] uppercase font-semibold">Graduation Batch</div>
          <div className="text-blue-400 font-semibold font-mono">Batch {application.graduationYear}</div>
        </div>
      </div>

      {/* Skills & Resume */}
      <div className="text-xs space-y-2 mb-4">
        {application.skills && (
          <div className="text-gray-300">
            <span className="font-semibold text-gray-400">Skills:</span> {application.skills}
          </div>
        )}

        {application.resumeUrl && (
          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium"
          >
            <span>Inspect Verified Resume Document</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Recruiter Evaluation Controls */}
      <div className="pt-3 border-t border-gray-800/80 space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add candidate feedback / round notes..."
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold">Transition Status:</span>

          <button
            onClick={() => handleUpdate("SHORTLISTED")}
            disabled={isUpdating}
            className="px-3 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-medium transition-colors"
          >
            Shortlist
          </button>

          <button
            onClick={() => handleUpdate("INTERVIEW")}
            disabled={isUpdating}
            className="px-3 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-medium transition-colors"
          >
            Invite to Interview
          </button>

          <button
            onClick={() => handleUpdate("SELECTED")}
            disabled={isUpdating}
            className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-medium transition-colors"
          >
            Issue Offer (Select)
          </button>

          <button
            onClick={() => handleUpdate("REJECTED")}
            disabled={isUpdating}
            className="px-3 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
