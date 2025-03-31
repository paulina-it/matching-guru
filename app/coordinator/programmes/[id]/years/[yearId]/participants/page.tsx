"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getParticipantsByProgrammeYearId } from "@/app/api/participant";
import { ParticipantDto } from "@/app/types/participant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 10;

const ParticipantsInProgrammeYear: React.FC = () => {
  const params = useParams<{ id: string; yearId: string }>();
  const programmeYearId = parseInt(params?.yearId ?? "", 10);

  const [participants, setParticipants] = useState<ParticipantDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [sortBy, setSortBy] = useState("user.firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchParticipants = async () => {
    if (!programmeYearId || isNaN(programmeYearId)) {
      setError("Invalid programme year ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getParticipantsByProgrammeYearId(
        programmeYearId,
        page,
        ITEMS_PER_PAGE,
        submittedSearch,
        sortBy,
        sortOrder,
        roleFilter
      );
      setParticipants(data.content);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch participants");
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [programmeYearId, page, submittedSearch, sortBy, sortOrder, roleFilter]);

  const handleSearchSubmit = () => {
    setSubmittedSearch(searchQuery);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  return (
    <div className="mt-6 min-w-[65vw] bg-white  dark:bg-dark dark:border dark:border-white/30  rounded p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Participants</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="lg:w-1/3"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="user.firstName">First Name</option>
          <option value="user.lastName">Last Name</option>
          <option value="user.email">Email</option>
          <option value="academicStage">Academic Stage</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border p-2 rounded"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Roles</option>
          <option value="MENTOR">Mentor</option>
          <option value="MENTEE">Mentee</option>
        </select>
        <Button onClick={handleSearchSubmit}>Search</Button>
      </div>

      {/* Table / Results */}
      {loading ? (
        <p className="text-gray-600">Loading participants...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : participants.length === 0 ? (
        <p className="text-gray-600">No participants found.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li
                key={participant.id}
                className="border rounded-md px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {participant.userName} ({participant.academicStage})
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {participant.role.toLowerCase()}
                  </p>
                </div>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    participant.isMatched
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {participant.isMatched ? "Matched" : "Unmatched"}
                </span>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center pt-6">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantsInProgrammeYear;
