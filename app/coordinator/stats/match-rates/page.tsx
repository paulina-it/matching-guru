"use client";

import React, { useEffect, useState } from "react";
import { OrganisationMatchStats } from "@/app/types/stats";
import { Card } from "@/components/ui/card";
import { fetchMatchRateStats } from "@/app/api/stats";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronDown, ChevronRight } from "lucide-react";

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const MatchRatesPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrganisationMatchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProgrammes, setExpandedProgrammes] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (!user?.organisationId) return;
    if (typeof user?.organisationId !== "number") return;

    const getStats = async () => {
      try {
        const data = await fetchMatchRateStats(user.organisationId!);
        setStats(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load match rate stats");
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, [user?.organisationId]);

  const toggleProgramme = (index: number) => {
    setExpandedProgrammes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center mt-12 text-lg text-red-500">
        Failed to load statistics.
      </div>
    );
  }

  const orgMatchRateData = {
    labels: ["Matched", "Unmatched"],
    datasets: [
      {
        data: [
          stats.totalMatches,
          stats.totalParticipants - stats.totalMatches,
        ],
        backgroundColor: ["#9fcada", "#dc6a5b"], 
        borderColor: ["#549ab4", "#ba5648"], 
        borderWidth: 1,
      },
    ],
  };

  const matchStatusData = {
    labels: [
      "Accepted by Both",
      "Accepted by One Party",
      "Rejected",
      "Pending",
    ],
    datasets: [
      {
        data: [
          stats.acceptedByBoth,
          stats.acceptedByOne,
          stats.rejected,
          stats.pending,
        ],
        backgroundColor: [
          "#9fcada", 
          "#62a8d7",
          "#dc6a5b",
          "#e8c57f",
        ],
        borderColor: [
          "#549ab4", 
          "#2c7cb1", 
          "#ba5648", 
          "#c29f5a", 
        ],
        borderWidth: 1,
      },
    ],
  };

  const programmeMatchRateData = {
    labels: stats.programmes.map((programme) => programme.programmeName),
    datasets: [
      {
        label: "Match Rate (%)",
        data: stats.programmes.map((programme) => programme.matchRate),
        backgroundColor: "rgba(54,162,235,0.6)",
        borderColor: "rgba(54,162,235,1)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="lg:min-w-[70vw] mx-auto my-[4em] bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-5">
      <h1 className="text-3xl font-bold mb-8">📊 Match Rate Statistics</h1>

      <Card className="mb-6 p-6 flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">{stats.organisation}</h2>
          <p>Total Participants: {stats.totalParticipants}</p>
          <p>Matched Participants: {stats.totalMatches}</p>
          <p className="font-medium text-3xl text-primary">
            Average Match Rate: <br /> {stats.matchRatePercent.toFixed(2)}%
          </p>
          <p className="font-medium text-lg mt-4">
            Accepted: {stats.totalAccepted} (
            <span className="text-secondary font-semibold">
              {stats.overallAcceptRate?.toFixed(2)}%
            </span>
            ) <br />
            Rejected: {stats.totalRejected} (
            <span className="text-accent font-semibold">
              {stats.overallRejectRate?.toFixed(2)}%
            </span>
            )
          </p>
        </div>
        <div style={{ maxWidth: "250px", margin: "0 auto" }}>
          <Doughnut
            data={orgMatchRateData}
            options={{ maintainAspectRatio: true }}
          />
        </div>

        <div style={{ maxWidth: "250px", margin: "1rem auto 0" }}>
          <Doughnut
            data={matchStatusData}
            options={{
              maintainAspectRatio: true,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
          />
        </div>
      </Card>

      <div className="mb-8 bg-white rounded dark:bg-dark dark:border dark:border-white p-6">
        <h2 className="text-2xl font-semibold mb-4">Programme Match Rates</h2>
        <Bar
          data={programmeMatchRateData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {stats.programmes.map((programme, index) => {
          const isExpanded = expandedProgrammes.has(index);

          return (
            <Card
              key={index}
              className="mb-6 p-6 border border-muted dark:bg-dark dark:border dark:border-white/30 rounded"
            >
              <h3 className="text-xl font-semibold">
                {programme.programmeName}
              </h3>
              <p>Total Participants: {programme.totalParticipants}</p>
              <p>Total Matches: {programme.totalMatches}</p>
              <p className="text-primary">
                Match Rate: {programme.matchRate.toFixed(2)}%
              </p>
              <p>
                Accepted: {programme.accepted ?? 0} (
                <span className="text-secondary font-semibold">
                  {(programme.acceptRate ?? 0).toFixed(2)}%
                </span>
                )
              </p>
              <p>
                Rejected: {programme.rejected ?? 0} (
                <span className="text-accent font-semibold">
                  {(programme.rejectRate ?? 0).toFixed(2)}%
                </span>
                )
              </p>

              <div className="mt-4">
                <button
                  onClick={() => toggleProgramme(index)}
                  className="flex items-center gap-2 text-accent hover:underline"
                >
                  {isExpanded ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                  {isExpanded ? "Hide Years" : "Show Years"}
                </button>

                {isExpanded && (
                  <ul className="grid gap-2 mt-3">
                    {programme.years.map((year, i) => (
                      <li
                        key={i}
                        className="border px-4 py-2 rounded bg-muted/10"
                      >
                        <strong>{year.academicYear}:</strong> {year.matches} /{" "}
                        {year.participants} matched (
                        <span className="font-semibold">
                          {year.rate.toFixed(2)}%
                        </span>
                        )
                        <div className="text-sm mt-1 ml-2 space-y-1">
                          <p>
                            Accepted: {year.accepted ?? 0} (
                            <span className="text-secondary font-medium">
                              {(year.acceptRate ?? 0).toFixed(1)}%
                            </span>
                            )
                          </p>
                          <p>
                            Rejected: {year.rejected ?? 0} (
                            <span className="text-accent font-medium">
                              {(year.rejectRate ?? 0).toFixed(1)}%
                            </span>
                            )
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MatchRatesPage;
