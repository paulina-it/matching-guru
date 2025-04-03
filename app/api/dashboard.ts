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

export const fetchParticipantDashboard = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/participant`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load participant dashboard data");
  }

  return res.json();
};
