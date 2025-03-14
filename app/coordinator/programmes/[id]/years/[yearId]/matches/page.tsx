"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  fetchMatchesByProgrammeYearId,
  updateMatchStatus,
} from "@/app/api/matching";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";
import { downloadCSV } from "@/app/api/export";

const ITEMS_PER_PAGE = 20;

const ProgrammeYearMatches = () => {
  const params = useParams<{ id: string; yearId: string }>();
  const pathname = usePathname();

  const programmeYearId = params.yearId ? parseInt(params.yearId, 10) : null;

  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<Set<number>>(
    new Set()
  );
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  useEffect(() => {
    if (!programmeYearId) return;

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const { matches: fetchedMatches, totalPages: fetchedTotalPages } =
          await fetchMatchesByProgrammeYearId(
            programmeYearId,
            currentPage - 1,
            ITEMS_PER_PAGE,
            submittedSearch,
            sortBy,
            sortOrder,
            statusFilter
          );

        setMatches(fetchedMatches);
        setTotalPages(fetchedTotalPages);
      } catch (error) {
        toast.error("Error fetching matches");
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [
    programmeYearId,
    currentPage,
    submittedSearch,
    sortBy,
    sortOrder,
    statusFilter,
  ]);

  const handleSearchSubmit = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

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
      setLoadingMatches(true);
      await updateMatchStatus(Array.from(selectedMatches), status);

      setMatches((prevMatches) =>
        prevMatches.map((match) =>
          selectedMatches.has(match.id) ? { ...match, status } : match
        )
      );

      toast.success(
        `Successfully updated ${selectedMatches.size} match(es) to ${status}.`
      );
      setSelectedMatches(new Set());

      const { matches: updatedMatches, totalPages: updatedTotalPages } =
        await fetchMatchesByProgrammeYearId(
          programmeYearId!,
          currentPage - 1,
          ITEMS_PER_PAGE,
          submittedSearch,
          sortBy,
          sortOrder,
          statusFilter
        );

      setMatches(updatedMatches);
      setTotalPages(updatedTotalPages);
    } catch (error) {
      toast.error("Failed to update match status.");
    } finally {
      setProcessing(false);
      setLoadingMatches(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!programmeYearId) {
      toast.error("Programme Year ID is missing.");
      return;
    }

    const toastId = toast.loading("Preparing file...");

    try {
      await downloadCSV(programmeYearId);
      toast.success("CSV downloaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to download CSV. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="w-[70vw] bg-light p-6 my-[5em] rounded shadow relative">
      <div className="flex gap-6">
        <h2 className="h2 font-bold mb-4">Programme Year Matches</h2>
        <Button variant="outline" onClick={handleDownloadCSV}>
          Download All in CSV
        </Button>
      </div>

      {/* Approve & Decline Buttons */}
      <div className="flex gap-4 mb-4 absolute top-5 right-5">
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

      <div className="grid grid-cols-[1fr_4fr] gap-6">
        {/* 🎛 Search, Sort, and Filter Controls */}
        <div className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by mentor/mentee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border p-2 rounded w-full"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="updatedAt">Updated At</option>
            <option value="mentorName">Mentor Name</option>
            <option value="menteeName">Mentee Name</option>
            <option value="compatibilityScore">Compatibility Score</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="DECLINED">Declined</option>
          </select>
          <Button onClick={handleSearchSubmit}>Search</Button>
        </div>

        {/* Matches Table */}
        <div className="relative">
          {loadingMatches ? (
            <div className="flex flex-col items-center justify-center min-h-[100px]">
              <PulseLoader color="#3498db" />
              {/* <p className="italic text-black/50 text-sm mt-4">Loading matches...</p> */}
            </div>
          ) : matches.length > 0 ? (
            <div>
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 m-auto">
                      <input
                        type="checkbox"
                        checked={selectedMatches.size === matches.length}
                        onChange={toggleSelectAll}
                        className="mt-2 w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white 
  checked:bg-accent checked:border-none checked:ring-2 checked:ring-accent-hover
  focus:outline-none focus:ring-2 focus:ring-accent-hover transition-all cursor-pointer
  relative checked:before:content-['✔'] checked:before:absolute 
  checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 
  checked:before:-translate-y-1/2 checked:before:text-white checked:before:text-md"
                      />
                    </th>
                    <th className="border p-2 text-left">Mentor</th>
                    <th className="border p-2 text-left">Mentee</th>
                    <th className="border p-2 text-left">Score</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-t">
                      <td className=" py-4 flex justify-center h-full">
                        <input
                          type="checkbox"
                          checked={selectedMatches.has(match.id)}
                          onChange={() => toggleSelectMatch(match.id)}
                          className="w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white 
    checked:bg-accent checked:border-none checked:ring-2 checked:ring-accent-hover
    focus:outline-none focus:ring-2 focus:ring-accent-hover transition-all cursor-pointer
    relative checked:before:content-['✔'] checked:before:absolute 
    checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 
    checked:before:-translate-y-1/2 checked:before:text-white checked:before:text-md"
                        />
                      </td>
                      <td className="border p-2">
                        {match.mentorName} ({match.mentorId})
                      </td>
                      <td className="border p-2">
                        {match.menteeName} ({match.menteeId})
                      </td>
                      <td className="border p-2">{match.compatibilityScore}</td>
                      <td className="border p-2">{match.status}</td>
                      <td className="border p-2">
                        <Link href={`${pathname}/${match.id}`}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 mt-4">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <span className="text-lg font-semibold">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">No matches found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammeYearMatches;
