import { ParticipantCreateDto, ParticipantDto } from "@/app/types/participant";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
/**
 * Create a new participant in the system.
 *
 * @param data - The participant creation data.
 * @throws An error if the request fails.
 */
export async function createParticipant(
  data: ParticipantCreateDto
): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/participants/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create participant");
  }
}

/**
 * Get a participant by ID.
 *
 * @param id - The ID of the participant.
 * @returns The participant data.
 */
export async function getParticipant(
  id: number
): Promise<ParticipantCreateDto> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/participants/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch participant");
  }

  return response.json();
}

/**
 * Get participant info, returning either a match or just the participant.
 *
 * @param id - The participant's user ID.
 * @returns The participant's data or match info.
 */
export async function getParticipantInfoByUserId(id: number): Promise<any | null> {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/participants/info/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      // Gracefully handle unmatched participant
      console.warn(`No match found for user ID: ${id}`);
      return null;
    }

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        errorMessage || `Failed to fetch participant (ID: ${id})`
      );
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
 *
 * @param id - The ID of the user.
 * @returns The participant data.
 */
export async function getParticipantByUserId(
  id: number
): Promise<ParticipantDto> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/participants/user/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch participant");
  }

  return response.json();
}

/**
 * Update an existing participant.
 *
 * @param id - The ID of the participant.
 * @param data - The updated participant data.
 * @throws An error if the request fails.
 */
export async function updateParticipant(
  id: number,
  data: ParticipantCreateDto
): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/participants/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to update participant");
  }
}

/**
 * Delete a participant by ID.
 *
 * @param id - The ID of the participant.
 * @throws An error if the request fails.
 */
export async function deleteParticipant(id: number): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/participants/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to delete participant");
  }
}

/**
 * Fetches participants for a specific programme year with support for pagination, search, sorting, and filtering.
 *
 * @param programmeYearId - The ID of the programme year.
 * @param page - The current page number (starting from 0).
 * @param size - Number of participants per page.
 * @param search - Optional search query to filter by participant name or email.
 * @param sortBy - The field to sort by (e.g., "userName", "userEmail", "academicStage").
 * @param sortOrder - The sorting order: "asc" for ascending or "desc" for descending.
 * @param roleFilter - Optional role filter ("MENTOR", "MENTEE", or empty string for all).
 * @returns A paginated list of participants matching the given criteria.
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
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    search,
    sortBy,
    sortOrder,
    role: roleFilter,
  });

  const response = await fetch(
    `${API_URL}/participants/programme-year/${programmeYearId}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch participants");
  }

  return response.json();
}

/**
 * Fetches detailed participants for a specific programme year.
 *
 * @param programmeYearId - The ID of the programme year.
 * @returns A list of detailed participants.
 */
export async function getDetailedParticipantsByProgrammeYearId(
  programmeYearId: number
) {
  const token = localStorage.getItem("token");

  const res = await fetch(
     `${API_URL}/participants/programme-year/detailed/${programmeYearId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch detailed participants");
  return res.json();
}

/**
 * Fetches detailed participant info (including match if exists) by user ID and programme year ID.
 *
 * @param userId - The ID of the user.
 * @param programmeYearId - The ID of the programme year.
 * @returns A promise resolving to either a ParticipantResponseDto or a DetailedMatchResponseDto.
 */
export async function getParticipantInfoByUserIdAndProgrammeYearId(
  userId: number,
  programmeYearId: number
) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/participants/info/${userId}/programmeYear/${programmeYearId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("An error occurred while fetching participant");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching participant:", error);
    throw error;
  }
}
