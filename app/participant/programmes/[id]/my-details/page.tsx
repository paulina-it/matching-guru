"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProgrammeById } from "@/app/api/programmes";
import { ProgrammeDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getParticipantInfoByUserId } from "@/app/api/participant";
import { useAuth } from "@/app/context/AuthContext";
import InputField from "@/components/InputField";
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

const ParticipantProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>() || {};
  const programmeId = id ? parseInt(id, 10) : null;
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
    if (!programmeId || !user) {
      setError("Invalid programme ID or user not authenticated");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [programmeData, participantInfo] = await Promise.all([
          fetchProgrammeById(programmeId),
          getParticipantInfoByUserId(user.id),
        ]);

        setProgramme(programmeData);

        if (participantInfo?.mentor && participantInfo?.mentee) {
          const isUserMentor = participantInfo.mentor.email === user.email;
          setIsMentor(isUserMentor);
          if (isUserMentor) setParticipant(participantInfo.mentor);
          else setParticipant(participantInfo.mentee);
          setMatchDetails(participantInfo);
        } else {
          setParticipant(participantInfo);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Error fetching data.");
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeId, user]);

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
    if (daysUntilTarget === 0) daysUntilTarget = 7; // if today, move to next week

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysUntilTarget);

    return nextDate.toLocaleDateString("en-GB", {
      // weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="max-w-[55vw] bg-light p-6 rounded shadow relative">
      <h2 className="h2 font-bold mb-4">{programme?.name ?? "N/A"}</h2>
      <p className="text-gray-700">
        {programme?.description ?? "No description available"}
      </p>
      <p>Contact details: mentoring@aston.ac.uk</p>

      <div className="mt-6">
        <p className="bg-secondary text-white rounded p-2 w-fit absolute top-6 right-6">
          Status:{" "}
          {matchDetails
            ? matchDetails.status === "APPROVED"
              ? "✅ Match Confirmed"
              : "⏳ Match Pending"
            : "❌ Unmatched"}
        </p>

        {(!matchDetails || matchDetails.status !== "APPROVED") && (
          <div className="mt-6 border p-4 rounded bg-gray-100">
            <h3 className="h3">Your Participation</h3>
            <p>
              <strong>Role:</strong> {participant?.role}
              {participant?.lastName}
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
              <strong>Academic Stage: </strong>
              {formatText(participant?.academicStage)}
            </p>
            <p>
              <strong>Skills: </strong>
              {participant?.skills?.length
                ? participant.skills.map(formatText).join(", ")
                : "None listed"}
            </p>

            {matchDetails?.status === "PENDING" ? (
              <p className="mt-3 text-yellow-600">
                A match has been found for you, but coordinator approval is
                pending.
              </p>
            ) : (
              <p className="mt-3 text-gray-500 italic">No match found yet.</p>
            )}
          </div>
        )}

        {matchDetails?.status === "APPROVED" && (
          <div className="mt-6 border p-4 rounded bg-gray-100">
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
            <div className="bg-gray-50 border p-4 rounded mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Schedule Your First Meeting
              </h3>
              {getSharedAvailability() && (
                <p className="text-sm text-gray-600 mt-2">
                  🕒 You’re both available on{" "}
                  <strong>
                    {getSharedAvailability()?.day}{" "}
                    {getSharedAvailability()?.time}
                  </strong>{" "}
                  – this might be a good time!
                </p>
              )}

              <p className="text-sm text-gray-700 my-4">
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
                  <Button variant="outline" className="mt-4">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantProgrammeDetails;
