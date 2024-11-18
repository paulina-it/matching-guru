// api/auth.ts
import { UserLoginDto, UserCreateDto, LoginResponse } from "../types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Handle errors from the API response.
 * Attempts to parse JSON, falling back to plain text or a generic error message.
 */
async function handleApiError(response: Response): Promise<never> {
  const contentType = response.headers.get("Content-Type");

  if (contentType && contentType.includes("application/json")) {
    const errorData = await response.json();
    console.error("Parsed error data:", errorData);
    throw new Error(errorData.message || "An unknown error occurred");
  } else {
    const errorMessage = await response.text();
    console.error("Raw error message:", errorMessage);
    throw new Error(errorMessage || "An unknown error occurred");
  }
}

/**
 * Register a new user.
 */
export async function registerUser(
  request: UserCreateDto
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Log in an existing user.
 */
export async function loginUser(request: UserLoginDto): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}
