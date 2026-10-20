"use client";

import React from "react";
import { CheckCircle2, Clock, Calendar, Building, AlertCircle } from "lucide-react";
import { JobApplicationData } from "@/lib/types";

interface ApplicationTrackerProps {
  applications: JobApplicationData[];
}

const STAGES = ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED"] as const;

export function ApplicationTracker({ applications }: ApplicationTrackerProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl p-8 bg-gray-950/40">
        <Building className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-gray-300">No Applications Submitted Yet</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Explore open placement drives under the &quot;Placement Drives&quot; tab and apply to roles matching your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const isRejected = app.status === "REJECTED";
        const currentIndex = STAGES.indexOf(app.status as typeof STAGES[number]);

        return (
          <div
            key={app.id}
            className="p-5 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
              <div>
                <h4 className="text-base font-bold text-white">{app.jobTitle}</h4>
                <div className="text-xs text-blue-400 font-medium flex items-center space-x-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{app.companyName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    app.status === "SELECTED"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : app.status === "REJECTED"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-blue-950 text-blue-300 border border-blue-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {!isRejected ? (
              <div className="mt-5">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {STAGES.map((stage, idx) => {
                    const isPassed = currentIndex >= idx;
                    const isCurrent = currentIndex === idx;

                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-500/30"
                              : isPassed
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-800 text-gray-500 border border-gray-700"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider mt-1.5 ${
                            isCurrent
                              ? "text-blue-400"
                              : isPassed
                              ? "text-emerald-400"
                              : "text-gray-500"
                          }`}
                        >
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  The candidate did not proceed past the review stage for this opening. You remain eligible to apply for other campus drives!
                </span>
              </div>
            )}

            {/* Recruiter Feedback Note */}
            {app.feedback && (
              <div className="mt-4 p-3 rounded-xl bg-gray-950/60 border border-gray-800 text-xs">
                <span className="font-semibold text-gray-300">Recruiter Feedback:</span>{" "}
                <span className="text-gray-400">{app.feedback}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
