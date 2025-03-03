"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { fetchProgrammeById } from "@/app/api/programmes";
import { fetchMatchesByProgrammeYearId, updateMatchStatus } from "@/app/api/matching";
import { ProgrammeDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { formatText } from "@/app/utils/text";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

const ProgrammeYearMatches = () => {
  const params = useParams<{ id: string; yearId: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const programmeId = params.id ? parseInt(params.id, 10) : null;
  const programmeYearId = params.yearId ? parseInt(params.yearId, 10) : null;

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState(false); 

  useEffect(() => {
    if (!programmeId || !programmeYearId) {
      setError("Invalid programme or programme year ID");
      setLoading(false);
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
        setLoading(false);
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
          await fetchMatchesByProgrammeYearId(programmeYearId, currentPage - 1, ITEMS_PER_PAGE);

        setMatches(fetchedMatches);
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
  }, [programmeYearId, currentPage]);

  const toggleSelectMatch = (matchId: number) => {
    setSelectedMatches((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(matchId)) {
        newSelected.delete(matchId);
      } else {
        newSelected.add(matchId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedMatches.size === matches.length) {
      setSelectedMatches(new Set());
    } else {
      setSelectedMatches(new Set(matches.map((match) => match.id)));
    }
  };

  const handleUpdateMatchStatus = async (status: "APPROVED" | "DECLINED") => {
    if (selectedMatches.size === 0) return;

    setProcessing(true);
    try {
      await updateMatchStatus(Array.from(selectedMatches), status);
      toast.success(`Successfully updated ${selectedMatches.size} match(es) to ${status}.`);
      setSelectedMatches(new Set());
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to update match status.");
    } finally {
      setProcessing(false);
      const { matches: fetchedMatches, totalPages: fetchedTotalPages } =
        await fetchMatchesByProgrammeYearId(programmeYearId!, currentPage - 1, ITEMS_PER_PAGE);
      setMatches(fetchedMatches);
      setTotalPages(fetchedTotalPages);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  return (
    <div className="max-w-[65vw] bg-light p-6 my-[5em] rounded shadow relative">
      <Button className="absolute top-5 right-5">Download CSV</Button>
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700">{programme?.description}</p>
      <p className="mt-4">Total Participants: {programme?.participants}</p>

      <div className="mt-6">
        <h3 className="h3">Programme Year Matches</h3>

        {loadingMatches ? (
          <div className="flex flex-col items-center justify-center min-h-[100px]">
            <PulseLoader color="#3498db" />
            <p className="italic text-black/50 text-sm mt-4">Loading matches might take up to 1 minute...</p>
          </div>
        ) : matches.length > 0 ? (
          <>
            <div className="overflow-x-auto mt-4">
              {/* Approve & Decline Buttons */}
              <div className="flex gap-4 mb-4">
                <Button
                  onClick={() => handleUpdateMatchStatus("APPROVED")}
                  disabled={selectedMatches.size === 0 || processing}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleUpdateMatchStatus("DECLINED")}
                  variant="secondary"
                  disabled={selectedMatches.size === 0 || processing}
                >
                  Decline
                </Button>
              </div>

              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">
                      <input
                        type="checkbox"
                        checked={selectedMatches.size === matches.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="border p-2 text-left">№</th>
                    <th className="border p-2 text-left">Mentor</th>
                    <th className="border p-2 text-left">Mentee</th>
                    <th className="border p-2 text-left">Score</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, index) => (
                    <tr key={match.id} className="border-t">
                      <td className="border p-2">
                        <input
                          type="checkbox"
                          checked={selectedMatches.has(match.id)}
                          onChange={() => toggleSelectMatch(match.id)}
                        />
                      </td>
                      <td className="border p-2">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td className="border p-2">{match.mentorName}</td>
                      <td className="border p-2">{match.menteeName}</td>
                      <td className="border p-2">{match.compatibilityScore}</td>
                      <td className="border p-2">{match.status}</td>
                      <td className="border p-2">
                        <Link href={(`${pathname}/${match.id}`)}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-2">No matches found.</p>
        )}
      </div>
    </div>
  );
};

export default ProgrammeYearMatches;
