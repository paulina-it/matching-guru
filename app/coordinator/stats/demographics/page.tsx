"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { fetchDemographicStats } from "@/app/api/stats";
import { OrganisationDemographicStats } from "@/app/types/stats";
import { Card } from "@/components/ui/card";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { ChevronDown, ChevronRight } from "lucide-react";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const fmt = (t: string) =>
  t
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

const stageColours: Record<string, string> = {
  FOUNDATION: "#9fcada",
  FIRST_YEAR: "#62a8d7",
  SECOND_YEAR: "#549ab4",
  PLACEMENT: "#25505f",
  FINAL_YEAR: "#B89A5E",
  INCOMING: "#ba5648",
  GRADUATE: "#80261a",
  PG_MASTERS: "#967E4D",
  PG_PHD: "#5a431d",
};

const groupColours = [
  "#62a8d7",
  "#ba5648",
  "#B89A5E",
  "#25505f",
  "#9fcada",
  "#967E4D",
  "#705D3B",
  "#80261a",
  "#5a431d",
  "#4e7d8c",
];

export default function DemographicStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrganisationDemographicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user?.organisationId) return;
    fetchDemographicStats(user.organisationId)
      .then(setStats)
      .catch(err => toast.error(err.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, [user?.organisationId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <PulseLoader color="#62a8d7" />
      </div>
    );

  if (!stats)
    return (
      <p className="text-center mt-12 text-red-500">
        No demographic data found
      </p>
    );

  const stageKeys = Object.keys(stageColours);
  const groupData = [...stats.courseGroupDistribution].sort(
    (a, b) => b.count - a.count
  );

  const courseGroupConfig = {
    labels: groupData.map(g => fmt(g.group)),
    datasets: [
      {
        data: groupData.map(g => g.count),
        backgroundColor: groupData.map(
          (_, i) => groupColours[i % groupColours.length]
        ),
        borderWidth: 0,
      },
    ],
  };

  const stageConfig = {
    labels: stageKeys.map(fmt),
    datasets: [
      {
        data: stageKeys.map(
          k => stats.stageDistribution.find(s => s.stage === k)?.count ?? 0
        ),
        backgroundColor: stageKeys.map(k => stageColours[k]),
        borderWidth: 0,
      },
    ],
  };

  const stageBar = {
    labels: stats.programmes.map(p => p.programmeName),
    datasets: stageKeys.map(k => ({
      label: fmt(k),
      backgroundColor: stageColours[k],
      data: stats.programmes.map(p => {
        const tot = p.years.reduce((a, y) => a + y.totalParticipants, 0);
        const cnt = p.years.reduce(
          (a, y) =>
            a + (y.stageDistribution.find(s => s.stage === k)?.count || 0),
          0
        );
        return tot ? (cnt * 100) / tot : 0;
      }),
    })),
  };

  return (
    <div className="lg:min-w-[75vw] bg-light mx-auto my-12 dark:bg-dark dark:border dark:border-white/30 rounded p-6">
      <h1 className="text-3xl font-bold mb-10">🎓 Participant Demographics</h1>

      {/* doughnuts */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-center mb-1">Course Groups</h2>
          <div className="h-64 mx-auto">
            <Doughnut
              data={courseGroupConfig}
              options={{
                plugins: { legend: { position: "right" } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-center mb-1">Academic Stage</h2>
          <div className="h-56 mt-5 mx-auto">
            <Doughnut
              data={stageConfig}
              options={{
                plugins: { legend: { position: "right" } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </Card>
      </div>

      {/* stacked bar */}
      <Card className="p-6 mb-10">
        <h2 className="text-xl font-bold mb-4">
          Stage Distribution by Programme
        </h2>
        <Bar
          data={stageBar}
          options={{
            responsive: true,
            interaction: { mode: "index", intersect: false },
            plugins: { legend: { position: "bottom" } },
            scales: {
              y: {
                beginAtZero: true,
                stacked: true,
                ticks: { callback: v => `${v}%` },
              },
              x: { stacked: true },
            },
          }}
        />
      </Card>

      {/* expandable per-programme details */}
      <div className="grid lg:grid-cols-2 gap-6">
        {stats.programmes.map((prog, idx) => {
          const isOpen = open.has(idx);
          return (
            <Card key={idx} className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{prog.programmeName}</h3>
                <button
                  className="text-accent hover:underline flex items-center gap-1"
                  onClick={() =>
                    setOpen(prev => {
                      const n = new Set(prev);
                      n.has(idx) ? n.delete(idx) : n.add(idx);
                      return n;
                    })
                  }
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {isOpen ? "Hide years" : "Show years"}
                </button>
              </div>

              {isOpen && (
                <ul className="space-y-4 mt-2">
                  {prog.years.map(y => {
                    const groups = [...y.courseGroupDistribution].sort(
                      (a, b) => b.count - a.count
                    );
                    const stages = [...y.stageDistribution].sort(
                      (a, b) => b.count - a.count
                    );

                    return (
                      <li
                        key={y.academicYear}
                        className="border rounded p-4 text-sm space-y-3"
                      >
                        <div className="flex justify-between">
                          <p className="font-medium">{y.academicYear}</p>
                          <span className="text-muted-foreground">
                            Total:&nbsp;<strong>{y.totalParticipants}</strong>
                          </span>
                        </div>

                        {/* course-group table */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Course groups
                            </p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-left text-muted-foreground">
                                  <th className="py-1">Group</th>
                                  <th className="py-1 text-right">n</th>
                                  <th className="py-1 text-right">%</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groups.map(g => {
                                  const pct = y.totalParticipants
                                    ? (
                                        (g.count / y.totalParticipants) *
                                        100
                                      ).toFixed(1)
                                    : "0.0";
                                  return (
                                    <tr key={g.group} className="border-t">
                                      <td className="py-1">{fmt(g.group)}</td>
                                      <td className="py-1 text-right">
                                        {g.count}
                                      </td>
                                      <td className="py-1 text-right">{pct}%</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* academic-stage table */}
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Academic stage
                            </p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-left text-muted-foreground">
                                  <th className="py-1">Stage</th>
                                  <th className="py-1 text-right">n</th>
                                  <th className="py-1 text-right">%</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stages.map(s => {
                                  const pct = y.totalParticipants
                                    ? (
                                        (s.count / y.totalParticipants) *
                                        100
                                      ).toFixed(1)
                                    : "0.0";
                                  return (
                                    <tr key={s.stage} className="border-t">
                                      <td className="py-1">{fmt(s.stage)}</td>
                                      <td className="py-1 text-right">
                                        {s.count}
                                      </td>
                                      <td className="py-1 text-right">{pct}%</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
