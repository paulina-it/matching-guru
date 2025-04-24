const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Starts the matching process for a given programme year.
 */
export async function matchParticipants(
  id: number,
  isInitial: boolean,
  algorithm: "gale-shapley" | "brace" | "collaborative-filtering"
): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const url = new URL(`${API_URL}/api/matching/${algorithm}/run`);
  url.searchParams.append("programmeId", id.toString());
  url.searchParams.append("isInitial", isInitial ? "true" : "false");

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Error: ${response.status} - ${errorText}`,
      };
    }

    return { success: true, message: "Matching process started successfully!" };
  } catch (error: any) {
    return { success: false, message: `Network error: ${error.message}` };
  }
}

/**
 * Fetch matches for a given programme year.
 */
export async function fetchMatchesByProgrammeYearId(
  id: number,
  page: number,
  size: number,
  query: string = "",
  sortBy: string = "updatedAt",
  sortOrder: string = "desc",
  status: string = ""
): Promise<{ matches: any[]; totalPages: number }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const url = new URL(`${API_URL}/api/matches/search`);
  url.searchParams.append("programmeYearId", id.toString());
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());
  if (query) url.searchParams.append("query", query);
  if (sortBy) url.searchParams.append("sortBy", sortBy);
  if (sortOrder) url.searchParams.append("sortOrder", sortOrder);
  if (status) url.searchParams.append("status", status);

  console.log(url.searchParams);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    matches: data.content || [],
    totalPages: data.totalPages || 1,
  };
}

/**
 * Fetch detailed info about a given match. (Coordinator view)
 */
export async function fetchDetailedMatchById(matchId: number): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const url = new URL(`${API_URL}/api/matches/detailed/${matchId}`);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch detailed info about matches allocated to a given participant. (Participant view)
 */
export async function fetchDetailedMatchByParticipantId(
  id: number
): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/api/matches/detailed/participant/${id}`
  );

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Submit a coordinator's match decision (approve/decline).
 */
export async function updateMatchStatus(
  matchIds: number[],
  status: "APPROVED" | "DECLINED",
  editedByUserId: number,
  reason?: string,
): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  console.log("Updating matches with:", JSON.stringify({ matchIds, status }));

  const url = `${API_URL}/api/matches/update-status`;

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      matchIds,
      status,
      rejectionReason: status === "DECLINED" ? reason : undefined,
      editedByUserId
    }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to update match status: ${response.statusText}`);
  }
}

/**
 * Reset/delete all matches for a given programme year.
 */
export const deleteProgrammeYearMatches = async (programmeYearId: number) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/matches/programmeYear/${programmeYearId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to delete matches.");
  }

  return await response.text();
};

/**
 * Submit a participant's match decision (accept/reject).
 */
export async function submitMatchDecision({
  matchId,
  decision,
  userId,
  rejectionReason,
}: {
  matchId: number;
  decision: "ACCEPTED" | "REJECTED";
  userId: number;
  rejectionReason?: string;
}): Promise<string> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const response = await fetch(`${API_URL}/api/matches/decision`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      matchId,
      decision,
      userId,
      rejectionReason,
    }),
    credentials: "include",
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Failed to submit decision: ${msg}`);
  }

  return await response.text();
}
