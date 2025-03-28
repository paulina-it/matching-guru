export const fetchAdminDashboard = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/admin`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load dashboard data");
  }

  return res.json();
};

export type CoordinatorDashboardDto = {
  recentActivity: { description: string; timestamp: string; link: string }[];
  activeProgrammeYears: {
    id: number;
    programmeId: number;
    name: string;
    participantsCount: number;
    matchesCount: number;
    active: boolean;
  }[];
};
