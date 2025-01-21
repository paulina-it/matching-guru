import {
  CourseDto,
  ProgrammeCreateDto,
  ProgrammeDto,
  ProgrammeMatchingCriteriaDto,
  ProgrammeUpdateDto,
  ProgrammeYearCreateDto,
  ProgrammeYearDto,
} from "@/app/types/programmes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create a Programme
export async function createProgramme(
  programmeData: ProgrammeCreateDto
): Promise<ProgrammeDto> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/programmes/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(programmeData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create programme");
  }

  return response.json();
}

// Update a Programme
export async function updateProgramme(
  programmeId: number,
  programmeData: ProgrammeUpdateDto
): Promise<ProgrammeDto> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/programmes/${programmeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(programmeData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to update programme");
  }

  return response.json();
}

export async function fetchProgrammesByOrganisationId(
  organisationId: number
): Promise<ProgrammeDto[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/programmes/organisation/${organisationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch programmes");
  }

  return response.json();
}

export async function fetchActiveProgrammesByOrganisationId(
  organisationId: number
): Promise<ProgrammeDto[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/programmes/organisation/${organisationId}/active`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch programmes");
  }

  return response.json();
}

export async function fetchProgrammeById(id: number): Promise<ProgrammeDto> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/programmes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch programme details");
  }

  return response.json();
}

export async function createProgrammeYear(data: ProgrammeYearCreateDto): Promise<void> {
  const token = localStorage.getItem("token"); 

  console.log(data);

  const response = await fetch(`${API_URL}/programme-years`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create programme year");
  }
}

export async function fetchProgrammeYears(id: number): Promise<ProgrammeYearDto[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/programme-years/programme/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch programme years");
  }

  const data: ProgrammeYearDto[] = await response.json();
  return data;
}

export async function fetchMatchingCriteria(programmeYearId: number): Promise<ProgrammeMatchingCriteriaDto[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/programme-years/${programmeYearId}/matching-criteria`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch matching criteria");
  }

  const data: ProgrammeMatchingCriteriaDto[] = await response.json();
  return data;
}

export async function fetchEligibleCourses(programmeId: number): Promise<CourseDto[]> {
  if (!programmeId || isNaN(programmeId)) {
    throw new Error("Invalid programme ID");
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/courses/programme/${programmeId}/eligible`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch eligible courses");
  }

  return response.json();
}
