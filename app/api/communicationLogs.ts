import {
    CommunicationLogCreateDto,
    CommunicationLogDto
  } from "../types/communicationLog";
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const BASE_URL = `${API_URL}/communication-logs`;
  
  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    
  }
  
  export async function getLogsForMatch(matchId: number): Promise<CommunicationLogDto[]> {
    const token = localStorage.getItem("token");
  
    const response = await fetch(`${API_URL}/communication-logs/match/${matchId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch communication logs");
    }
  
    return await response.json();
  }

  export async function createCommunicationLog(
    logData: CommunicationLogCreateDto
  ): Promise<CommunicationLogDto> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(logData),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to create communication log");
    }
  
    return await response.json();
  }
  
  export async function updateCommunicationLog(id: number, updates: Partial<CommunicationLogCreateDto>) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/communication-logs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  
    if (!response.ok) throw new Error("Failed to update log");
    return await response.json();
  }
  
  export async function deleteCommunicationLog(id: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/communication-logs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) throw new Error("Failed to delete log");
  }
  