import {
  OrganisationCreateDto,
  OrganisationResponseDto,
} from "../types/organisation";
import { authenticatedFetch } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Fetch the organisation associated with the current admin user.
 */
export async function fetchAdminOrganisation(): Promise<OrganisationResponseDto | null> {
  const response = await authenticatedFetch(
    `${API_URL}/organisations/admin/organisation-status`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    } else if (response.status === 403) {
      throw new Error("Access denied: User is not an admin");
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error("Failed to fetch organisation");
    }
  }

  return response.json();
}

/**
 * Fetch organisation details by ID.
 */
export async function fetchOrganisation(id: number): Promise<OrganisationResponseDto | null> {
  const response = await authenticatedFetch(`${API_URL}/organisations/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("User not authenticated");
    } else if (response.status === 403) {
      throw new Error("Access denied");
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error("Failed to fetch organisation");
    }
  }

  return response.json();
}

/**
 * Create a new organisation and assign it to the current user.
 */
export async function createOrganisationAndAssignToUser(
  organisationData: OrganisationCreateDto
): Promise<OrganisationResponseDto> {
  const response = await authenticatedFetch(`${API_URL}/organisations/create`, {
    method: "POST",
    body: JSON.stringify(organisationData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create organisation");
  }

  const createdOrganisation = await response.json();
  window.location.reload();
  return createdOrganisation;
}

/**
 * Join an organisation using a join code.
 */
export async function joinOrganisation(joinCode: string): Promise<any> {
  const response = await authenticatedFetch(
    `${API_URL}/organisations/join?joinCode=${encodeURIComponent(joinCode)}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to join organisation");
  }

  return await response.json();
}
