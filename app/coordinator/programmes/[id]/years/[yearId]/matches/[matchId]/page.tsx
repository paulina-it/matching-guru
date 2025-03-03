"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchDetailedMatchById, updateMatchStatus } from "@/app/api/matching";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { formatText } from "@/app/utils/text";

const MatchDetails = () => {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId ? parseInt(params.matchId, 10) : null;
  const router = useRouter();

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  const handleStatusUpdate = async (status: "APPROVED" | "DECLINED") => {
    if (!matchId) return;
    setUpdating(true);

    try {
      await updateMatchStatus([matchId], status);
      toast.success(`Match ${status.toLowerCase()} successfully`);

      setMatch((prev: any) => ({ ...prev, status }));
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} match.`);
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

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
      <div className="absolute top-6 right-6 flex gap-3">
        <Button
          onClick={() => handleStatusUpdate("APPROVED")}
          disabled={updating || match?.status === "APPROVED"}
          className={`bg-secondary text-white hover:bg-secondary-hover
          }`}
        >
          {updating ? "Processing..." : "Approve"}
        </Button>

        <Button
          onClick={() => handleStatusUpdate("DECLINED")}
          disabled={updating || match?.status === "DECLINED"}
          className={`bg-accent text-white hover:bg-accent-hover ${
            updating ? "opacity-50" : ""
          }`}
        >
          {updating ? "Processing..." : "Decline"}
        </Button>
      </div>

      <div className="mt-4">
        <h3 className="h3">Match Information</h3>
        <p>
          <strong>Status:</strong> {match?.status || "Unknown"}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {match?.createdAt ? new Date(match.createdAt).toLocaleString() : "-"}
        </p>
        <p>
          <strong>Last Updated:</strong>{" "}
          {match?.updatedAt ? new Date(match.updatedAt).toLocaleString() : "-"}
        </p>
        <p>
          <strong>Compatibility Score:</strong> {match?.compatibilityScore}
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6">
        {/* Mentor Details */}
        <div className="border p-4 rounded">
          <h3 className="h3 font-bold">Mentor Details (ID: {match.mentor.participantId})</h3>
          <p><strong>Name:</strong> {match?.mentor?.firstName} {match?.mentor?.lastName}</p>
          <p><strong>Email:</strong> {match?.mentor?.email}</p>
          <p><strong>Academic Stage:</strong> {formatText(match?.mentor?.academicStage)}</p>
          <p><strong>Course:</strong> {match?.mentor?.course}</p>
          <p><strong>Age Group:</strong> {match?.mentor?.ageGroup?.replace("AGE_", "").replace(/_/g, "-")}</p>
          <p><strong>Gender:</strong> {formatText(match?.mentor?.gender)}</p>
          <p><strong>Living Arrangement:</strong> {formatText(match?.mentor?.livingArrangement)}</p>
          <p><strong>Personality Type:</strong> {formatText(match?.mentor?.personalityType)}</p>
          <p><strong>Home Country:</strong> {match?.mentor?.homeCountry}</p>
          <p><strong>Availability:</strong> {match?.mentor?.availableDays?.map(formatText).join(", ") || "-"}</p>
          <p><strong>Time Preference:</strong> {formatText(match?.mentor?.timePreference)}</p>
          <p><strong>Skills:</strong> {match?.mentor?.skills?.map(formatText).join(", ") || "-"}</p>
        </div>

        {/* Mentee Details */}
        <div className="border p-4 rounded">
          <h3 className="h3 font-bold">Mentee Details (ID: {match.mentee.participantId})</h3>
          <p><strong>Name:</strong> {match?.mentee?.firstName} {match?.mentee?.lastName}</p>
          <p><strong>Email:</strong> {match?.mentee?.email}</p>
          <p><strong>Academic Stage:</strong> {formatText(match?.mentee?.academicStage)}</p>
          <p><strong>Course:</strong> {match?.mentee?.course}</p>
          <p><strong>Age Group:</strong> {match?.mentee?.ageGroup?.replace("AGE_", "").replace(/_/g, "-")}</p>
          <p><strong>Gender:</strong> {formatText(match?.mentee?.gender)}</p>
          <p><strong>Living Arrangement:</strong> {formatText(match?.mentee?.livingArrangement)}</p>
          <p><strong>Personality Type:</strong> {formatText(match?.mentee?.personalityType)}</p>
          <p><strong>Home Country:</strong> {match?.mentee?.homeCountry}</p>
          <p><strong>Availability:</strong> {match?.mentee?.availableDays?.map(formatText).join(", ") || "-"}</p>
          <p><strong>Time Preference:</strong> {formatText(match?.mentee?.timePreference)}</p>
          <p><strong>Skills:</strong> {match?.mentee?.skills?.map(formatText).join(", ") || "-"}</p>
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className="mt-6 flex gap-4">
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div> */}
    </div>
  );
};

export default MatchDetails;
