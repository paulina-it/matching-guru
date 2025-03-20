"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProgrammeCard from "@/components/ProgrammeCard";

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  const activeProgrammes = [
    {
      id: 1,
      name: "Peer Mentoring Spring 2025",
      participantCount: 120,
      matchCount: 60,
      status: "Active",
    },
    {
      id: 2,
      name: "Professional Development 2025",
      participantCount: 80,
      matchCount: 40,
      status: "Active",
    },
    // more programme data...
  ];
  
  return (
    <div className="min-w-[60vw] bg-light py-10 px-6 lg:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="bg-white rounded shadow p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="text-gray-600">
            {/* <li>John Doe joined as mentor.</li>
            <li>New programme created.</li>
            <li>5 new mentee applications.</li> */}
          </ul>
        </div>

        {/* Queries & Notifications */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">Queries</h3>
            <span className="text-3xl font-bold"></span>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <span className="text-3xl font-bold"></span>
          </div>
        </div>

        {/* Welcome Profile */}
        <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
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

      {/* Active Programmes */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Programmes</h2>
          <Button
            variant="link"
            className="text-accent"
            onClick={() => router.push("/coordinator/programmes")}
          >
            View all
          </Button>
        </div>
        <div className="space-y-3">
        {activeProgrammes.map((programme) => (
          <ProgrammeCard
            key={programme.id}
            id={programme.id}
            name={programme.name}
            participantCount={programme.participantCount}
            matchCount={programme.matchCount}
            status={programme.status as "Active" | "Inactive" | "Upcoming"}
          />
        ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded shadow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-100 rounded p-4 flex flex-col items-center justify-center">
          <span className="text-4xl">📊</span>
          <p className="mt-2">Match Rate</p>
        </div>
        <div className="bg-gray-100 rounded p-4 flex flex-col items-center justify-center">
          <span className="text-4xl">📈</span>
          <p className="mt-2">Engagement</p>
        </div>
        <div className="bg-gray-100 rounded p-4 flex flex-col items-center justify-center">
          <span className="text-4xl">📉</span>
          <p className="mt-2">Drop-off Rate</p>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
