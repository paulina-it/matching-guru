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

export async function fetchProgrammesByUserId(
  userId: number
): Promise<ProgrammeDto[]> {
  if (!userId || isNaN(userId)) {
    throw new Error("Invalid user ID");
  }

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/programmes/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch programmes for the user");
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

// PROGRAMME YEAR

export async function createProgrammeYear(
  data: ProgrammeYearCreateDto
): Promise<void> {
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

export async function updateProgrammeYear(
  programmeYearId: number,
  updatedData: ProgrammeYearUpdateDto
): Promise<ProgrammeYearResponseDto> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  try {
    console.table(updatedData);
    const response = await fetch(`${API_URL}/programme-years/${programmeYearId}`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`Error updating programme year: ${response.status} ${response.statusText}`);
    }

    return await response.json(); 
  } catch (error) {
    console.error("❌ Failed to update programme year:", error);
    throw error;
  }
}

export async function fetchProgrammeYears(
  id: number
): Promise<ProgrammeYearResponseDto[]> {
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

  const data: ProgrammeYearResponseDto[] = await response.json();
  return data;
}

export async function fetchProgrammeYear(
  id: number
): Promise<ProgrammeYearResponseDto> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/programme-years/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch programme year with ID: " + id);
  }

  const data: ProgrammeYearResponseDto = await response.json();

  return data;
}

export async function fetchMatchingCriteria(
  programmeYearId: number
): Promise<ProgrammeMatchingCriteriaDto[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/programme-years/${programmeYearId}/matching-criteria`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch matching criteria");
  }

  const data: ProgrammeMatchingCriteriaDto[] = await response.json();
  return data;
}

export async function fetchEligibleCourses(
  programmeId: number
): Promise<CourseDto[]> {
  if (!programmeId || isNaN(programmeId)) {
    throw new Error("Invalid programme ID");
  }

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_URL}/courses/programme/${programmeId}/eligible`,
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
    throw new Error(errorMessage || "Failed to fetch eligible courses");
  }

  return response.json();
}

export const verifyFeedbackCode = async (
  code: string,
  participantId: number,
  programmeYearId: number
): Promise<boolean> => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/participants/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code,
      participantId,
      programmeYearId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to verify code");
  }

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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/certificates/generate?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate certificate");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "certificate.png";
  link.click();

  window.URL.revokeObjectURL(url);
};

export const fetchLatestProgrammeYear = async (
  programmeId: number
): Promise<ProgrammeYearDto | null> => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/programme-years/programmes/${programmeId}/latest-year`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  if (!res.ok) return null;
  return await res.json();
};