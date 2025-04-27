import {
  OrganisationDemographicStats,
  OrganisationEngagementStats,
} from "@/app/types/stats";
import { authenticatedFetch } from "../utils/token";

/**
 * Fetches match rate statistics for a given organisation.
 */
export const fetchMatchRateStats = async (organisationId: number) => {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/stats/match-rates/organisation/${organisationId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch match rate statistics");
  }

  return res.json();
};

/**
 * Fetches engagement statistics for a given organisation.
 */
export const fetchEngagementStats = async (
  organisationId: number
): Promise<OrganisationEngagementStats> => {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/stats/engagement/organisation/${organisationId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch engagement statistics");
  }

  return res.json();
};

/**
 * Returns demographic-breakdown statistics for the current organisation.
 */
export async function fetchDemographicStats(
  organisationId: number
): Promise<OrganisationDemographicStats> {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/stats/demographics/organisation/${organisationId}`
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<OrganisationDemographicStats>;
}
