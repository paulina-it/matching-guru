import {
  CourseDto,
  ProgrammeCreateDto,
  ProgrammeDto,
  ProgrammeMatchingCriteriaDto,
  ProgrammeUpdateDto,
  ProgrammeYearCreateDto,
  ProgrammeYearUpdateDto,
  ProgrammeYearResponseDto,
  ProgrammeYearDto,
} from "@/app/types/programmes";
import { authenticatedFetch } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function createProgramme(programmeData: ProgrammeCreateDto): Promise<ProgrammeDto> {
  const response = await authenticatedFetch(`${API_URL}/programmes/create`, {
    method: "POST",
    body: JSON.stringify(programmeData),
  });

  if (!response.ok) throw new Error(await response.text() || "Failed to create programme");
  return response.json();
}

export async function updateProgramme(programmeId: number, programmeData: ProgrammeUpdateDto): Promise<ProgrammeDto> {
  const response = await authenticatedFetch(`${API_URL}/programmes/${programmeId}`, {
    method: "PUT",
    body: JSON.stringify(programmeData),
  });

  if (!response.ok) throw new Error(await response.text() || "Failed to update programme");
  return response.json();
}

export async function fetchProgrammesByOrganisationId(organisationId: number): Promise<ProgrammeDto[]> {
  const response = await authenticatedFetch(`${API_URL}/programmes/organisation/${organisationId}`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch programmes");
  return response.json();
}

export async function fetchProgrammesByUserId(userId: number): Promise<ProgrammeDto[]> {
  if (!userId || isNaN(userId)) throw new Error("Invalid user ID");
  const response = await authenticatedFetch(`${API_URL}/programmes/user/${userId}`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch programmes for the user");
  return response.json();
}

export async function fetchActiveProgrammesByOrganisationId(organisationId: number): Promise<ProgrammeDto[]> {
  const response = await authenticatedFetch(`${API_URL}/programmes/organisation/${organisationId}/active`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch programmes");
  return response.json();
}

export async function fetchProgrammeById(id: number): Promise<ProgrammeDto> {
  const response = await authenticatedFetch(`${API_URL}/programmes/${id}`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch programme details");
  return response.json();
}

export async function createProgrammeYear(data: ProgrammeYearCreateDto): Promise<void> {
  const response = await authenticatedFetch(`${API_URL}/programme-years`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(await response.text() || "Failed to create programme year");
}

export async function updateProgrammeYear(programmeYearId: number, updatedData: ProgrammeYearUpdateDto): Promise<ProgrammeYearResponseDto> {
  const response = await authenticatedFetch(`${API_URL}/programme-years/${programmeYearId}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) throw new Error(`Error updating programme year: ${response.status} ${response.statusText}`);
  return response.json();
}

export async function fetchProgrammeYears(id: number): Promise<ProgrammeYearResponseDto[]> {
  const response = await authenticatedFetch(`${API_URL}/programme-years/programme/${id}`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch programme years");
  return response.json();
}

export async function fetchProgrammeYear(id: number): Promise<ProgrammeYearResponseDto> {
  const response = await authenticatedFetch(`${API_URL}/programme-years/${id}`);
  if (!response.ok) throw new Error(await response.text() || `Failed to fetch programme year with ID: ${id}`);
  return response.json();
}

export async function fetchMatchingCriteria(programmeYearId: number): Promise<ProgrammeMatchingCriteriaDto[]> {
  const response = await authenticatedFetch(`${API_URL}/programme-years/${programmeYearId}/matching-criteria`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch matching criteria");
  return response.json();
}

export async function fetchEligibleCourses(programmeId: number): Promise<CourseDto[]> {
  if (!programmeId || isNaN(programmeId)) throw new Error("Invalid programme ID");
  const response = await authenticatedFetch(`${API_URL}/courses/programme/${programmeId}/eligible`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch eligible courses");
  return response.json();
}

export const verifyFeedbackCode = async (
  code: string,
  participantId: number,
  programmeYearId: number
): Promise<boolean> => {
  const response = await authenticatedFetch(`${API_URL}/participants/feedback`, {
    method: "POST",
    body: JSON.stringify({ code, participantId, programmeYearId }),
  });

  if (!response.ok) throw new Error(await response.text() || "Failed to verify code");
  return response.json();
};

export const downloadServerCertificate = async (
  name: string,
  role: string,
  programme: string,
  year: string,
  date: string
) => {
  const params = new URLSearchParams({ name, role, programme, year, date });

  const response = await authenticatedFetch(`${API_URL}/certificates/generate?${params.toString()}`, {
    method: "GET",
  });

  if (!response.ok) throw new Error("Failed to generate certificate");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "certificate.png";
  link.click();
  window.URL.revokeObjectURL(url);
};

export const fetchLatestProgrammeYear = async (programmeId: number): Promise<ProgrammeYearDto | null> => {
  const response = await authenticatedFetch(`${API_URL}/programme-years/programmes/${programmeId}/latest-year`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) return null;
  return response.json();
};

export async function deleteProgramme(programmeId: number): Promise<void> {
  const response = await authenticatedFetch(`${API_URL}/programmes/${programmeId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error(await response.text() || "Failed to delete programme");
}

export async function fetchMyAndAvailableProgrammes(userId: number): Promise<{ myProgrammes: ProgrammeDto[]; availableProgrammes: ProgrammeDto[] }> {
  if (!userId || isNaN(userId)) throw new Error("Invalid user id");

  const response = await authenticatedFetch(`${API_URL}/programmes/participant/${userId}/my-and-available`);
  if (!response.ok) throw new Error(await response.text() || "Failed to fetch programmes");
  return response.json();
}