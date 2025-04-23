"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  downloadServerCertificate,
  fetchProgrammeById,
  fetchProgrammeYear,
} from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearResponseDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getParticipantInfoByUserIdAndProgrammeYearId } from "@/app/api/participant";
import { useAuth } from "@/app/context/AuthContext";
import { Pencil, Trash, CheckCircle } from "lucide-react";
import { formatText } from "@/app/utils/text";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CommunicationStatus,
  CommunicationType,
  CommunicationLogCreateDto,
  CommunicationLogDto,
} from "@/app/types/communicationLog";
import {
  createCommunicationLog,
  deleteCommunicationLog,
  getLogsForMatch,
  updateCommunicationLog,
} from "@/app/api/communicationLogs";
import FeedbackSubmissionBox from "@/components/FeedbackSubmissionBox";

const ParticipantProgrammeDetails = () => {
  const params = useParams() as { id: string; programmeYearId: string };
  const programmeId = parseInt(params.id, 10);
  const programmeYearId = parseInt(params.programmeYearId, 10);
  const { user } = useAuth();

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
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
  const [participantInfoList, setParticipantInfoList] = useState<any[]>([]);
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
  const [logs, setLogs] = useState<CommunicationLogDto[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [feedbackCode, setFeedbackCode] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const now = new Date();
  const [surveyOpen, setSurveyOpen] = useState<Date | null>();
  const [surveyClosed, setSurveyClosed] = useState<Date | null>();
  const [canShowFeedbackBox, setCanShowFeedbackBox] = useState<boolean>(false);

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
        {/* {matchDetails.length === 1 && (
          <p className="bg-secondary dark:bg-secondary-dark text-white rounded p-2 w-fit absolute top-6 right-6">
            Status:{" "}
            {matchDetails[0].status === "APPROVED"
              ? "✅ Match Confirmed"
              : "⏳ Match Pending"}
          </p>
        )} */}

        {participant && (
          <div className="mt-6 border p-4 rounded bg-gray-100 dark:bg-dark dark:border dark:border-white/20 text-dark dark:text-light">
            <h3 id="profile-heading" className="h3">
              Your Profile
            </h3>
            <p>
              <strong>Role:</strong> {formatText(participant?.role)}
            </p>
            <p>
              <strong>Name:</strong> {participant?.firstName}
            </p>
            <p>
              <strong>Email:</strong> {participant?.email}
            </p>
            <p>
              <strong>Course:</strong> {participant?.course}
            </p>
            <p>
              <strong>Academic Stage:</strong>{" "}
              {formatText(participant?.academicStage)}
            </p>
            <p>
              <strong>Skills:</strong>{" "}
              {participant?.skills?.length
                ? participant.skills.map(formatText).join(", ")
                : "None listed"}
            </p>
            <p>
              <strong>Available Days:</strong>{" "}
              {participant?.availableDays?.length
                ? sortAvailableDays(participant.availableDays)
                    .map(formatText)
                    .join(", ")
                : "None listed"}
            </p>

            <div className="mt-4">
              {participant?.hasSubmittedFeedback ? (
                <Button
                  variant="default"
                  onClick={() =>
                    downloadServerCertificate(
                      `${participant.firstName} ${participant.lastName}`,
                      participant.role.toLowerCase(),
                      programmeYear?.programmeName || "",
                      programmeYear?.academicYear || "",
                      new Date().toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    )
                  }
                >
                  Download Certificate
                </Button>
              ) : matchDetails.some((m) => m.status === "APPROVED") ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(programmeYear?.surveyUrl ?? "#", "_blank")
                  }
                >
                  Provide Feedback
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {Array.isArray(matchDetails) && matchDetails.length > 0 ? (
          matchDetails.map((match, idx) => {
            const logs = logsByMatchId[match.id] || [];

            console.log(participant);
            const sortedLogs = [...logs].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            const lastInteraction = sortedLogs.find(
              (log) => log.status === CommunicationStatus.COMPLETED
            );

            const msInDay = 1000 * 60 * 60 * 24;
            let daysSinceLastInteraction: number | null = null;
            if (lastInteraction) {
              daysSinceLastInteraction = Math.floor(
                (now.getTime() -
                  new Date(lastInteraction.timestamp).getTime()) /
                  msInDay
              );
            } else if (match.updatedAt) {
              daysSinceLastInteraction = Math.floor(
                (now.getTime() - new Date(match.updatedAt).getTime()) / msInDay
              );
            }

            const shared = (() => {
              const mentor = match.mentor;
              const mentee = match.mentee;

              if (!mentor || !mentee) return null;

              const mentorDays = mentor.availableDays || [];
              const menteeDays = mentee.availableDays || [];
              const sharedDays = mentorDays.filter((day: string) =>
                menteeDays.includes(day)
              );
              if (!sharedDays.length) return null;

              const formattedDay =
                sharedDays[0].charAt(0).toUpperCase() +
                sharedDays[0].slice(1).toLowerCase();

              const mentorTime = mentor.timeRange || "ANYTIME";
              const menteeTime = mentee.timeRange || "ANYTIME";

              let timeSuggestion = "any time";
              if (mentorTime === menteeTime)
                timeSuggestion = mentorTime.toLowerCase();
              else if (mentorTime === "ANYTIME")
                timeSuggestion = menteeTime.toLowerCase();
              else if (menteeTime === "ANYTIME")
                timeSuggestion = mentorTime.toLowerCase();

              return { day: formattedDay, time: timeSuggestion };
            })();

            const nextDate =
              shared && getNextDateForDay
                ? getNextDateForDay(shared.day)
                : "(next available)";

            const emailBody = `Hi ${
              isMentor
                ? match.mentee?.firstName || "there"
                : match.mentor?.firstName || "there"
            },

I hope you're well! Since we’re matched for the mentoring programme, I’d love to schedule our first meeting.

Would ${shared?.day.toLowerCase()} (${nextDate}) ${shared?.time} work for you?

Looking forward to connecting!

Best regards,  
${user?.firstName}`;

            return (
              <div
                key={match.id}
                className="mt-8 border p-4 rounded bg-gray-100 dark:bg-dark dark:border dark:border-white/30
              text-dark dark:text-white"
              >
                <h4 className="h4 text-lg mb-3 flex justify-between items-center">
                  Match #{idx + 1}
                  <span
                    className={`text-sm px-3 py-1 rounded font-medium ${
                      match.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {match.status === "APPROVED"
                      ? "✅ Match Confirmed"
                      : "⏳ Match Pending"}
                  </span>
                </h4>

                {/* Suggested Email */}
                {match.status === "APPROVED" && (
                  <>
                    {" "}
                    {/* Matched person info */}
                    {isMentor ? (
                      <div
                        key={match.mentee.id}
                        className="mb-4 p-3 border rounded bg-white dark:bg-light/10 flex flex-col gap-2 sm:gap-3"
                      >
                        <p>
                          <strong>Name:</strong> {match.mentee.firstName}{" "}
                          {match.mentee.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {match.mentee.email}
                        </p>
                        <p>
                          <strong>Course:</strong> {match.mentee.course}
                        </p>
                        <p>
                          <strong>Academic Stage:</strong>{" "}
                          {formatText(match.mentee.academicStage)}
                        </p>
                        <p>
                          <strong>Available Days:</strong>{" "}
                          {match.mentee?.availableDays?.length
                            ? sortAvailableDays(match.mentee?.availableDays)
                                .map(formatText)
                                .join(", ")
                            : "None listed"}
                        </p>
                        <p>
                          <strong>Skills:</strong>{" "}
                          {match.mentee.skills?.length
                            ? match.mentee.skills.map(formatText).join(", ")
                            : "None listed"}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 border rounded bg-white dark:bg-light/10 flex flex-col gap-2 sm:gap-3">
                        <p>
                          <strong>Name:</strong> {match.mentor?.firstName}{" "}
                          {match.mentor?.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {match.mentor?.email}
                        </p>
                        <p>
                          <strong>Course:</strong> {match.mentor?.course}
                        </p>
                        <p>
                          <strong>Academic Stage:</strong>{" "}
                          {formatText(match.mentor?.academicStage)}
                        </p>
                        <p>
                          <strong>Available Days:</strong>{" "}
                          {match.mentor?.availableDays?.length
                            ? sortAvailableDays(match.mentor?.availableDays)
                                .map(formatText)
                                .join(", ")
                            : "None listed"}
                        </p>
                        <p>
                          <strong>Skills:</strong>{" "}
                          {match.mentor?.skills?.length
                            ? match.mentor.skills.map(formatText).join(", ")
                            : "None listed"}
                        </p>
                      </div>
                    )}
                    <p className="mt-2">
                      <strong>Compatibility Score:</strong>{" "}
                      {match.compatibilityScore}%
                    </p>
                    {shared && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        🕒 You're both available on{" "}
                        <strong>{shared.day}</strong> at{" "}
                        <strong>{shared.time}</strong>
                      </p>
                    )}
                    {/* Contact Match */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto mt-2 sm:mt-0"
                        >
                          Contact Your Match
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="suggested-email"
                      >
                        <DialogHeader>
                          <DialogTitle id="suggested-email">
                            Suggested Email
                          </DialogTitle>
                        </DialogHeader>
                        <Textarea
                          value={emailBody}
                          readOnly
                          className="w-full min-h-[20em]"
                        />
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              const recipient = isMentor
                                ? match.mentees?.[0]?.email
                                : match.mentor?.email;

                              if (!recipient) {
                                toast.error("Match email not found.");
                                return;
                              }

                              const subject = encodeURIComponent(
                                "Mentoring Programme: Let's schedule a meeting"
                              );
                              const bodyEncoded = encodeURIComponent(emailBody);
                              window.location.href = `mailto:${recipient}?subject=${subject}&body=${bodyEncoded}`;
                            }}
                            className="w-full sm:w-auto mt-2 sm:mt-0"
                          >
                            Send Email
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {/* Log Interaction */}
                    <Button
                      variant="default"
                      className="w-full sm:w-auto mt-2 sm:mt-0 lg:ml-3 lg:mt-4"
                      onClick={() => openNewLogDialog(match.id)}
                    >
                      Log Interaction
                    </Button>
                    {/* No logs message */}
                    {logs.length === 0 && (
                      <p className="text-sm mt-4 italic text-yellow-600">
                        No interactions logged yet.
                      </p>
                    )}
                    {/* Interaction History */}
                    {daysSinceLastInteraction !== null &&
                      daysSinceLastInteraction > 14 && (
                        <p className="text-accent mt-2 font-medium italic text-sm">
                          ⚠️ It's been over 2 weeks since your last logged
                          interaction. Consider reaching out to your match!
                        </p>
                      )}
                    {logs.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-start mb-1 h3">
                          Interaction History
                        </h3>
                        <ul className="space-y-2 overflow-x-auto">
                          {logs
                            .sort(
                              (a, b) =>
                                new Date(b.timestamp).getTime() -
                                new Date(a.timestamp).getTime()
                            )
                            .map((log) => (
                              <li
                                key={log.id}
                                className="text-sm border p-2 rounded flex justify-between"
                              >
                                <span>
                                  {new Date(log.timestamp).toLocaleString(
                                    "en-GB"
                                  )}{" "}
                                  –{" "}
                                  <strong>{log.type.replace(/_/g, " ")}</strong>{" "}
                                  – <em>{log.status}</em>
                                </span>
                                <div className="flex items-center gap-2 ml-4">
                                  {log.status !==
                                    CommunicationStatus.COMPLETED && (
                                    <button
                                      onClick={() =>
                                        handleMarkCompleted(log, match.id)
                                      }
                                      className="text-green-600 hover:text-green-800"
                                      title="Mark as Completed"
                                      aria-label="Mark log as completed"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openEditDialog(log)}
                                    className="text-primary hover:text-primary-hover dark:text-primary-dark dark:hover:text-primary-darkHover"
                                    title="Edit"
                                    aria-label="Edit interaction log"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteLog(log.id, match.id)
                                    }
                                    className="text-accent hover:text-accent-hover dark:text-accent-dark dark:hover:text-accent-darkHover"
                                    title="Delete"
                                    aria-label="Delete interaction log"
                                  >
                                    <Trash size={16} />
                                  </button>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p className="italic mt-4 text-gray-500">No match found yet.</p>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-title"
          >
            <DialogHeader>
              <DialogTitle id="log-title">
                {editingLogId ? "Edit" : "Log"} Interaction
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <label className="block">
                Type:
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CommunicationType)}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  {Object.values(CommunicationType).map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                Status:
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as CommunicationStatus)
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  {Object.values(CommunicationStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="timestamp" className="block">
                Timestamp:
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  id="timestamp"
                  aria-labelledby="timestamp-label"
                  aria-required="true"
                />
              </label>
            </div>

            <DialogFooter>
              <Button
                onClick={editingLogId ? handleUpdateLog : handleCreateLog}
              >
                {editingLogId ? "Update Log" : "Save Log"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
};

export default ParticipantProgrammeDetails;
