"use client";

import { useEffect, useState } from "react";
import { fetchParticipantDashboard } from "@/app/api/dashboard";
import { MatchSummaryDto, ParticipantDashboardDto } from "../types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const ParticipantDashboard = () => {
  const [data, setData] = useState<ParticipantDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const [unconfirmedCount, setUnconfirmedCount] = useState<number>();

  useEffect(() => {
    fetchParticipantDashboard()
      .then((data) => {
        setData(data);
        const count = data.matches.filter(
          (m: MatchSummaryDto) => m.status.toUpperCase() === "PENDING"
        ).length;
        setUnconfirmedCount(count);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="w-full h-80" />;
  if (!data) return <p className="text-red-500">Failed to load dashboard</p>;

  console.log(data);
  return (
    <div className="grid grid-cols-2 gap-6 bg-white rounded max-w-[65vw] p-5">
      <div className="col-span-2 p-6 bg-primary/5 dark:bg-dark rounded-lg flex">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover shadow-md mr-10"
          />
        ) : (
          <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-semibold mr-10">
            {user?.firstName.charAt(0)}
            {user?.lastName.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {data.participantName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Organisation: <strong>{data.organisationName}</strong>
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        {/* Warnings */}
        <div className="col-span-2 bg-primary/5 dark:bg-dark rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          {data.hasUnconfirmedMatches && (
            <p>
              🔔 You have {unconfirmedCount} unconfirmed matches.
              <br />
              <span className="text-sm text-dark/70">
                Please wait for a coordinator to approve them.
              </span>
            </p>
          )}
          {data.hasOverdueInteractions && (
            <p>
              💬 You haven't logged a communication in a while.
              <br />
              <span className="text-sm text-dark/70">
                Consider reaching out.
              </span>
            </p>
          )}
          {data.hasFeedbackPending && (
            <p>📝 Feedback is pending for some programmes.</p>
          )}
        </div>
      </div>

      {/* Match Summary */}
      <div className="bg-primary/5 dark:bg-dark rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Matches Overview</h2>
        {data.matches.length === 0 ? (
          <p>No matches yet.</p>
        ) : (
          data.matches
            .filter((m) => m.status == "APPROVED")
            .map((m) => (
              <div key={m.matchId} className="mb-4 border-b pb-2">
                <p className="font-semibold">
                  {m.mentor ? "Mentor to" : "Mentee of"} {m.matchWithName} (
                  {m.matchWithEmail})
                </p>
                <p className="text-sm text-muted-foreground">
                  Programme: {m.programmeName} ({m.academicYear})<br />
                  Status: {m.status} | Compatibility:{" "}
                  {m.compatibilityScore || "N/A"}
                </p>
                {m.lastInteractionDate && (
                  <p className="text-xs text-gray-500">
                    Last Interaction:{" "}
                    {new Date(m.lastInteractionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
        )}
      </div>

      {/* Participations */}
      <div className="bg-primary/5 dark:bg-dark rounded p-6 col-span-2">
        <h2 className="text-xl font-semibold mb-4">Your Programmes</h2>
        {data.activeParticipations.map((p) => (
          <div key={p.programmeYearId} className="mb-3 flex justify-between">
            <div>
              <p className="font-bold">
                {p.programmeName} ({p.academicYear})
              </p>
              <p className="text-sm text-muted-foreground">
                Role: {p.role}, Matched: {p.matched ? "✅" : "❌"} <br />
                {/* Feedback:{" "} {p.feedbackSubmitted ? "✅" : "❌"} */}
              </p>
            </div>
            <Button
              onClick={() => {
                router.push(`participant/programmes/${p.programmeId}/years/${p.programmeYearId}/my-details`);
              }}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
