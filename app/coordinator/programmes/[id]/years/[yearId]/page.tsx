"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYear } from "@/app/api/programmes";
import { matchParticipants } from "@/app/api/matching";
import { ProgrammeDto, ProgrammeYearDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ProgrammeYearPage = () => {
  const params = useParams<{ id: string; yearId: string }>();
  const router = useRouter();

  const programmeId = parseInt(params.id, 10);
  const programmeYearId = parseInt(params.yearId, 10) ;

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYear, setProgrammeYear] = useState<ProgrammeYearDto | null>(
    null
  );
  const [loadingProgramme, setLoadingProgramme] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programmeId || !programmeYearId) {
      setError("Invalid programme or programme year ID");
      setLoadingProgramme(false);
      return;
    }

    const fetchProgramme = async () => {
      try {
        const programmeData = await fetchProgrammeById(programmeId);
        const yearData = await fetchProgrammeYear(programmeYearId);
        setProgramme(programmeData);
        setProgrammeYear(yearData);
      } catch (err) {
        toast.error("Error fetching programme details");
        setError("Failed to load programme details.");
      } finally {
        setLoadingProgramme(false);
      }
    };

    fetchProgramme();
  }, [programmeId, programmeYearId]);

  const handleMatchParticipants = (id: number, isInitial: boolean) => {
    matchParticipants(id, isInitial);
    toast.success("Matching started!")
  };

  if (loadingProgramme) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  return (
    <div className="max-w-[65vw] bg-light p-6 my-[5em] rounded shadow relative">
      {/* <Button className="absolute top-5 right-5">Download CSV</Button> */}
      <h2 className="h2 font-bold mb-4">{programme?.name ?? "N/A"}</h2>
      <p className="text-gray-700">
        {programme?.description ?? "No description available."}
      </p>
      <p className="mt-4">
        Total Participants: {programme?.participants ?? "Unknown"}
      </p>

      <div className="mt-6">
        <h3 className="h3">
          Programme Year {programmeYear?.academicYear ?? "N/A"}
        </h3>
        <h2 className="font-semibold mt-2">
          Algorithm: {programmeYear?.preferredAlgorithm ?? "Not specified"}
        </h2>

        <h2 className="mt-2 font-semibold">Matching Criteria</h2>
        {programmeYear?.matchingCriteria &&
        programmeYear.matchingCriteria.length > 0 ? (
          <table className="w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border border-gray-300">
                <th className="px-4 py-2 text-left">Criterion Type</th>
                <th className="px-4 py-2 text-left">Weight (%)</th>
              </tr>
            </thead>
            <tbody>
              {programmeYear.matchingCriteria.map((criterion, index) =>
                criterion.weight > 0 ? (
                  <tr key={index} className="border border-gray-300">
                    <td className="px-4 py-2">
                      {criterion.criterionType
                        ?.toLowerCase()
                        .replace(/\b\w/g, (char) => char.toUpperCase()) ??
                        "N/A"}
                    </td>
                    <td className="px-4 py-2">{criterion.weight ?? 0}%</td>
                  </tr>
                ) : (
                  ""
                )
              )}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 mt-2">No criteria found.</p>
        )}

        <h2 className="h3 mt-5 font-semibold">Matching</h2>

        {/* Display Matching Status */}
        <p className="mt-2 text-lg">
          {programmeYear?.initialMatchingIsDone ? (
            <span className="text-green-600 font-semibold">
              ✅ Matching has already taken place.
            </span>
          ) : (
            <span className="text-red-600 font-semibold">
              ❌ Matching has not yet taken place.
            </span>
          )}
        </p>

        {/* Buttons for Matching Actions */}
        <div className="mt-4 flex gap-4">
          {programmeYear?.initialMatchingIsDone ? (
            <>
              <Button>
                Perform Secondary Matching
              </Button>
              <Button variant="outline">View Previous Matches</Button>
            </>
          ) : (
            <Button
              onClick={() => handleMatchParticipants(programmeYearId, !programmeYear?.initialMatchingIsDone)}
              variant="outline"
              className=""
            >
              Match
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammeYearPage;
