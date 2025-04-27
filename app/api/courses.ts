import { authenticatedFetch } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Data structure for creating a Course Group.
 */
export interface CourseGroupCreateDto {
  name: string;
  organisationId: number;
}

/**
 * Data structure for creating a Course.
 */
export interface CourseCreateDto {
  name: string;
  type: string;
  duration: number;
  groupId: number;
}

/**
 * Create a new course group.
 */
export async function createCourseGroup(
  courseGroupData: CourseGroupCreateDto
): Promise<any> {
  const response = await authenticatedFetch(`${API_URL}/course-groups/create`, {
    method: "POST",
    body: JSON.stringify(courseGroupData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create course group");
  }

  return response.json();
}

/**
 * Create a new course within a group.
 */
export async function createCourse(
  courseData: CourseCreateDto
): Promise<any> {
  const response = await authenticatedFetch(`${API_URL}/courses/create`, {
    method: "POST",
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create course");
  }

  return response.json();
}

/**
 * Fetch all course groups by organisation ID.
 */
export async function fetchCourseGroupsByOrganisationId(
  organisationId: number
): Promise<any[]> {
  const response = await authenticatedFetch(
    `${API_URL}/course-groups/organisation/${organisationId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch course groups");
  }

  const data = await response.json();

  return data.map((courseGroup: any) => ({
    id: courseGroup.id,
    name: courseGroup.name,
    organisationId: courseGroup.organisationId,
    courses: courseGroup.courses || [],
  }));
}
