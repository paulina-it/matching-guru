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
        backgroundColor: ["rgba(75,192,192,0.4)", "rgba(255,99,132,0.4)"],
        borderColor: ["rgba(75,192,192,1)", "rgba(255,99,132,1)"],
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
    <div className="lg:min-w-[60vw] mx-auto my-12 dark:bg-dark dark:border dark:border-white/30 rounded p-5">
      <h1 className="text-3xl font-bold mb-8">📊 Match Rate Statistics</h1>

      <Card className="mb-6 p-6 flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">{stats.organisation}</h2>
          <p>Total Participants: {stats.totalParticipants}</p>
          <p>Total Matches: {stats.totalMatches}</p>
          <p className="font-medium text-primary">
            Average Match Rate: {stats.matchRatePercent.toFixed(2)}%
          </p>
        </div>
        <div style={{ maxWidth: "250px", margin: "0 auto" }}>
          <Doughnut
            data={orgMatchRateData}
            options={{ maintainAspectRatio: true }}
          />
        </div>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Programme Match Rates</h2>
        <Bar
          data={programmeMatchRateData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>

      {stats.programmes.map((programme, index) => (
        <Card
          key={index}
          className="mb-6 p-6 border border-muted dark:bg-dark dark:border dark:border-white/30 rounded"
        >
          <h3 className="text-xl font-semibold">{programme.programmeName}</h3>
          <p>Total Participants: {programme.totalParticipants}</p>
          <p>Total Matches: {programme.totalMatches}</p>
          <p className="text-primary">
            Match Rate: {programme.matchRate.toFixed(2)}%
          </p>

          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">Programme Years</h4>
            <ul className="grid gap-2">
              {programme.years.map((year, i) => (
                <li key={i} className="border px-4 py-2 rounded bg-muted/10">
                  <strong>{year.academicYear}:</strong> {year.matches} /{" "}
                  {year.participants} matched (
                  <span className="font-semibold">{year.rate.toFixed(2)}%</span>
                  )
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MatchRatesPage;
