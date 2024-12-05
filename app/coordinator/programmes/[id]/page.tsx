"use client";

import React, { useEffect, useState } from "react";
import { redirect, useParams } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYears } from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const programmeId = id ? parseInt(id, 10) : null;

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
        toast.error("Error fetching programme details: " + err);
        setError("Failed to load programme details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeId]);

  const handleRedirect = () => {
    redirect(`${id}/add-year`);
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
      <Button onClick={handleRedirect} variant="outline" className="absolute right-5">
        Add Programme Cycle
      </Button>
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700">{programme?.description}</p>
      <p className="mt-4">Total Participants: {programme?.participants}</p>
      <div className="mt-6">
        <h3 className="h3">Academic Years</h3>
        {programmeYears && programmeYears.length > 0 ? (
          <table className="w-full mt-4 border-collapse border border-gray-300 text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Academic Year</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Preferred Algorithm</th>
                <th className="border border-gray-300 px-4 py-2">Participants</th>
                <th className="border border-gray-300 px-4 py-2">Join Code</th>
              </tr>
            </thead>
            <tbody>
              {programmeYears.map((year) => (
                <tr key={year.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{year.academicYear}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {year.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{year.preferredAlgorithm}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {year.participantsCount || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{year.joinCode || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>This programme has not taken place yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProgrammeDetails;
