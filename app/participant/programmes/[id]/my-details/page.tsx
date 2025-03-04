"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProgrammeById } from "@/app/api/programmes";
import { ProgrammeDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getParticipantInfoByUserId } from "@/app/api/participant";
import { useAuth } from "@/app/context/AuthContext";

const ParticipantProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>() || {};
  const programmeId = id ? parseInt(id, 10) : null;
  const { user } = useAuth();
  const router = useRouter();

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMentor, setIsMentor] = useState<boolean | null>(null);
  const [participant, setParticipant] = useState<any>(null);

  useEffect(() => {
    if (!programmeId || !user) {
      setError("Invalid programme ID or user not authenticated");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [programmeData, participantInfo] = await Promise.all([
          fetchProgrammeById(programmeId),
          getParticipantInfoByUserId(user.id),
        ]);

        setProgramme(programmeData);

        if (participantInfo?.mentor && participantInfo?.mentee) {
          const isUserMentor = participantInfo.mentor.email === user.email;
          setIsMentor(isUserMentor);
          if (isUserMentor) setParticipant(participantInfo.mentor);
          else setParticipant(participantInfo.mentee);
          setMatchDetails(participantInfo);
        } else {
          setParticipant(participantInfo);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Error fetching data.");
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeId, user]);

  const capitalize = (text: string) => {
    if (!text) return "";
    return text
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="max-w-[55vw] bg-light p-6 rounded shadow relative">
      <h2 className="h2 font-bold mb-4">{programme?.name ?? "N/A"}</h2>
      <p className="text-gray-700">
        {programme?.description ?? "No description available"}
      </p>
      <p>Contact details: mentoring@aston.ac.uk</p>

      <div className="mt-6">
        <p className="bg-secondary text-white rounded p-2 w-fit absolute top-6 right-6">
          Status:{" "}
          {matchDetails
            ? matchDetails.status === "APPROVED"
              ? "✅ Match Confirmed"
              : "⏳ Match Pending"
            : "❌ Unmatched"}
        </p>

        {/* Display user participation info (when no confirmed match exists) */}
        {(!matchDetails || matchDetails.status !== "APPROVED") && (
          <div className="mt-6 border p-4 rounded bg-gray-100">
            <h3 className="h3">Your Participation</h3>
            <p>
              <strong>Name:</strong> {participant?.firstName}{" "}
              {participant?.lastName}
            </p>
            <p>
              <strong>Email:</strong> {participant?.email}
            </p>
            <p>
              <strong>Course:</strong> {participant?.course}
            </p>
            <p>
              <strong>Academic Stage: </strong>
              {capitalize(participant?.academicStage)}
            </p>
            <p>
              <strong>Skills: </strong>
              {participant?.skills?.length
                ? participant.skills.map(capitalize).join(", ")
                : "None listed"}
            </p>

            <p className="mt-3 text-yellow-600">
              A match has been found for you, but coordinator approval is
              pending.
            </p>
          </div>
        )}

        {/* Display match details ONLY when status is CONFIRMED */}
        {matchDetails?.status === "APPROVED" && (
          <div className="mt-6 border p-4 rounded bg-gray-100">
            <h4 className="h4 text-lg italic">You have been paired with:</h4>
            <p>
              <strong>Name:</strong>{" "}
              {isMentor
                ? matchDetails.mentee?.firstName
                : matchDetails.mentor?.firstName}{" "}
              {isMentor
                ? matchDetails.mentee?.lastName
                : matchDetails.mentor?.lastName}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {isMentor
                ? matchDetails.mentee?.email
                : matchDetails.mentor?.email}
            </p>
            <p>
              <strong>Course:</strong>{" "}
              {isMentor
                ? matchDetails.mentee?.course
                : matchDetails.mentor?.course}
            </p>
            <p>
              <strong>Academic Stage:</strong>{" "}
              {isMentor
                ? capitalize(matchDetails.mentee?.academicStage)
                : capitalize(matchDetails.mentor?.academicStage)}
            </p>
            <p>
              <strong>Skills: </strong>
              {isMentor
                ? matchDetails.mentee?.skills?.length
                  ? matchDetails.mentee.skills.map(capitalize).join(", ")
                  : "None listed"
                : matchDetails.mentor?.skills?.length
                ? matchDetails.mentor.skills.map(capitalize).join(", ")
                : "None listed"}
            </p>
            <h3 className="h3">
              Compatibility Score: {matchDetails.compatibilityScore}%
            </h3>

            <Button variant="outline" className="mt-4">
              Contact Your Match
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantProgrammeDetails;
