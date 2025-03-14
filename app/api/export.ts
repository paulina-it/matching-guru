const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";


export const downloadCSV = async (programmeYearId: number) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token is missing.");
  try {
    const response = await fetch(
      `${API_URL}/export/matches?programmeYearId=${programmeYearId}&page=0&size=100`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download CSV. Status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matches_programme_${programmeYearId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV:", error);
  }
};
