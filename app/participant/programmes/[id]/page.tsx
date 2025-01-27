"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYears } from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>() || {};
  const programmeId = id ? parseInt(id, 10) : null;

  const router = useRouter();

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYears, setProgrammeYears] = useState<ProgrammeYearDto[] | null>(null);
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
        const [programmeData, yearsData] = await Promise.all([
          fetchProgrammeById(programmeId),
          fetchProgrammeYears(programmeId),
        ]);
        setProgramme(programmeData);
        setProgrammeYears(yearsData);
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

  const handleJoinRedirect = (programmeYearId: number, programmeId: number) => {
    if (!programmeYearId || !programmeId) {
      console.error("Missing parameters for join redirect.");
      toast.error("Unable to join programme. Missing parameters.");
      return;
    }
    router.push(`/participant/programmes/${programmeId}/join/${programmeYearId}`);
  };

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

  return (
    <div className="max-w-[55vw] bg-light p-6 rounded shadow relative">
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700">{programme?.description}</p>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Programme Years</h3>
        {programmeYears && programmeYears.length > 0 ? (
          programmeYears.map((year) => (
            <div key={year.id} className="mb-4 flex justify-between items-center">
              <p className="text-gray-700">Year: {year.academicYear}</p>
              <p className="text-gray-700">Status: {year.isActive ? "Active" : "Inactive"}</p>
              {programmeId !== null && (
                <Button onClick={() => handleJoinRedirect(year.id, programmeId)}>
                  Join this Programme Year
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No programme years available.</p>
        )}
      </div>
    </div>
  );
};

export default ProgrammeDetails;
