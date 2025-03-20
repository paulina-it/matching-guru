import { UserLoginDto, UserCreateDto, LoginResponse, UserUpdateDto, UserResponseDto } from "../types/auth";
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


export async function updateUser(formData: UserUpdateDto): Promise<UserResponseDto> {
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


export async function uploadImage(imageData: FormData): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/auth/upload-profile-image`, {
      method: "POST",
      body: imageData, 
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Upload failed:", errorData);
      throw new Error(`Failed to upload profile image: ${errorData}`);
    }

    return await response.text(); 
  } catch (error) {
    console.error("Upload Image Error:", error);
    throw error;
  }
}
