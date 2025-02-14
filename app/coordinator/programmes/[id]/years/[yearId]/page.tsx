"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYears } from "@/app/api/programmes";
import { fetchMatchesByProgrammeYearId } from "@/app/api/matching";
import { ProgrammeDto, ProgrammeYearDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 25;

const ProgrammeYearMatches = () => {
  const params = useParams<{ id: string; yearId: string }>();
  const router = useRouter();

  const programmeId = params.id ? parseInt(params.id, 10) : null;
  const programmeYearId = params.yearId ? parseInt(params.yearId, 10) : null;

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYear, setProgrammeYear] = useState<ProgrammeYearDto | null>(
    null
  );
  const [matches, setMatches] = useState<any[]>([]); // ✅ Always an array
  const [loadingProgramme, setLoadingProgramme] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!programmeId || !programmeYearId) {
      setError("Invalid programme or programme year ID");
      setLoadingProgramme(false);
      setLoadingMatches(false);
      return;
    }

    const fetchProgramme = async () => {
      try {
        const programmeData = await fetchProgrammeById(programmeId);
        setProgramme(programmeData);
      } catch (err) {
        toast.error("Error fetching programme details");
        setError("Failed to load programme details.");
      } finally {
        setLoadingProgramme(false);
      }
    };

    fetchProgramme();
  }, [programmeId]);

  useEffect(() => {
    if (!programmeYearId) return;

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const { matches: fetchedMatches, totalPages: fetchedTotalPages } =
          await fetchMatchesByProgrammeYearId(
            programmeYearId,
            currentPage - 1,
            ITEMS_PER_PAGE
          );

        console.log("🔄 Updating Matches for Page:", currentPage, fetchedMatches);
        setMatches(fetchedMatches); // ✅ Ensure matches is correctly updated
        setTotalPages(fetchedTotalPages);
      } catch (error) {
        toast.error("Error fetching matches");
        setError("Failed to load matches.");
        setMatches([]); 
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [programmeYearId, currentPage]); // ✅ Dependencies now correctly update `matches`

  if (loadingProgramme) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div className="max-w-[65vw] bg-light p-6 my-[5em] rounded shadow relative">
      <Button className="absolute top-5 right-5">Download CSV</Button>
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700">{programme?.description}</p>
      <p className="mt-4">Total Participants: {programme?.participants}</p>

      <div className="mt-6">
        <h3 className="h3">
          Programme Year {programmeYear?.academicYear} Matches
        </h3>

        {loadingMatches ? (
          <div className="flex items-center justify-center min-h-[100px]">
            <PulseLoader color="#3498db" />
          </div>
        ) : matches.length > 0 ? (
          <>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">№</th>
                    <th className="border p-2 text-left">Mentor</th>
                    <th className="border p-2 text-left">Mentor Stage</th>
                    <th className="border p-2 text-left">Mentee</th>
                    <th className="border p-2 text-left">Mentee Stage</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, index) => (
                    <tr key={match.id} className="border-t">
                      <td className="border p-2">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="border p-2">{match.mentorName}</td>
                      <td className="border p-2">
                        {match.mentorAcademicStage}
                      </td>
                      <td className="border p-2">{match.menteeName}</td>
                      <td className="border p-2">
                        {match.menteeAcademicStage}
                      </td>
                      <td className="border p-2">{match.status}</td>
                      <td className="border p-2">
                        <Button
                          onClick={() =>
                            router.push(
                              `${programmeYearId}/matches/${match.id}`
                            )
                          }
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between">
              <Button
                disabled={currentPage <= 1}
                onClick={() => {
                  console.log("⬅️ Going to Page:", currentPage - 1);
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
              >
                Previous
              </Button>

              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  console.log("➡️ Going to Page:", currentPage + 1);
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-2">
            No matches found for this programme year.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgrammeYearMatches;
