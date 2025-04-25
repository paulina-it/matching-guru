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
import { Bar, Doughnut, Line } from "react-chartjs-2";

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
    if (!user?.organisationId) return;

    const getStats = async () => {
      try {
        const data = await fetchEngagementStats(user.organisationId!);
        setStats(data);
      } catch {
        toast.error("Failed to load engagement stats");
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, [user?.organisationId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <PulseLoader color="#549ab4" />
      </div>
    );

  if (!stats || !stats.programmes?.length)
    return (
      <div className="text-center mt-12 text-lg text-red-500">
        Failed to load engagement statistics
      </div>
    );

  const allYears = stats.programmes.flatMap((p) => p.years);

  const sum = <K extends keyof (typeof allYears)[number]>(key: K) =>
    allYears.reduce((acc, y) => acc + (y[key] as number), 0);

  const totalParticipants = sum("participants");
  const totalInactive = sum("inactivePairs");
  const totalFeedback = sum("feedbackSubmitted");

  const avgInteractions =
    allYears.reduce((a, y) => a + y.avgInteractionsPerMatch, 0) /
    (allYears.length || 1);

  const combinedComm: Record<string, number> = {};
  const combinedWeekly: Record<string, number> = {};

  allYears.forEach((y) => {
    Object.entries(y.communicationBreakdown).forEach(([type, c]) => {
      combinedComm[type] = (combinedComm[type] || 0) + c;
    });
    y.weeklyEngagement.forEach((p) => {
      combinedWeekly[p.week] = (combinedWeekly[p.week] || 0) + p.interactions;
    });
  });

  const communicationTypeData = {
    labels: Object.keys(combinedComm),
    datasets: [
      {
        label: "Interactions",
        data: Object.values(combinedComm),
        backgroundColor: [
          "#62a8d7", // secondary
          "#ba5648", // accent
          "#B89A5E", // highlight
          "#25505f", // dark primary
          "#9fcada", // primary
        ],
        borderColor: "#FFFFFF",
        borderWidth: 1,
      },
    ],
  };

  const weeklyInteractionData = {
    labels: Object.keys(combinedWeekly),
    datasets: [
      {
        label: "Interactions",
        data: Object.values(combinedWeekly),
        borderColor: "#62a8d7",
        backgroundColor: "#62a8d7",
        tension: 0.3,
      },
    ],
  };

  const avgInteractionsData = {
    labels: stats.programmes.map((p) => p.programmeName),
    datasets: [
      {
        label: "Avg interactions / match",
        data: stats.programmes.map((p) => {
          const total = p.years.reduce(
            (a, y) => a + y.avgInteractionsPerMatch,
            0
          );
          return total / (p.years.length || 1);
        }),
        backgroundColor: "#549ab4",
        borderRadius: 5,
      },
    ],
  };

  const academicYears = Array.from(
    new Set(allYears.map((y) => y.academicYear))
  ).sort();
  const programmes = stats.programmes.map((p) => p.programmeName);

  const yearColours = ["#62a8d7", "#ba5648", "#B89A5E", "#25505f", "#9fcada"];

  const feedbackByYearData = {
    labels: programmes,
    datasets: academicYears.map((yr, idx) => ({
      label          : yr,
      backgroundColor: yearColours[idx % yearColours.length],
      borderColor    : yearColours[idx % yearColours.length],
      borderWidth    : 1,
      data: programmes.map(name => {
        const yearRec = stats.programmes
          .find(p => p.programmeName === name)
          ?.years.find(y => y.academicYear === yr);
  
        if (!yearRec || yearRec.participants === 0) return null;
        return (yearRec.feedbackSubmitted / yearRec.participants) * 100;
      })
    }))
  };
  
  return (
    <div className="lg:min-w-[75vw] bg-light mx-auto my-[4em] dark:bg-dark dark:border dark:border-white/30 rounded p-5">
      <h1 className="text-3xl font-bold mb-8">📈 Engagement Statistics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            🔎 Organisation Overview
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <Stat
              label="Participants"
              value={totalParticipants}
              color="primary"
            />
            <Stat
              label="  Average interactions/match&nbsp;"
              value={avgInteractions.toFixed(2)}
              color="secondary"
            />
          </div>

          <Ratio
            label="Feedback completion"
            numerator={totalFeedback}
            denominator={totalParticipants}
            colourClass="bg-accent"
          />

          <Ratio
            label="Inactive pairs"
            numerator={totalInactive}
            denominator={totalParticipants / 2}
            colourClass="bg-highlight"
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            🧾 Communication Breakdown
          </h2>
          <div className="w-[350px] h-[240px] mx-auto">
            <Doughnut
              data={communicationTypeData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" },
                },
              }}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          📘 Programme Interactions
        </h2>
        <Bar data={avgInteractionsData} />
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          📅 Weekly Engagement Trend
        </h2>
        <Line data={weeklyInteractionData} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          📊 Year-on-Year Feedback&nbsp;by Programme
        </h2>

        <Bar
          data={feedbackByYearData}
          options={{
            responsive: true,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: { position: "bottom" },
              tooltip: {
                callbacks: {
                  label: ctx => {
                    const v = ctx.parsed.y;
                    if (v === null) return "";               
                    return `${ctx.dataset.label}: ${v.toFixed(1)} %`;
                  }
                }
              }               
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (v) => `${v}%` },
                title: { display: true, text: "Feedback completion (%)" },
              },
              x: {
                title: { display: true, text: "Programme" },
                stacked: false, // grouped bars
              },
            },
          }}
        />
      </Card>
    </div>
  );
};

export default EngagementStatsPage;

type RatioProps = {
  label: string;
  numerator: number;
  denominator: number;
  colourClass: string;
};

const Ratio = ({ label, numerator, denominator, colourClass }: RatioProps) => {
  const pct = denominator ? (numerator / denominator) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-muted rounded">
        <div
          className={`${colourClass} h-full rounded`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
};

type StatProps = {
  label: string;
  value: number | string;
  color?: "primary" | "secondary";
};

const Stat = ({ label, value, color = "primary" }: StatProps) => (
  <div className="space-y-1">
    <p className="text-muted-foreground text-sm">{label}</p>
    <p
      className={`text-3xl font-bold tracking-tight ${
        color === "primary"
          ? "text-primary"
          : color === "secondary"
          ? "text-secondary"
          : "text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);
