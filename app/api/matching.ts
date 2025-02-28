const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Starts the matching process for a given programme year.
 */
export async function matchParticipants(id: number, isInitial: boolean): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const url = new URL(`${API_URL}/api/matching/run`);
  url.searchParams.append("programmeId", id.toString());
  url.searchParams.append("isInitial", isInitial ? "true" : "false"); 

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  console.log("✅ Matching process started successfully.");
}

export async function fetchMatchesByProgrammeYearId(id: number, page: number, size: number): Promise<{ matches: any[]; totalPages: number }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const url = new URL(`${API_URL}/api/matching/${id}`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());

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
  console.table(data.content);
  
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

export async function fetchDetailedMatchByParticipantId(id: number): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/detailed/participant/${id}`);

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
