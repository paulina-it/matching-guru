import { authenticatedFetch } from "../utils/token";

/**
 * Fetch admin dashboard data for the authenticated user.
 */
export const fetchAdminDashboard = async () => {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/admin`
  );

  if (!res.ok) {
    throw new Error("Failed to load dashboard data");
  }

  return res.json();
};

/**
 * Fetch participant dashboard data for the authenticated user.
 */
export const fetchParticipantDashboard = async () => {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/participant`
  );

  if (!res.ok) {
    throw new Error("Failed to load participant dashboard data");
  }

  return res.json();
};
