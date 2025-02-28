"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYears } from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ParticipantDto } from "@/app/types/participant";
import { getParticipantByUserId } from "@/app/api/participant";
import { useAuth } from "@/app/context/AuthContext";

const ParticipantProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>() || {};
  const programmeId = id ? parseInt(id, 10) : null;
  const { user } = useAuth();

  const router = useRouter();

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [participant, setParticipant] = useState<ParticipantDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programmeId) {
      setError("Invalid programme ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [programmeData, participantData] = await Promise.all([
          fetchProgrammeById(programmeId),
          getParticipantByUserId(user!.id),
        ]);
        setProgramme(programmeData);
        setParticipant(participantData);
      } catch (err) {
        console.error("Error fetching programme details:", err);
        toast.error("Error fetching programme details.");
        setError("Failed to load programme details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  console.log(participant);
  
  return (
    <div className="max-w-[55vw] bg-light p-6 rounded shadow relative">
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700">{programme?.description}</p>
      <p>Contact details: mentoring@aston.ac.uk</p>
      <div className="mt-6 relative">
        <h3 className="h3">Your Profile</h3>
        <p className="bg-accent text-white rounded p-2 w-fit absolute top-[-0.2em] right-1">Status: {participant?.isMatched ? "Match Found" : "Unmatched"}</p>
        {participant?.isMatched ? <div>Your have been paired with:</div> : ""}

      </div>
    </div>
  );
};

export default ParticipantProgrammeDetails;
