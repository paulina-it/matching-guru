"use client";

import React, { useEffect, useState } from "react";
import { redirect, useParams } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYears } from "@/app/api/programmes";
import { matchParticipants } from "@/app/api/matching";
import { ProgrammeDto, ProgrammeYearResponseDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const programmeId = id ? parseInt(id, 10) : null;

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYears, setProgrammeYears] = useState<
    ProgrammeYearResponseDto[] | null
  >(null);
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
        console.table(yearsData);
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

  const handleRedirectDetails = (yearId: number) => {
    redirect(`${id}/years/${yearId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="max-w-[90vw] lg:max-w-[55vw] bg-light dark:bg-dark dark:border dark:border-white/30  p-6 rounded shadow relative">
      <Button
        onClick={handleRedirect}
        variant="outline"
        className="absolute right-5 hidden lg:block"
      >
        Add Programme Cycle
      </Button>
      <Button
        onClick={handleRedirect}
        variant="outline"
        className="absolute right-5 lg:hidden"
      >
        +
      </Button>

      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700 dark:text-light/70">{programme?.description}</p>
      <p className="mt-4">Total Participants: {programme?.participants}</p>
      <div className="mt-6">
        <h3 className="h3">Academic Years</h3>
        {programmeYears && programmeYears.length > 0 ? (
          <table className="w-full mt-4 border-collapse border border-gray-300 text-sm text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-black/50">
                <th className="border border-gray-300 px-4 py-2">
                  Academic Year
                </th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                  Preferred Algorithm
                </th>
                <th className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                  Participants
                </th>
                <th className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                  Join Code
                </th>
                <th className="border border-gray-300 px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {programmeYears.map((year) => (
                <tr key={year.id} className="">
                  <td className="border border-gray-300 px-4 py-2">
                    {year.academicYear}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {year.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                    {year.preferredAlgorithm}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                    {year.participantCount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                    {year.joinCode || "N/A"}
                  </td>
                  <td>
                    <Button
                      onClick={() => handleRedirectDetails(year.id)}
                      variant="outline"
                      className="w-full"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>This programme has not taken place yet.</p>
        )}
      </div>
      <div></div>
    </div>
  );
};

export default ProgrammeDetails;
