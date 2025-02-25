const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// DTOs for Course Group and Course
export interface CourseGroupCreateDto {
  name: string;
  organisationId: number;
}

export interface CourseCreateDto {
  name: string;
  type: string;
  duration: number;
  groupId: number;
}

// Create a Course Group
export async function createCourseGroup(
  courseGroupData: CourseGroupCreateDto
): Promise<any> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/course-groups/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(courseGroupData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create course group");
  }

  return response.json();
}

// Create a Course
export async function createCourse(
  courseData: CourseCreateDto
): Promise<any> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/courses/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create course");
  }

  return response.json();
}

// Fetch Course Groups by Organisation ID
export async function fetchCourseGroupsByOrganisationId(
    organisationId: number
  ): Promise<any[]> {
    const token = localStorage.getItem("token"); 
  
    console.log("Fetching")
    const response = await fetch(
      `${API_URL}/course-groups/organisation/${organisationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", 
        },
      }
    );
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to fetch course groups");
    }
  
    const data = await response.json();

    console.table(data);
  
    // Map data to ensure a consistent structure
    return data.map((courseGroup: any) => ({
      id: courseGroup.id,
      name: courseGroup.name,
      organisationId: courseGroup.organisationId,
      courses: courseGroup.courses || [], // Ensure courses is always an array
    }));
  }
  