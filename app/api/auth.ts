import { UserLoginDto, UserCreateDto, LoginResponse } from "../types/auth";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Handle errors from the API response.
 * Displays error messages using toast notifications.
 */
async function handleApiError(response: Response): Promise<never> {
  const errorMessage = await response.text();
  toast.error(errorMessage); // Show the error message directly
  throw new Error(errorMessage);
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

export async function uploadImage(imageData: FormData): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/users/upload-profile-image`, {
      method: "POST",
      body: imageData, // ✅ FormData automatically sets the correct Content-Type
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Upload failed:", errorData);
      throw new Error(`Failed to upload profile image: ${errorData}`);
    }

    return await response.text(); // Expecting a string URL
  } catch (error) {
    console.error("Upload Image Error:", error);
    throw error;
  }
}
