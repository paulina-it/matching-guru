"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProgrammeYear } from "@/app/api/programmes";
import { ProgrammeYearResponseDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import { getParticipantInfoByUserIdAndProgrammeYearId } from "@/app/api/participant";
import { useAuth } from "@/app/context/AuthContext";
import {
  CommunicationStatus,
  CommunicationType,
  CommunicationLogDto,
} from "@/app/types/communicationLog";
import {
  createCommunicationLog,
  deleteCommunicationLog,
  getLogsForMatch,
  updateCommunicationLog,
} from "@/app/api/communicationLogs";
import FeedbackSubmissionBox from "@/components/FeedbackSubmissionBox";
import { submitMatchDecision } from "@/app/api/matching";
import ParticipantProfileCard from "@/components/ParticipantProfileCard";
import MatchList from "@/components/MatchList";
import InteractionLogDialog from "@/components/InteractionLogDialog";
import RejectMatchDialog from "@/components/RejectMatchDialog";

const ParticipantProgrammeDetails = () => {
  const params = useParams() as { id: string; programmeYearId: string };
  const programmeId = parseInt(params.id, 10);
  const programmeYearId = parseInt(params.programmeYearId, 10);
  const { user } = useAuth();

  const [programmeYear, setProgrammeYear] =
    useState<ProgrammeYearResponseDto | null>(null);
  const [matchDetails, setMatchDetails] = useState<any[]>([]);
  const [logsByMatchId, setLogsByMatchId] = useState<
    Record<number, CommunicationLogDto[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMentor, setIsMentor] = useState<boolean | null>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [type, setType] = useState<CommunicationType>(
    CommunicationType.VIDEO_CALL
  );
  const [status, setStatus] = useState<CommunicationStatus>(
    CommunicationStatus.SCHEDULED
  );
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const now = new Date();
  const [surveyOpen, setSurveyOpen] = useState<Date | null>();
  const [surveyClosed, setSurveyClosed] = useState<Date | null>();
  const [canShowFeedbackBox, setCanShowFeedbackBox] = useState<boolean>(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMatchId, setRejectMatchId] = useState<number | null>(null);
  
  const weekDayOrder = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

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

  useEffect(() => {
    const fetchData = async () => {
      if (!programmeYearId || !user) return;

      try {
        const [programmeData, participantData] = await Promise.all([
          fetchProgrammeYear(programmeYearId),
          getParticipantInfoByUserIdAndProgrammeYearId(
            user.id,
            programmeYearId
          ),
        ]);

        setProgrammeYear(programmeData);
        console.log(participantData);

        // Case 1: user has one or more matches
        if (Array.isArray(participantData)) {
          setMatchDetails(participantData);

          const userIsMentor = participantData[0]?.mentor?.email === user.email;
          setIsMentor(userIsMentor);

          const selected = userIsMentor
            ? { ...participantData[0].mentor, role: "MENTOR" }
            : { ...participantData[0].mentee, role: "MENTEE" };

          setParticipant(selected);

          const logsObj: Record<number, CommunicationLogDto[]> = {};
          for (const match of participantData) {
            const logs = await getLogsForMatch(match.id);
            logsObj[match.id] = logs;
          }
          setLogsByMatchId(logsObj);
        }

        // Case 2: user has no matches, but is still a participant
        else {
          setMatchDetails([]);
          setIsMentor(null);

          const userInfo = participantData || {};
          setParticipant({
            role: participantData.role ?? "MENTOR",
            firstName: participantData.userName?.split(" ")[0] || "",
            lastName: participantData.userName?.split(" ")[1] || "",
            email: participantData.userEmail,
            course: participantData.userCourseName,
            academicStage: participantData.academicStage,
            skills: participantData.skills,
            availableDays: participantData.availableDays,
            personalityType: participantData.userPersonalityType,
            gender: participantData.userGender,
            livingArrangement: participantData.userLivingArrangement,
            homeCountry: participantData.userHomeCountry,
            hasSubmittedFeedback: participantData.hasSubmittedFeedback,
          });
        }
      } catch (err) {
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeId, programmeYearId, user]);

  useEffect(() => {
    const setSurveyDates = () => {
      setSurveyOpen(programmeYear?.surveyOpenDate);
      setSurveyClosed(programmeYear?.surveyCloseDate);

      if (surveyOpen != null && surveyClosed != null) {
        setCanShowFeedbackBox(now >= surveyOpen && now <= surveyClosed);
      }
    };

    setSurveyDates();
  }, [programmeYear]);

  const getNextDateForDay = (dayName: string): string => {
    const daysOfWeek: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDayIndex = daysOfWeek[dayName];
    if (targetDayIndex === undefined) return "";

    const today = new Date();
    const todayIndex = today.getDay();

    let daysUntilTarget = (targetDayIndex - todayIndex + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysUntilTarget);

    return nextDate.toLocaleDateString("en-GB", {
      // weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleCreateLog = async () => {
    if (!selectedMatchId) return;
    try {
      closeDialog();
      await createCommunicationLog({
        matchId: selectedMatchId,
        type,
        status,
        timestamp,
      });
      toast.success("Interaction logged successfully!");

      const updatedLogs = await getLogsForMatch(selectedMatchId);
      setLogsByMatchId((prev) => ({ ...prev, [selectedMatchId]: updatedLogs }));
      closeDialog();
    } catch (err: any) {
      toast.error(err.message || "Failed to log interaction");
    }
  };

  const handleUpdateLog = async () => {
    if (!editingLogId || !selectedMatchId) return;
    try {
      closeDialog();
      await updateCommunicationLog(editingLogId, {
        matchId: selectedMatchId,
        type,
        status,
        timestamp,
      });
      toast.success("Interaction updated!");

      const updatedLogs = await getLogsForMatch(selectedMatchId);
      setLogsByMatchId((prev) => ({ ...prev, [selectedMatchId]: updatedLogs }));
      closeDialog();
    } catch (err: any) {
      toast.error(err.message || "Failed to update log");
    }
  };

  const handleDeleteLog = async (logId: number, matchId: number) => {
    try {
      await deleteCommunicationLog(logId);
      toast.success("Interaction deleted");
      const updatedLogs = await getLogsForMatch(matchId);
      setLogsByMatchId((prev) => ({ ...prev, [matchId]: updatedLogs }));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleMarkCompleted = async (
    log: CommunicationLogDto,
    matchId: number
  ) => {
    try {
      await updateCommunicationLog(log.id, {
        matchId: log.matchId,
        type: log.type,
        status: CommunicationStatus.COMPLETED,
        timestamp: log.timestamp,
      });
      toast.success("Marked as completed!");
      const updatedLogs = await getLogsForMatch(matchId);
      setLogsByMatchId((prev) => ({ ...prev, [matchId]: updatedLogs }));
    } catch (err) {
      toast.error("Failed to complete log");
    }
  };

  const openEditDialog = (log: CommunicationLogDto) => {
    setEditingLogId(log.id);
    setType(log.type);
    setStatus(log.status);
    setTimestamp(new Date(log.timestamp).toISOString().slice(0, 16));
    setIsDialogOpen(true);
  };

  const openNewLogDialog = (matchId: number) => {
    setSelectedMatchId(matchId);
    setEditingLogId(null);
    setType(CommunicationType.VIDEO_CALL);
    setStatus(CommunicationStatus.SCHEDULED);
    setTimestamp(new Date().toISOString().slice(0, 16));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingLogId(null);
  };

  const handleMatchDecision = async (
    matchId: number,
    decision: "ACCEPTED" | "REJECTED",
    rejectionReason?: string
  ) => {
    try {
      if (!user?.id) {
        toast.error("User ID missing.");
        return;
      }

      await submitMatchDecision({
        matchId,
        decision,
        userId: user.id,
        rejectionReason: decision === "REJECTED" ? rejectionReason : undefined,
      });

      toast.success(
        `You ${decision === "ACCEPTED" ? "accepted" : "rejected"} the match!`
      );
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${decision.toLowerCase()} match`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div
      aria-labelledby="programme-title"
      className="w-full max-w-[90%] mx-auto px-4 py-6 sm:px-6 lg:px-8 bg-light p-4 sm:p-6 rounded shadow dark:bg-dark dark:border dark:border-white/30 text-light mt-[5em] relative"
    >
      <h1 className="sr-only">Participant Programme Details</h1>
      <h2
        id="programme-title"
        className="h2 font-bold mb-4 text-dark dark:text-light"
      >
        {programmeYear?.programmeName ?? "N/A"} |{" "}
        {programmeYear?.academicYear ?? "N/A"}
      </h2>
      <p className="text-gray-700 dark:text-light/60">
        {programmeYear?.programmeDescription ?? "No description available"}
      </p>
      {programmeYear?.contactEmail && (
        <p className=" text-dark dark:text-light mt-3">
          Contact details: {programmeYear?.contactEmail}
        </p>
      )}
      {canShowFeedbackBox &&
        matchDetails.some((m) => m.status === "APPROVED") && (
          <section aria-labelledby="feedback-heading">
            <h3 id="feedback-heading">Feedback</h3>
            <FeedbackSubmissionBox
              userId={user!.id}
              programmeYearId={programmeYearId}
              alreadySubmitted={participant?.hasSubmittedFeedback}
            />
          </section>
        )}

      <section aria-labelledby="profile-heading" className="mt-8 space-y-6">
        {participant && (
          <ParticipantProfileCard
            participant={participant}
            programmeYear={programmeYear}
            codeVerified={codeVerified}
            feedbackModalOpen={feedbackModalOpen}
            setFeedbackModalOpen={setFeedbackModalOpen}
          />
        )}

        <MatchList
          matches={matchDetails}
          participant={participant}
          isMentor={isMentor!}
          user={user!}
          logsByMatchId={logsByMatchId}
          sortAvailableDays={sortAvailableDays}
          getNextDateForDay={getNextDateForDay}
          onAccept={(matchId) =>
            handleMatchDecision(matchId, "ACCEPTED")
          }
          onReject={(matchId) => {
            setRejectMatchId(matchId);
            setShowRejectDialog(true);
          }}
          
          onLogCreate={openNewLogDialog}
          onEditLog={openEditDialog}
          onDeleteLog={handleDeleteLog}
          onMarkCompleted={handleMarkCompleted}
        />

        <InteractionLogDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingLogId={editingLogId}
          type={type}
          setType={setType}
          status={status}
          setStatus={setStatus}
          timestamp={timestamp}
          setTimestamp={setTimestamp}
          onSubmit={editingLogId ? handleUpdateLog : handleCreateLog}
        />
        <RejectMatchDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          reason={rejectReason}
          setReason={setRejectReason}
          onConfirm={() => {
            if (rejectMatchId !== null) {
              handleMatchDecision(rejectMatchId, "REJECTED", rejectReason);
            }
            setShowRejectDialog(false);
          }}
        />
      </section>
    </div>
  );
};

export default ParticipantProgrammeDetails;
