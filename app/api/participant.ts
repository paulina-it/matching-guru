import { ParticipantCreateDto, ParticipantDto, FeedbackSubmissionDto } from "@/app/types/participant";
import { authenticatedFetch } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Create a new participant in the system.
 */
export async function createParticipant(data: ParticipantCreateDto): Promise<void> {
  const response = await authenticatedFetch(`${API_URL}/participants/create`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create participant");
  }
}

/**
 * Get a participant by ID.
 */
export async function getParticipant(id: number): Promise<ParticipantCreateDto> {
  const response = await authenticatedFetch(`${API_URL}/participants/${id}`);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch participant");
  }

  return response.json();
}

/**
 * Get participant info, returning either a match or just the participant.
 */
export async function getParticipantInfoByUserId(id: number): Promise<any | null> {
  try {
    const response = await authenticatedFetch(`${API_URL}/participants/info/${id}`);

    if (response.status === 404) {
      console.warn(`No match found for user ID: ${id}`);
      return null;
    }

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || `Failed to fetch participant (ID: ${id})`);
    }

    const data = await response.json();
    console.log("Fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching participant:", error);
    throw error;
  }
}

/**
 * Get a participant by user ID.
 */
export async function getParticipantByUserId(id: number): Promise<ParticipantDto> {
  const response = await authenticatedFetch(`${API_URL}/participants/user/${id}`);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch participant");
  }

  return response.json();
}

/**
 * Update an existing participant.
 */
export async function updateParticipant(id: number, data: ParticipantCreateDto): Promise<void> {
  const response = await authenticatedFetch(`${API_URL}/participants/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to update participant");
  }
}

/**
 * Delete a participant by ID.
 */
export async function deleteParticipant(id: number): Promise<void> {
  const response = await authenticatedFetch(`${API_URL}/participants/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to delete participant");
  }
}

/**
 * Fetches participants for a specific programme year with support for pagination, search, sorting, and filtering.
 */
export async function getParticipantsByProgrammeYearId(
  programmeYearId: number,
  page: number = 0,
  size: number = 10,
  search: string = "",
  sortBy: string = "lastName",
  sortOrder: "asc" | "desc" = "asc",
  roleFilter: string = ""
): Promise<{ content: ParticipantDto[]; totalPages: number }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    search,
    sortBy,
    sortOrder,
    role: roleFilter,
  });

  const response = await authenticatedFetch(
    `${API_URL}/participants/programme-year/${programmeYearId}?${params.toString()}`
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch participants");
  }

  return response.json();
}

/**
 * Fetches detailed participants for a specific programme year.
 */
export async function getDetailedParticipantsByProgrammeYearId(programmeYearId: number) {
  const response = await authenticatedFetch(
    `${API_URL}/participants/programme-year/detailed/${programmeYearId}`
  );

  if (!response.ok) throw new Error("Failed to fetch detailed participants");
  return response.json();
}

/**
 * Fetches detailed participant info (including match if exists) by user ID and programme year ID.
 */
export async function getParticipantInfoByUserIdAndProgrammeYearId(
  userId: number,
  programmeYearId: number
) {
  const response = await authenticatedFetch(
    `${API_URL}/participants/info/${userId}/programmeYear/${programmeYearId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(errorText);
    (error as any).status = response.status;
    (error as any).messageText = errorText;
    throw error;
  }

  return await response.json();
}

/**
 * Submits feedback code to unlock certificate.
 */
export async function submitFeedbackCode(dto: FeedbackSubmissionDto) {
  const response = await authenticatedFetch(`${API_URL}/participants/feedback`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to submit feedback.");
  }

  return await response.text();
}