"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProgrammeById } from "@/app/api/programmes";
import { ProgrammeDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";

const ProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>(); 
  const programmeId = id ? parseInt(id, 10) : null;
  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
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
        const data = await fetchProgrammeById(programmeId);
        setProgramme(data);
      } catch (err) {
        console.error("Error fetching programme details:", err);
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
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="max-w-[50vw] bg-light p-6 rounded shadow">
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700">{programme?.description}</p>
      <p className="mt-4">Participants: {programme?.participants}</p>
    </div>
  );
};

export default ProgrammeDetails;
