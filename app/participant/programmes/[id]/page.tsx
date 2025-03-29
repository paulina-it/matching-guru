"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYears } from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { getParticipantInfoByUserIdAndProgrammeYearId } from "@/app/api/participant";

const ProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>() || {};
  const programmeId = id ? parseInt(id, 10) : null;
  const [joinedProgrammeYearIds, setJoinedProgrammeYearIds] = useState<
    number[]
  >([]);

  const router = useRouter();

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYears, setProgrammeYears] = useState<
    ProgrammeYearDto[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
              const msg = err?.message?.toLowerCase?.() ?? "";
              if (!msg.includes("404")) {
                console.error(`Error checking year ${year.id}:`, err);
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

  const handleJoinRedirect = async (
    programmeYearId: number,
    programmeId: number
  ) => {
    if (!user?.id) {
      toast.error("You must be logged in to join a programme.");
      return;
    }

    try {
      const participant = await getParticipantInfoByUserIdAndProgrammeYearId(
        user.id,
        programmeYearId
      );

      if (participant) {
        toast.success("You're already a participant in this programme year!");
        router.push(
          `/participant/programmes/${programmeId}/years/${programmeYearId}/my-details`
        );
      } else {
        router.push(
          `/participant/programmes/${programmeId}/years/${programmeYearId}/join`
        );
      }
    } catch (err: any) {
      const message = err?.message?.toLowerCase?.() ?? "";
      if (message.includes("404")) {
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
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
    );
  }

  return (
    <div className="max-w-[55vw] bg-light dark:bg-zinc-900 text-black dark:text-white p-6 rounded shadow relative transition-colors duration-300 dark:border dark:border-white/30">
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700 dark:text-gray-300">
        {programme?.description}
      </p>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Programme Years</h3>
        {programmeYears && programmeYears.length > 0 ? (
          programmeYears.map((year) => (
            <div
              key={year.id}
              className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded shadow flex justify-between items-center transition-colors"
            >
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  Year: {year.academicYear}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Status: {year.isActive ? "🟢 Active" : "⚪ Inactive"}
                </p>
              </div>
              {programmeId !== null && (
                <Button
                  onClick={() => handleJoinRedirect(year.id, programmeId)}
                >
                  {joinedProgrammeYearIds.includes(year.id)
                    ? "View Your Details"
                    : "Join this Programme Year"}
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No programme years available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgrammeDetails;
