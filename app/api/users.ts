import { UserUpdateDto, UserResponseDto, UserSummaryDto } from "../types/auth";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Handle errors from the API response.
 * Displays error messages using toast notifications.
 * @param response - The Response object from the API call.
 * @throws Error - Throws an error with the API response's error message.
 */
async function handleApiError(response: Response): Promise<never> {
  const errorMessage = await response.text();
  toast.error(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Update user information in the backend.
 * Sends a PUT request to update user data.
 * @param formData - The data to update the user with (UserUpdateDto).
 * @returns Promise<UserResponseDto> - Returns a promise with the updated user data.
 * @throws Error - Throws an error if the API request fails.
 */
export async function updateUser(
  formData: UserUpdateDto
): Promise<UserResponseDto> {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Authentication error: No token found. Please log in.");
    throw new Error("No token found");
  }

  const response = await fetch(`${API_URL}/users/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Fetch users in a given organisation with search, filter, and sorting options.
 * Sends a GET request to fetch user data based on provided filters and query parameters.
 * @param organisationId - The ID of the organisation to fetch users from.
 * @param searchQuery - The search query to filter users by name (default: empty string).
 * @param role - The role to filter users by (default: 'all').
 * @param sortBy - The field to sort users by (default: 'name').
 * @param sortOrder - The sorting order (default: 'asc').
 * @returns Promise<UserResponseDto[]> - Returns a promise with the list of users.
 * @throws Error - Throws an error if the API request fails.
 */
export async function fetchUsersInOrganisation(
  organisationId: number,
  searchQuery = "",
  role = "all",
  sortBy = "name",
  sortOrder = "asc",
  page = 0,
  size = 100
): Promise<{
  users: UserSummaryDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const params = new URLSearchParams({
    organisationId: organisationId.toString(),
    page: page.toString(),
    size: size.toString(),
    search: searchQuery,
    role,
    sortBy,
    sortOrder,
  });

  const response = await fetch(`${API_URL}/users/all?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch users");

  const data = await response.json();

  return {
    users: data.content,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
    number: data.number,
    size: data.size,
  };
}
