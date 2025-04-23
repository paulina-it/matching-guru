"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProgrammeCard from "@/components/ProgrammeCard";
import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "@/app/api/dashboard";
import Link from "next/link";
import { CoordinatorDashboardDto } from "../types/dashboard";

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] =
    useState<CoordinatorDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchAdminDashboard();
        console.log("Dashboard data fetched:", data);
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.organisationId) loadDashboard();
  }, [user?.organisationId]);

  return (
    <div className="min-w-[60vw] bg-light m-5 dark:bg-dark dark:border dark:border-white/30 r py-10 px-6 lg:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark dark:border dark:border-white/30 rounded shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {!user?.organisationId ? (
            <p className="text-gray-500 dark:text-light/70 italic">
              Join or create an organisation to start seeing activity here.
            </p>
          ) : dashboardData?.recentActivity?.length ? (
            <ul className="text-gray-600 dark:text-light/90 space-y-2">
              {dashboardData.recentActivity.map((activity, index) => (
                <li key={index}>
                  <Link href={activity.link}>
                    {activity.description} —{" "}
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>

        {/* Queries & Notifications */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">Queries:</h3>
            <span className="text-3xl font-bold"></span>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">Notifications:</h3>
            <span className="text-3xl font-bold"></span>
          </div>
        </div> */}

        {/* Welcome Profile */}
        <div className="bg-white dark:bg-dark dark:border dark:border-white/30 rounded shadow p-6 flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold">Welcome, {user?.firstName}</h3>
          <div className="mt-4">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-semibold">
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {!user?.organisationId ? (
        <div className="bg-white dark:bg-yellow-900/20 dark:border dark:border-yellow-600 text-yellow-800 dark:text-yellow-300 rounded shadow p-6 col-span-3 text-center my-4">
          <h3 className="text-lg font-semibold mb-2">
            You're not linked to an organisation yet.
          </h3>
          <p className="mb-4">
            To start managing programmes and matches, please create your
            organisation profile.
          </p>
          <Button
            onClick={() => router.push("/coordinator/organisation")}
            className="bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-400"
          >
            Create Organisation
          </Button>
        </div>
      ) : (
        <>
          {/* Active Programmes */}
          <div className="bg-white dark:bg-dark dark:border dark:border-white/30 rounded shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Programmes</h2>
              <Button
                variant="link"
                className="text-accent"
                onClick={() => router.push("/coordinator/programmes")}
              >
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {dashboardData?.activeProgrammeYears?.length ? (
                dashboardData.activeProgrammeYears.map((programme) => (
                  <ProgrammeCard
                    key={programme.id}
                    id={programme.id}
                    programmeId={programme.programmeId}
                    name={programme.name}
                    participantsCount={programme.participantsCount}
                    matchesCount={programme.matchesCount}
                    status={programme.isActive ? "Active" : "Inactive"}
                  />
                ))
              ) : (
                <p className="text-gray-500">No active programmes</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-dark dark:border dark:border-white/30 rounded shadow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Link
              href={`/coordinator/stats/match-rates`}
              className="bg-gray-100 dark:bg-dark dark:border dark:border-white/30 rounded p-4 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <span className="text-4xl">📊</span>
              <p className="mt-2">Match Rates</p>
            </Link>

            <Link
              href={`/coordinator/stats/engagement`}
              className="bg-gray-100 dark:bg-dark dark:border dark:border-white/30 rounded p-4 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <span className="text-4xl">📈</span>
              <p className="mt-2">Engagement</p>
            </Link>

            <Link
              href={`/coordinator/stats/drop-off`}
              className="bg-gray-100 dark:bg-dark dark:border dark:border-white/30 rounded p-4 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <span className="text-4xl">📉</span>
              <p className="mt-2">Drop-off Rate</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
