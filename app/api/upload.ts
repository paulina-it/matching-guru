const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
