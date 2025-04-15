import { OrganisationEngagementStats } from "@/app/types/stats";

export const fetchMatchRateStats = async (organisationId: number) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/stats/match-rates/organisation/${organisationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch match rate statistics");
  }

  return res.json();
};

export const fetchEngagementStats = async (
  organisationId: number
): Promise<OrganisationEngagementStats> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/stats/engagement/organisation/${organisationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch engagement statistics");
  }

  return res.json();
};
