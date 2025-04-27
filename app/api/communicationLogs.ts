import {
  CommunicationLogCreateDto,
  CommunicationLogDto
} from "../types/communicationLog";
import { getToken, authenticatedFetch } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const BASE_URL = `${API_URL}/communication-logs`;

/**
 * Get all communication logs related to a specific match.
 */
export async function getLogsForMatch(matchId: number): Promise<CommunicationLogDto[]> {
  if (!getToken()) {
    throw new Error("Authentication error: No token found");
  }

  const response = await authenticatedFetch(`${BASE_URL}/match/${matchId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch communication logs");
  }

  return await response.json();
}

/**
 * Create a new communication log entry.
 */
export async function createCommunicationLog(
  logData: CommunicationLogCreateDto
): Promise<CommunicationLogDto> {
  const response = await authenticatedFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(logData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create communication log");
  }

  return await response.json();
}

/**
 * Update an existing communication log entry.
 */
export async function updateCommunicationLog(
  id: number,
  updates: Partial<CommunicationLogCreateDto>
): Promise<CommunicationLogDto> {
  if (!getToken()) {
    throw new Error("Authentication error: No token found");
  }

  const response = await authenticatedFetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update log");
  }

  return await response.json();
}

/**
 * Delete a communication log entry.
 */
export async function deleteCommunicationLog(id: number): Promise<void> {
  if (!getToken()) {
    throw new Error("Authentication error: No token found");
  }

  const response = await authenticatedFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete log");
  }
}
