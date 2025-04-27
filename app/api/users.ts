import { UserUpdateDto, UserResponseDto, UserSummaryDto } from "../types/auth";
import toast from "react-hot-toast";
import { authenticatedFetch } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Handle errors from the API response.
 */
async function handleApiError(response: Response): Promise<never> {
  const errorMessage = await response.text();
  toast.error(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Update user information in the backend.
 */
export async function updateUser(formData: UserUpdateDto): Promise<UserResponseDto> {
  const response = await authenticatedFetch(`${API_URL}/users/update`, {
    method: "PUT",
    body: JSON.stringify(formData),
  });

  if (!response.ok) await handleApiError(response);
  return response.json();
}

/**
 * Fetch users in a given organisation with search, filter, and sorting options.
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
  const params = new URLSearchParams({
    organisationId: organisationId.toString(),
    page: page.toString(),
    size: size.toString(),
    search: searchQuery,
    role,
    sortBy,
    sortOrder,
  });

  const response = await authenticatedFetch(`${API_URL}/users/all?${params.toString()}`);

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

/**
 * Fetch user by ID.
 */
export async function getUserById(id: number): Promise<UserResponseDto> {
  const response = await authenticatedFetch(`${API_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
}

/**
 * Assign a user to an organisation by email.
 */
export async function assignUserToOrganisation(email: string, organisationId: number): Promise<void> {
  const queryParams = new URLSearchParams({
    userEmail: email,
    organisationId: organisationId.toString(),
  });

  const response = await authenticatedFetch(`${API_URL}/users/assign-organisation?${queryParams.toString()}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to assign user to organisation");
  }
}