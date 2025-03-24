import { redirect } from "next/dist/server/api-utils";
import {
  OrganisationCreateDto,
  OrganisationResponseDto,
} from "../types/organisation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchAdminOrganisation(): Promise<OrganisationResponseDto | null> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/organisations/admin/organisation-status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

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

export async function fetchOrganisation(id: number): Promise<OrganisationResponseDto | null> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/organisations/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

export async function createOrganisationAndAssignToUser(
  organisationData: OrganisationCreateDto
): Promise<OrganisationResponseDto> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/organisations/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

export async function joinOrganisation(joinCode: string): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found");

  const response = await fetch(`${API_URL}/organisations/join?joinCode=${encodeURIComponent(joinCode)}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to join organisation");
  }

  return await response.json();
}