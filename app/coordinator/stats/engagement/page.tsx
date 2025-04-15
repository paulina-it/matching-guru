"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/app/context/AuthContext";
import { fetchEngagementStats } from "@/app/api/stats";
import { OrganisationEngagementStats } from "@/app/types/stats";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const EngagementStatsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrganisationEngagementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof user?.organisationId !== "number") return;

    const getStats = async () => {
      try {
        const data = await fetchEngagementStats(user.organisationId!);
        setStats(data);
      } catch (error) {
        toast.error("Failed to load engagement stats");
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

  if (!stats || !stats.programmes?.length) {
    return (
      <div className="text-center mt-12 text-lg text-red-500">
        Failed to load engagement statistics.
      </div>
    );
  }

  // Flatten all years into one for org-wide overview
  const allYears = stats.programmes.flatMap((p) => p.years);

  const totalParticipants = allYears.reduce((acc, y) => acc + y.participants, 0);
  const totalMentors = allYears.reduce((acc, y) => acc + y.mentors, 0);
  const totalMentees = allYears.reduce((acc, y) => acc + y.mentees, 0);
  const totalBoth = allYears.reduce((acc, y) => acc + y.bothRoles, 0);
  const totalInactive = allYears.reduce((acc, y) => acc + y.inactivePairs, 0);
  const totalFeedback = allYears.reduce((acc, y) => acc + y.feedbackSubmitted, 0);

  const avgInteractions = (
    allYears.reduce((acc, y) => acc + y.avgInteractionsPerMatch, 0) /
    allYears.length
  ).toFixed(1);

  const combinedComm: Record<string, number> = {};
  allYears.forEach((y) => {
    Object.entries(y.communicationBreakdown).forEach(([type, count]) => {
      combinedComm[type] = (combinedComm[type] || 0) + count;
    });
  });

  const combinedWeekly = allYears
    .flatMap((y) => y.weeklyEngagement)
    .reduce<Record<string, number>>((acc, point) => {
      acc[point.week] = (acc[point.week] || 0) + point.interactions;
      return acc;
    }, {});

  const communicationTypeData = {
    labels: Object.keys(combinedComm),
    datasets: [
      {
        label: "Interactions",
        data: Object.values(combinedComm),
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  const weeklyInteractionData = {
    labels: Object.keys(combinedWeekly),
    datasets: [
      {
        label: "Interactions",
        data: Object.values(combinedWeekly),
        fill: false,
        borderColor: "#4BC0C0",
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="lg:min-w-[60vw] mx-auto my-12 dark:bg-dark dark:border dark:border-white/30 rounded p-5">
      <h1 className="text-3xl font-bold mb-8">📈 Engagement Statistics</h1>

      <Card className="mb-6 p-6">
        <h2 className="text-2xl font-semibold mb-4">User Activity Overview</h2>
        <p>Total Users Joined: {totalParticipants}</p>
        <p>
          Mentors: {totalMentors} | Mentees: {totalMentees} | Both: {totalBoth}
        </p>
        <p>Feedback Submitted: {totalFeedback}</p>
        <p>Inactive Matches (no interaction `{'>'}` 14 days): {totalInactive}</p>
        <p>Average Interactions per Match: {avgInteractions}</p>
      </Card>

      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Communication Breakdown</h2>
        <Doughnut data={communicationTypeData} />
      </Card>

      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Engagement Trend</h2>
        <Line data={weeklyInteractionData} />
      </Card>
    </div>
  );
};

export default EngagementStatsPage;
