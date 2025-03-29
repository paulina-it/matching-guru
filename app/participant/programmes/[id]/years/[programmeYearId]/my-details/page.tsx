"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProgrammeById } from "@/app/api/programmes";
import { ProgrammeDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  getParticipantInfoByUserId,
  getParticipantInfoByUserIdAndProgrammeYearId,
} from "@/app/api/participant";
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

const ParticipantProgrammeDetails = () => {
  const params = useParams() as { id: string; programmeYearId: string };
  const programmeId = parseInt(params.id, 10);
  const programmeYearId = parseInt(params.programmeYearId, 10);
  const { user } = useAuth();
  const router = useRouter();
  const [meetingLink, setMeetingLink] = useState("");
  const saveMeetingLink = () => {
    toast.success("Meeting link saved!");
  };

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [matchDetails, setMatchDetails] = useState<any>(null);
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
  const [logs, setLogs] = useState<CommunicationLogDto[]>([]);

  const generateEmailBody = () => {
    if (!matchDetails || isMentor === null) return "";

    const name = isMentor
      ? matchDetails.mentees?.[0]?.firstName || "there"
      : matchDetails.mentor?.firstName || "there";

    const shared = getSharedAvailability();
    const nextDate = shared ? getNextDateForDay(shared.day) : null;

    const emailBody = `Hi ${name},
    
    I hope you're well! Since we’re matched for the mentoring programme, I’d love to schedule our first meeting.
    
    Would ${shared?.day.toLowerCase()} (${nextDate}) ${
      shared?.time
    } work for you?
    
    Looking forward to connecting!
    
    Best regards,  
    ${user?.firstName}`;

    return emailBody;
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!programmeId || !user) {
        console.error("❌ programmeId or user is undefined");
        return;
      }

      try {
        const [programmeData, participantInfo] = await Promise.all([
          fetchProgrammeById(programmeId),
          getParticipantInfoByUserIdAndProgrammeYearId(
            user.id,
            programmeYearId
          ),
        ]);
        console.log(participantInfo);
        setProgramme(programmeData);

        if (!participantInfo) {
          console.warn("No participant info returned");
          setParticipant(null);
          setMatchDetails(null);
          setIsMentor(null);
          return;
        }
        if (participantInfo?.mentor && participantInfo?.mentee) {
          const isUserMentor = participantInfo.mentor.email === user.email;
          setIsMentor(isUserMentor);
          setParticipant(
            isUserMentor ? participantInfo.mentor : participantInfo.mentee
          );
          setMatchDetails(participantInfo);

          if (participantInfo.id) {
            const fetchedLogs = await getLogsForMatch(participantInfo.id);
            setLogs(fetchedLogs);
          }
        } else if (participantInfo?.role) {
          setParticipant(participantInfo);
          setIsMentor(participantInfo.role === "MENTOR");
          setMatchDetails(null);
        } else {
          setParticipant(null);
          setMatchDetails(null);
          setIsMentor(null);
        }
      } catch (err: any) {
        const message = err?.message?.toLowerCase?.() ?? "";

        if (message.includes("404")) {
          setParticipant(null);
          setMatchDetails(null);
          setIsMentor(null);
          setError(null);
        } else {
          console.error("Fetch error:", err);
          toast.error("Error fetching data.");
          setError("Failed to load data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (programmeId && user) {
      fetchData();
    }
  }, [programmeId, programmeYearId, user]);

  const getSharedAvailability = (): { day: string; time: string } | null => {
    const mentor = matchDetails?.mentor;
    const mentee = isMentor ? matchDetails?.mentees?.[0] : matchDetails?.mentee;

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
    if (mentorTime === menteeTime) timeSuggestion = mentorTime.toLowerCase();
    else if (mentorTime === "ANYTIME")
      timeSuggestion = menteeTime.toLowerCase();
    else if (menteeTime === "ANYTIME")
      timeSuggestion = mentorTime.toLowerCase();

    return {
      day: formattedDay,
      time: timeSuggestion,
    };
  };

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
    try {
      await createCommunicationLog({
        matchId: matchDetails.id,
        type,
        status,
        timestamp,
      });
      toast.success("Interaction logged successfully!");
      const updated = await getLogsForMatch(matchDetails.id);
      setLogs(updated);
      closeDialog();
    } catch (err: any) {
      toast.error(err.message || "Failed to log interaction");
    }
  };

  const handleUpdateLog = async () => {
    try {
      if (!editingLogId) return;
      await updateCommunicationLog(editingLogId, {
        matchId: matchDetails.id,
        type,
        status,
        timestamp,
      });
      toast.success("Interaction updated!");
      const updated = await getLogsForMatch(matchDetails.id);
      setLogs(updated);
      closeDialog();
    } catch (err: any) {
      toast.error(err.message || "Failed to update log");
    }
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      await deleteCommunicationLog(logId);
      toast.success("Interaction deleted");
      const updated = await getLogsForMatch(matchDetails.id);
      setLogs(updated);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleMarkCompleted = async (log: CommunicationLogDto) => {
    try {
      await updateCommunicationLog(log.id, {
        matchId: log.matchId,
        type: log.type,
        status: CommunicationStatus.COMPLETED,
        timestamp: log.timestamp,
      });
      toast.success("Marked as completed!");
      const updated = await getLogsForMatch(matchDetails.id);
      setLogs(updated);
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

  const openNewLogDialog = () => {
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

  console.log(participant);

  return (
    <div className="max-w-[55vw] bg-light p-6 rounded shadow relative dark:bg-dark dark:border dark:border-white/30 text-light">
      <h2 className="h2 font-bold mb-4 text-dark dark:text-light">
        {programme?.name ?? "N/A"}
      </h2>
      <p className="text-gray-700 dark:text-light/60">
        {programme?.description ?? "No description available"}
      </p>
      <p className=" text-dark dark:text-light mt-3">
        Contact details: mentoring@aston.ac.uk
      </p>

      <div className="mt-6">
        <p className="bg-secondary dark:bg-secondary-dark text-white rounded p-2 w-fit absolute top-6 right-6">
          Status:{" "}
          {matchDetails
            ? matchDetails.status === "APPROVED"
              ? "✅ Match Confirmed"
              : "⏳ Match Pending"
            : "❌ Unmatched"}
        </p>

        {participant && (
          <div className="mt-6 border p-4 rounded bg-gray-100 dark:bg-dark dark:border dark:border-white/20 text-dark dark:text-light">
            <h3 className="h3">Your Participation</h3>
            <p>
              <strong>Role:</strong> {formatText(participant?.role)}
            </p>
            <p>
              <strong>Name:</strong> {participant?.userName}
            </p>
            <p>
              <strong>Email:</strong> {participant?.userEmail}
            </p>
            <p>
              <strong>Course:</strong> {participant?.userCourseName}
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

            {!matchDetails ? (
              <p className="mt-3 text-gray-500 italic">No match found yet.</p>
            ) : matchDetails.status === "PENDING" ? (
              <p className="mt-3 text-yellow-600">
                A match has been found for you, but coordinator approval is
                pending.
              </p>
            ) : null}
          </div>
        )}

        {matchDetails?.status === "APPROVED" && (
          <div className="mt-6 border p-4 rounded bg-gray-100 dark:bg-dark dark:border dark:border-white/30">
            <h4 className="h4 text-lg italic">You have been paired with:</h4>

            {isMentor ? (
              matchDetails.mentees?.length ? (
                matchDetails.mentees.map((mentee: any, index: number) => (
                  <div key={index} className="mb-4 p-3 border rounded bg-white">
                    <p>
                      <strong>Name:</strong> {mentee.firstName}{" "}
                      {mentee.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {mentee.email}
                    </p>
                    <p>
                      <strong>Course:</strong> {mentee.course}
                    </p>
                    <p>
                      <strong>Academic Stage:</strong>{" "}
                      {formatText(mentee.academicStage)}
                    </p>
                    <p>
                      <strong>Skills:</strong>{" "}
                      {mentee.skills?.length
                        ? mentee.skills.map(formatText).join(", ")
                        : "None listed"}
                    </p>
                  </div>
                ))
              ) : (
                <p>No mentees assigned.</p>
              )
            ) : (
              <>
                <p>
                  <strong>Name:</strong> {matchDetails.mentor?.firstName}{" "}
                  {matchDetails.mentor?.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {matchDetails.mentor?.email}
                </p>
                <p>
                  <strong>Course:</strong> {matchDetails.mentor?.course}
                </p>
                <p>
                  <strong>Academic Stage:</strong>{" "}
                  {formatText(matchDetails.mentor?.academicStage)}
                </p>
                <p>
                  <strong>Skills: </strong>
                  {matchDetails.mentor?.skills?.length
                    ? matchDetails.mentor.skills.map(formatText).join(", ")
                    : "None listed"}
                </p>
              </>
            )}

            <h3 className="h3 mt-4">
              Compatibility Score: {matchDetails.compatibilityScore}%
            </h3>
            <div className="bg-gray-50 dark:bg-light/5 border dark:border-light/10 p-4 rounded mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Schedule Your First Meeting
              </h3>
              {getSharedAvailability() && (
                <p className="text-sm text-gray-600 dark:text-light/80 mt-2">
                  🕒 You’re both available on{" "}
                  <strong>
                    {getSharedAvailability()?.day}{" "}
                    {getSharedAvailability()?.time}
                  </strong>{" "}
                  – this might be a good time!
                </p>
              )}

              <p className="text-sm text-gray-700 dark:text-light/90 my-4">
                Contact your match to schedule a meeting. You can paste a
                Microsoft Teams or Zoom link below to confirm.
              </p>
              {/* <InputField
                id="meetingLink"
                label="Meeting Link (Teams, Zoom, etc.)"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <Button onClick={saveMeetingLink} className="mt-2">
                Save Meeting Link
              </Button> */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mb-5">
                    Contact Your Match
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Suggested Email</DialogTitle>
                  </DialogHeader>

                  <Textarea
                    className="w-full min-h-[160px]"
                    value={generateEmailBody()}
                    readOnly
                  />

                  <DialogFooter>
                    <Button
                      onClick={() => {
                        const body = generateEmailBody() || "";
                        const email =
                          isMentor && matchDetails.mentees?.length
                            ? matchDetails.mentees[0].email
                            : matchDetails.mentor?.email;

                        if (!email) {
                          toast.error("Match email not found.");
                          return;
                        }

                        const subject = encodeURIComponent(
                          "Mentoring Programme: Let's schedule a meeting"
                        );
                        const bodyEncoded = encodeURIComponent(body);

                        window.location.href = `mailto:${email}?subject=${subject}&body=${bodyEncoded}`;
                      }}
                    >
                      Send Email
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {(() => {
                const now = new Date().getTime();

                if (!logs.length && matchDetails?.updatedAt) {
                  const matchUpdated = new Date(
                    matchDetails.updatedAt
                  ).getTime();
                  const diffDays = Math.floor(
                    (now - matchUpdated) / (1000 * 60 * 60 * 24)
                  );

                  if (diffDays >= 14) {
                    return (
                      <p className="text-sm text-accent mb-2">
                        ⚠️ No interactions logged yet. It's been {diffDays} days
                        since you were matched. Have you connected?
                      </p>
                    );
                  }
                }

                if (logs.length > 0) {
                  const lastLogDate = new Date(
                    [...logs].sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )[0].timestamp
                  );
                  const lastLogDays = Math.floor(
                    (now - lastLogDate.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <>
                      <p className="text-sm text-green-600 mb-2">
                        ✅ Last logged interaction:{" "}
                        {lastLogDate.toLocaleDateString("en-GB")} ({lastLogDays}{" "}
                        day{lastLogDays !== 1 ? "s" : ""} ago)
                      </p>
                      {lastLogDays >= 14 && (
                        <p className="text-sm text-yellow-600 mb-2">
                          ⏳ It's been over 2 weeks since your last log.
                          Consider reconnecting!
                        </p>
                      )}
                    </>
                  );
                }

                return null;
              })()}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="mt-2"
                    onClick={openNewLogDialog}
                  >
                    Log Interaction
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Communication</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <label className="block">
                      Type:
                      <select
                        value={type}
                        onChange={(e) =>
                          setType(e.target.value as CommunicationType)
                        }
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

                    <label className="block">
                      Timestamp:
                      <input
                        type="datetime-local"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                        className="w-full border rounded px-3 py-2 mt-1"
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
            </div>
            {logs.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-2">
                  Interaction History
                </h4>
                <ul className="space-y-2">
                  {logs
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((log) => (
                      <li
                        key={log.id}
                        className="text-sm text-gray-700 dark:text-light/95 border p-3 rounded flex justify-between items-center"
                      >
                        <div>
                          {new Date(log.timestamp).toLocaleString("en-GB")} –{" "}
                          <strong>{log.type.replace(/_/g, " ")}</strong> –{" "}
                          <span className="italic">{log.status}</span>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {/* Complete icon (only if not already completed) */}
                          {log.status !== CommunicationStatus.COMPLETED && (
                            <button
                              onClick={() => handleMarkCompleted(log)}
                              className="text-green-600 hover:text-green-800"
                              title="Mark as Completed"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {/* Edit icon */}
                          <button
                            onClick={() => openEditDialog(log)}
                            className="text-primary hover:text-primary-hover dark:text-primary-dark dark:hover:text-primary-darkHover"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Delete icon */}
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-accent hover:text-accent-hover dark:text-accent-dark dark:hover:text-accent-darkHover"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantProgrammeDetails;
