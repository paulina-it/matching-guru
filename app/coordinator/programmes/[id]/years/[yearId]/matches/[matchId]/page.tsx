"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchDetailedMatchById, updateMatchStatus } from "@/app/api/matching";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { formatText } from "@/app/utils/text";

const MatchDetails = () => {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId ? parseInt(params.matchId, 10) : null;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setError("Invalid match ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const matchData = await fetchDetailedMatchById(matchId);
        setMatch(matchData);
        console.table(matchData);
      } catch (err) {
        toast.error("Error fetching match details: " + err);
        setError("Failed to load match details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  const handleStatusUpdate = async (status: "APPROVED" | "DECLINED") => {
    if (!matchId) return;
    setUpdating(true);

    try {
      await updateMatchStatus([matchId], status);
      toast.success(`Match ${status.toLowerCase()} successfully`);

      setMatch((prev: any) => ({ ...prev, status }));
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} match.`);
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }

  const weekDayOrder = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

  console.log(match);

  const sortAvailableDays = (availableDays: string[]) => {
    const splitDays = availableDays.flatMap((day: string) => {
      return day.split(" ").map((d) => d.trim());
    });

    const validDays = splitDays.filter(
      (day) => weekDayOrder[day as keyof typeof weekDayOrder] !== undefined
    );

    return validDays.sort((a, b) => {
      const dayA = weekDayOrder[a as keyof typeof weekDayOrder];
      const dayB = weekDayOrder[b as keyof typeof weekDayOrder];

      return dayA - dayB;
    });
  };

  return (
    <div className="lg:max-w-[65vw] max-w-[95vw] m-5 mt-[5em] bg-light  dark:bg-dark dark:border dark:border-white/30  p-6 rounded shadow relative">
      <h2 className="h2 font-bold mb-4">Match Details</h2>

      <div className="mt-4">
        <h3 className="h3">Match Information</h3>
        <p className="flex items-center gap-2">
          <strong>Status:</strong>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              match?.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : match?.status === "DECLINED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {match?.status}
          </span>
        </p>

        <p>
          <strong>Created At:</strong>{" "}
          {match?.createdAt ? new Date(match.createdAt).toLocaleString() : "-"}
        </p>
        <p>
          <strong>Last Updated:</strong>{" "}
          {match?.updatedAt ? new Date(match.updatedAt).toLocaleString() : "-"}
        </p>
        <p>
          <strong>Compatibility Score:</strong> {match?.compatibilityScore}
        </p>

        <div className="lg:absolute top-6 right-6 flex justify-center gap-3 mt-4">
          <Button
            onClick={() => handleStatusUpdate("APPROVED")}
            disabled={updating || match?.status === "APPROVED"}
            className={`bg-secondary text-white hover:bg-secondary-hover
          }`}
          >
            {updating ? "Processing..." : "Approve"}
          </Button>

          <Button
            variant={"outline"}
            onClick={() => handleStatusUpdate("DECLINED")}
            disabled={updating || match?.status === "DECLINED"}
            className={`bg-accent text-white hover:bg-accent-hover ${
              updating ? "opacity-50" : ""
            }`}
          >
            {updating ? "Processing..." : "Decline"}
          </Button>
        </div>
      </div>
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* Mentor Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">👨‍🏫 Mentor</h3>
            <span className="text-xs text-muted-foreground ">
              ID: {match.mentor.participantId}
            </span>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-bold">Name</span>
              <span>
                {match.mentor.firstName} {match.mentor.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Email</span>
              <span>{match.mentor.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Course</span>
              <span>{match.mentor.course}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Academic Stage</span>
              <span>{formatText(match.mentor.academicStage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Gender</span>
              <span>{formatText(match.mentor.gender)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Age Group</span>
              <span>
                {match.mentor.ageGroup?.replace("AGE_", "").replace(/_/g, "-")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Home Country</span>
              <span>{match.mentor.homeCountry}</span>
            </div>
          </div>

          {/* Availability & Skills */}
          <div className="mt-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">
              Availability
            </p>
            <div className="flex flex-wrap gap-2">
            {match.mentor.availableDays?.length > 0 ? (
                sortAvailableDays(match.mentor.availableDays).map((day: string) => (
                  <span key={day} className="bg-muted text-xs px-3 py-1 rounded-full">
                    {formatText(day)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">Not specified</span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm font-bold text-muted-foreground mb-1">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {match.mentor.skills?.length > 0 ? (
                match.mentor.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-muted text-xs px-3 py-1 rounded-full"
                  >
                    {formatText(skill)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Mentee Card (same styling) */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">🧑‍🎓 Mentee</h3>
            <span className="text-xs text-muted-foreground">
              ID: {match.mentee.participantId}
            </span>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-bold">Name</span>
              <span>
                {match.mentee.firstName} {match.mentee.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Email</span>
              <span>{match.mentee.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Course</span>
              <span>{match.mentee.course}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Academic Stage</span>
              <span>{formatText(match.mentee.academicStage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Gender</span>
              <span>{formatText(match.mentee.gender)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Age Group</span>
              <span>
                {match.mentee.ageGroup?.replace("AGE_", "").replace(/_/g, "-")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Home Country</span>
              <span>{match.mentee.homeCountry}</span>
            </div>
          </div>

          {/* Availability & Skills */}
          <div className="mt-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">
              Availability
            </p>
            <div className="flex flex-wrap gap-2">
              {match.mentee.availableDays?.length > 0 ? (
                sortAvailableDays(match.mentee.availableDays).map(
                  (day: string) => (
                    <span
                      key={day}
                      className="bg-muted text-xs px-3 py-1 rounded-full"
                    >
                      {formatText(day)}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Not specified
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm font-bold text-muted-foreground mb-1">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {match.mentee.skills?.length > 0 ? (
                match.mentee.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-muted text-xs px-3 py-1 rounded-full"
                  >
                    {formatText(skill)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className="mt-6 flex gap-4">
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div> */}
    </div>
  );
};

export default MatchDetails;
