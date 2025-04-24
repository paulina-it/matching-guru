"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchDetailedMatchById, updateMatchStatus } from "@/app/api/matching";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { formatText } from "@/app/utils/text";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/app/context/AuthContext";
import ParticipantAdminCard from "@/components/ParticipantAdminCard";

const MatchDetails = () => {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId ? parseInt(params.matchId, 10) : null;
  const { user } = useAuth();

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  const handleStatusUpdate = async (
    status: "APPROVED" | "DECLINED",
    reason?: string
  ) => {
    const parsedMatchId = Number(matchId);
    if (!parsedMatchId || !user?.id) {
      toast.error("Invalid match ID or user ID.");
      console.error("Bad updateMatchStatus call", { matchId, userId: user?.id });
      return;
    }
    if (!user?.id) {
      toast.error("User ID missing. Cannot update match status.");
      return;
    } else toast.success("User ID: "+user.id);
    
    try {
      await updateMatchStatus([parsedMatchId], status, user.id, reason);
      toast.success(`Match ${status.toLowerCase()} successfully`);

      setMatch((prev: any) => ({ ...prev, status }));
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} match.`);
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const findSharedItems = (mentorItems: string[], menteeItems: string[]) => {
    return mentorItems.filter(item => menteeItems.includes(item));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
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
  const statusStyles: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    APPROVED: {
      label: "Approved by Coordinator",
      className: "bg-green-100 text-green-800",
    },
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

  const matchStatus = match?.status?.toUpperCase();
  const statusDisplay = statusStyles[matchStatus] ?? {
    label: matchStatus || "Unknown",
    className: "bg-gray-100 text-gray-800",
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

  if (!match?.mentor || !match?.mentee) {
    return <div className="text-red-600 font-semibold">Invalid match data</div>;
  }

  const sharedDays = findSharedItems(match.mentor.availableDays || [], match.mentee.availableDays || []);
  const sharedSkills = findSharedItems(match.mentor.skills || [], match.mentee.skills || []);

  return (
    <div className="lg:max-w-[65vw] max-w-[95vw] m-5 mt-[5em] bg-light  dark:bg-dark dark:border dark:border-white/30  p-6 rounded shadow relative">
      <h2 className="h2 font-bold mb-4">Match Details</h2>

      <div className="mt-4">
        <h3 className="h3">Match Information</h3>
        <p className="flex items-center gap-2">
          <strong>Status:</strong>
          <span
            className={`px-2 py-1 text-xs rounded-full ${statusDisplay.className}`}
          >
            {statusDisplay.label}
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

        {["PENDING", "APPROVED"].includes(match?.status) && (
          <div className="lg:absolute top-6 right-6 flex justify-center gap-3 mt-4">
            <Button
              onClick={() => handleStatusUpdate("APPROVED")}
              disabled={updating}
              className="bg-secondary text-white hover:bg-secondary-hover"
            >
              {updating ? "Processing..." : "Approve"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowRejectionDialog(true)}
              disabled={updating}
              className={`bg-accent text-white hover:bg-accent-hover ${
                updating ? "opacity-50" : ""
              }`}
            >
              {updating ? "Processing..." : "Decline"}
            </Button>
          </div>
        )}

        <div>
          {match.status === "REJECTED" && (
            <div className="mt-2 text-sm text-red-500 space-y-1">
              {match.rejectionReason && (
                <p>
                  <span className="italic font-medium">Rejected because:</span>{" "}
                  "{match.rejectionReason}"
                </p>
              )}
              {match.rejectedByUserName && (
                <p className="italic">
                  <span className="font-medium">Rejected by:</span>{" "}
                  {match.rejectedByUserName}
                </p>
              )}
            </div>
          )}

          {match.status === "DECLINED" &&
            (match.rejectionReason || match.rejectedByUserName) && (
              <div className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800 space-y-1">
                {match.rejectionReason && (
                  <p>
                    <span className="font-semibold italic">
                      Declined by {match.editedByUserName} because:
                    </span>{" "}
                    “{match.rejectionReason}”
                  </p>
                )}
            
              </div>
            )}

          {match.status === "ACCEPTED_BY_ONE_PARTY" &&
            match.editedByUserName && (
              <p className="mt-4 text-sm text-secondary bg-secondary/10 dark:bg-secondary-dark/20 p-3 rounded-md border border-secondary dark:border-secondary-dark space-y-1 italic">
                Accepted by: {match.editedByUserName}
              </p>
            )}
        </div>
      </div>
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <ParticipantAdminCard
          participant={match.mentor}
          role="mentor"
          sortAvailableDays={sortAvailableDays}
          sharedDays={sharedDays}
          sharedSkills={sharedSkills}
        />
        <ParticipantAdminCard
          participant={match.mentee}
          role="mentee"
          sortAvailableDays={sortAvailableDays}
          sharedDays={sharedDays}
          sharedSkills={sharedSkills}
        />
      </div>

      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Match</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please provide a brief reason for declining this match.
          </p>
          <Textarea
            placeholder="e.g. The mentor's academic stage is too different"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="mt-2"
          />
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRejectionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={updating || !rejectionReason.trim()}
              onClick={() => {
                setShowRejectionDialog(false);
                handleStatusUpdate("DECLINED", rejectionReason);
              }}
            >
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchDetails;