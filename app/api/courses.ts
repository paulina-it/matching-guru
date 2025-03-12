import { CourseCreateDto, CourseGroupCreateDto } from "../types/courses";
import { authenticatedFetch } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
 * Update an existing course by ID.
 */
export async function updateCourse(courseId: number, updatedCourse: Partial<CourseCreateDto>): Promise<any> {
  const response = await authenticatedFetch(`${API_URL}/courses/update/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(updatedCourse),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to update course");
  }

  return response.json();
}


/**
 * Delete a course by ID.
 */
export async function deleteCourse(courseId: number): Promise<void> {
  const response = await authenticatedFetch(`${API_URL}/courses/${courseId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    if (error.includes("violates foreign key constraint")) {
      throw new Error("Cannot delete course – it is assigned to one or more users.");
    }
    throw new Error(error || "Failed to delete course");
  }
}

/**
 * Update an existing course group by ID.
 */
export async function updateCourseGroup(courseGroupId: number, updatedGroup: { name: string }): Promise<any> {
  const response = await authenticatedFetch(`${API_URL}/course-groups/update/${courseGroupId}`, {
    method: "PUT",
    body: JSON.stringify(updatedGroup),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to update course group");
  }

  return response.json();
}

/**
 * Delete a course group by ID.
 */
export async function deleteCourseGroup(courseGroupId: number): Promise<void> {
  const response = await authenticatedFetch(`${API_URL}/course-groups/${courseGroupId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete course group");
  }
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
