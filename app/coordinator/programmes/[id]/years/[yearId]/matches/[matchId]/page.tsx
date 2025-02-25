"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchDetailedMatchById } from "@/app/api/matching";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const MatchDetails = () => {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId ? parseInt(params.matchId, 10) : null;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setError("Invalid match ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const matchData = await fetchDetailedMatchById(matchId);
        setMatch(matchData);
        console.table(matchData);
      } catch (err) {
        toast.error("Error fetching match details: " + err);
        setError("Failed to load match details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }

  console.table(match);

  return (
    <div className="max-w-[65vw] bg-light p-6 rounded shadow relative">
      <h2 className="h2 font-bold mb-4">Match Details</h2>

      <div className="mt-4">
        <h3 className="h3">Match Information</h3>
        <p><strong>Status:</strong> {match?.status || "Unknown"}</p>
        <p><strong>Created At:</strong> {match?.createdAt ? new Date(match.createdAt).toLocaleString() : "-"}</p>
        <p><strong>Last Updated:</strong> {match?.updatedAt ? new Date(match.updatedAt).toLocaleString() : "-"}</p>
        <p><strong>Compatibility Score:</strong> {match?.compatibilityScore}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {/* Mentor Details */}
        <div className="border p-4 rounded">
          <h3 className="h3 font-bold">Mentor Details  (ID: {match.mentor.participantId})</h3>
          <p><strong>Name:</strong> {match?.mentor?.firstName || "-"} {match?.mentor?.lastName || "-"}</p>
          <p><strong>Email:</strong> {match?.mentor?.email || "-"}</p>
          <p><strong>Academic Stage:</strong> {match?.mentor?.academicStage || "-"}</p>
          <p><strong>Course:</strong> {match?.mentor?.course || "-"}</p>
          <p><strong>Age Group:</strong> {match?.mentor?.ageGroup || "-"}</p>
          <p><strong>Gender:</strong> {match?.mentor?.gender || "-"}</p>
          <p><strong>Living Arrangement:</strong> {match?.mentor?.livingArrangement || "-"}</p>
          <p><strong>Personality Type:</strong> {match?.mentor?.personalityType || "-"}</p>
          <p><strong>Home Country:</strong> {match?.mentor?.homeCountry || "-"}</p>
          <p><strong>Availability:</strong> {match?.mentor?.availableDays?.join(", ") || "-"}</p>
          <p><strong>Time Preference:</strong> {match?.mentor?.timePreference || "-"}</p>
          <p><strong>Skills:</strong> {match?.mentor?.skills?.join(", ") || "-"}</p>
          
        </div>

        {/* Mentee Details */}
        <div className="border p-4 rounded">
          <h3 className="h3 font-bold">Mentee Details (ID: {match.mentee.participantId})</h3>
          <p><strong>Name:</strong> {match?.mentee?.firstName || "-"} {match?.mentee?.lastName || "-"}</p>
          <p><strong>Email:</strong> {match?.mentee?.email || "-"}</p>
          <p><strong>Academic Stage:</strong> {match?.mentee?.academicStage || "-"}</p>
          <p><strong>Course:</strong> {match?.mentee?.course || "-"}</p>
          <p><strong>Age Group:</strong> {match?.mentee?.ageGroup || "-"}</p>
          <p><strong>Gender:</strong> {match?.mentee?.gender || "-"}</p>
          <p><strong>Living Arrangement:</strong> {match?.mentee?.livingArrangement || "-"}</p>
          <p><strong>Personality Type:</strong> {match?.mentee?.personalityType || "-"}</p>
          <p><strong>Home Country:</strong> {match?.mentee?.homeCountry || "-"}</p>
          <p><strong>Availability:</strong> {match?.mentee?.availableDays?.join(", ") || "-"}</p>
          <p><strong>Time Preference:</strong> {match?.mentee?.timePreference || "-"}</p>
          <p><strong>Skills:</strong> {match?.mentee?.skills?.join(", ") || "-"}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  );
};

export default MatchDetails;
