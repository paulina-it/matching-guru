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
      return { success: false, message: `Error: ${response.status} - ${errorText}` };
    }

    return { success: true, message: "Matching process started successfully!" };
  } catch (error: any) {
    return { success: false, message: `Network error: ${error.message}` };
  }
}


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

export async function updateMatchStatus(
  matchIds: number[],
  status: "APPROVED" | "DECLINED"
): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");
  // console.log(token);
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
    }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to update match status: ${response.statusText}`);
  }
}
