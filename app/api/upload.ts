const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Uploads a course file (CSV or XLSX) for a given organisation.
 */
export const uploadCourseFile = async (
  organisationId: number,
  file: File,
  token: string
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("organisationId", organisationId.toString());

  const res = await fetch(`${API_URL}/courses/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "File upload failed");

  return text;
};

/**
 * Uploads a profile image to Cloudinary and returns the URL.
 */
export const uploadProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload/profile-image`, {
    method: "POST",
    body: formData,
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || "Image upload failed");

  return text;
};

/**
 * Uploads an organisation logo image and returns the Cloudinary URL.
 */
export const uploadOrganisationLogo = async (
  organisationId: number,
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload/organisation-logo/${organisationId}`, {
    method: "POST",
    body: formData,
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || "Logo upload failed");

  return text;
};

/**
 * Sets the uploaded image as profile image.
 */
export const saveUserProfileImage = async (userId: number, imageUrl: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: userId,
      profileImageUrl: imageUrl,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update user profile image");
  }
};
