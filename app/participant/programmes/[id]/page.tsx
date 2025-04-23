"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYears } from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearResponseDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { getParticipantInfoByUserIdAndProgrammeYearId } from "@/app/api/participant";

const ProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>() || {};
  const programmeId = id ? parseInt(id, 10) : null;

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYears, setProgrammeYears] = useState<
    ProgrammeYearResponseDto[] | null
  >(null);
  const [joinedProgrammeYearIds, setJoinedProgrammeYearIds] = useState<
    number[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!programmeId || !user?.id) return;

    const fetchData = async () => {
      try {
        const [programmeData, yearsData] = await Promise.all([
          fetchProgrammeById(programmeId),
          fetchProgrammeYears(programmeId),
        ]);

        setProgramme(programmeData);
        setProgrammeYears(yearsData);

        const joinedIds: number[] = [];
        await Promise.all(
          yearsData.map(async (year) => {
            try {
              await getParticipantInfoByUserIdAndProgrammeYearId(
                user.id,
                year.id
              );
              joinedIds.push(year.id);
            } catch (err: any) {
              const msg = err?.messageText?.toLowerCase?.() ?? "";
              if (!msg.includes("participant not found")) {
                console.error(
                  `Error checking participation for year ${year.id}:`,
                  err
                );
              }
            }
          })
        );
        setJoinedProgrammeYearIds(joinedIds);
      } catch (err) {
        console.error("Error fetching programme details:", err);
        toast.error("Error fetching programme details.");
        setError("Failed to load programme details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeId, user?.id]);

  const handleJoinRedirect = async (programmeYearId: number) => {
    if (!user?.id) {
      toast.error("You must be logged in to join a programme.");
      return;
    }

    try {
      await getParticipantInfoByUserIdAndProgrammeYearId(
        user.id,
        programmeYearId
      );
      toast.success("You're already a participant in this programme year!");
      router.push(
        `/participant/programmes/${programmeId}/years/${programmeYearId}/my-details`
      );
    } catch (err: any) {
      const msg = err?.messageText?.toLowerCase?.() ?? "";
      if (msg.includes("participant not found")) {
        router.push(
          `/participant/programmes/${programmeId}/years/${programmeYearId}/join`
        );
      } else {
        toast.error("Error checking participant status.");
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        role="status"
        aria-live="polite"
      >
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 dark:text-red-400 text-center" role="alert">
        {error}
      </p>
    );
  }

  return (
    <main
      className="w-full max-w-screen-md mx-auto px-4 py-6 sm:px-6 lg:px-8 bg-light dark:bg-zinc-900 text-black dark:text-white rounded shadow transition-colors duration-300 dark:border dark:border-white/30"
      role="main"
      aria-labelledby="programme-title"
    >
      <header>
        <h1
          id="programme-title"
          className="text-2xl sm:text-3xl font-bold mb-4"
        >
          {programme?.name}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {programme?.description}
        </p>
      </header>

      <section className="mt-8" aria-labelledby="years-heading">
        <h2 id="years-heading" className="text-lg font-semibold mb-3">
          Programme Years
        </h2>

        <div>
          {programmeYears && programmeYears.length > 0 ? (
            programmeYears.map((year) => (
              <article
                key={year.id}
                aria-labelledby={`programme-year-${year.id}`}
                className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
              >
                <div>
                  <h3 id={`programme-year-${year.id}`} className="sr-only">
                    Programme Year {year.academicYear}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Year: {year.academicYear}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Status: {year.isActive ? "🟢 Active" : "⚪ Inactive"}
                  </p>
                </div>
                {programmeId !== null && (
                  <Button
                    onClick={() => handleJoinRedirect(year.id)}
                    className="w-full sm:w-auto"
                    aria-label={
                      joinedProgrammeYearIds.includes(year.id)
                        ? `View your details for academic year ${year.academicYear}`
                        : `Join programme year ${year.academicYear}`
                    }
                  >
                    {joinedProgrammeYearIds.includes(year.id)
                      ? "View Your Details"
                      : "Join this Programme Year"}
                  </Button>
                )}
              </article>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400" role="note">
              No programme years available.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProgrammeDetails;
