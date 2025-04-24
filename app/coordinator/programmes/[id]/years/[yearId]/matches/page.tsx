"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  deleteProgrammeYearMatches,
  fetchMatchesByProgrammeYearId,
  updateMatchStatus,
} from "@/app/api/matching";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";
import { downloadCSV } from "@/app/api/export";
import { useAuth } from "@/app/context/AuthContext";

// const ITEMS_PER_PAGE = 20;

const ProgrammeYearMatches = () => {
  const params = useParams<{ id: string; yearId: string }>();
  const pathname = usePathname();
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { user } = useAuth();

  const programmeYearId = params.yearId ? parseInt(params.yearId, 10) : null;

  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<Set<number>>(
    new Set()
  );
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const statusStyles: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    APPROVED: { label: "Approved", className: "bg-green-100 text-green-800" },
    DECLINED: { label: "Declined", className: "bg-red-100 text-red-800" },
    ACCEPTED_BY_ONE_PARTY: {
      label: "Accepted by One",
      className: "bg-blue-100 text-blue-800",
    },
    ACCEPTED_BY_BOTH: {
      label: "Accepted by Both",
      className: "bg-green-200 text-green-900",
    },
    REJECTED: { label: "Rejected", className: "bg-gray-200 text-gray-600" },
  };

  useEffect(() => {
    if (!programmeYearId) return;

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const { matches: fetchedMatches, totalPages: fetchedTotalPages } =
          await fetchMatchesByProgrammeYearId(
            programmeYearId,
            currentPage - 1,
            itemsPerPage,
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
    itemsPerPage,
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
    if (selectedMatches.size === 0 || !user) return;

    setProcessing(true);
    try {
      setLoadingMatches(true);
      await updateMatchStatus(Array.from(selectedMatches), status, user.id);

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
          itemsPerPage,
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

  const handleResetMatches = async () => {
    const toastId = toast.loading("Deleting matches...");
    try {
      await deleteProgrammeYearMatches(programmeYearId!);
      toast.success("All matches deleted and participants reset.", {
        id: toastId,
      });
      setShowConfirmReset(false);
      setTimeout(() => window.location.reload(), 800);
      setShowConfirmReset(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete matches.", {
        id: toastId,
      });
    }
  };

  return (
    <div className="lg:w-[70vw] w-[95vw] bg-light  dark:bg-dark dark:border dark:border-white/30  p-6 my-[5em] rounded shadow relative">
      <div className="flex lg:flex-row justify-between flex-col gap-6">
        <div>
          <h2 className="h2 font-bold mb-4">Programme Year Matches</h2>
          <p className="lg:hidden text-center">
            For full view, please open this page on a desktop.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleDownloadCSV}>
            📥 Download CSV
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowConfirmReset(true)}
          >
            🗑 Reset All Matches
          </Button>
        </div>
      </div>
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-dark p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">
              ⚠️ Confirm Reset
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              This will delete all matches and reset participants for this
              Programme Year. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmReset(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleResetMatches();
                }}
              >
                Yes, Delete All
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:grid grid-cols-[1fr_4fr] gap-6">
        {/* 🎛 Search, Sort, and Filter Controls */}
        <div className="flex flex-col gap-4 mb-4">
          {matches.length > 0 && (
            <div className="flex flex-col gap-4 mb-4">
              <Button
                onClick={() => handleUpdateMatchStatus("APPROVED")}
                disabled={selectedMatches.size === 0 || processing}
              >
                Approve Selected
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleUpdateMatchStatus("DECLINED")}
                disabled={selectedMatches.size === 0 || processing}
              >
                Decline Selected
              </Button>
            </div>
          )}
          <h3 className="h3">Search and Filter:</h3>
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
            <option value="id">Match ID</option>
            <option value="compatibilityScore">Compatibility Score</option>
            <option value="status">Status</option>
            <option value="mentor.user.lastName">Mentor Last Name</option>
            <option value="mentee.user.lastName">Mentee Last Name</option>
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
          <label className="text-sm font-medium">Matches per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border p-2 mt-[-1em] rounded"
          >
            {[10, 20, 30, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num} per page
              </option>
            ))}
          </select>

          <Button onClick={handleSearchSubmit}>Search</Button>
        </div>

        {/* Matches Table */}
        <div className="relative">
          {loadingMatches ? (
            <div className="flex flex-col items-center justify-center min-h-[100px]">
              <PulseLoader color="#3498db" />
            </div>
          ) : matches.length > 0 ? (
            <div>
              <table className="min-w-full bg-white dark:bg-dark border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 dark:bg-black/40">
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
                  {matches.map((match) => {
                    if (!match.id) console.warn("❌ Match missing ID:", match);

                    return (
                      <tr
                        key={
                          match.id ??
                          `${match.mentorId}-${match.menteeId}-${match.compatibilityScore}`
                        }
                        className="border-t"
                      >
                        <td className="py-4 flex justify-center h-full">
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
                        <td className="border p-2">
                          {match.compatibilityScore}
                        </td>
                        <td className="border p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              statusStyles[match.status]?.className ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusStyles[match.status]?.label || match.status}
                          </span>
                        </td>

                        <td className="border p-2">
                          <Link href={`${pathname}/${match.id}`}>View</Link>
                        </td>
                      </tr>
                    );
                  })}
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
