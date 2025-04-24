"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ProgrammeYearResponseDto } from "@/app/types/programmes";
import { formatText } from "@/app/utils/text";
import { downloadServerCertificate } from "@/app/api/programmes";

interface ParticipantProfileCardProps {
  participant: any;
  programmeYear: ProgrammeYearResponseDto | null;
  codeVerified: boolean;
  feedbackModalOpen: boolean;
  setFeedbackModalOpen: (val: boolean) => void;
}

const ParticipantProfileCard: React.FC<ParticipantProfileCardProps> = ({
  participant,
  programmeYear,
  codeVerified,
  feedbackModalOpen,
  setFeedbackModalOpen,
}) => {
  const now = new Date();
  const surveyOpen = programmeYear?.surveyOpenDate
    ? new Date(programmeYear.surveyOpenDate)
    : null;
  const surveyClosed = programmeYear?.surveyCloseDate
    ? new Date(programmeYear.surveyCloseDate)
    : null;

  const canPromptFeedback =
    surveyOpen && surveyClosed && now >= surveyOpen && now <= surveyClosed;

  return (
    <div className="mt-6 border p-4 rounded bg-gray-100 dark:bg-dark dark:border dark:border-white/20 text-dark dark:text-light">
      <h3 className="h3">Your Profile</h3>
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
        <strong>Academic Stage:</strong> {formatText(participant?.academicStage)}
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
          ? participant.availableDays.map(formatText).join(", ")
          : "None listed"}
      </p>

      <div className="mt-4 space-y-2 sm:space-y-0 sm:flex sm:gap-3">
        {(participant?.hasSubmittedFeedback || codeVerified) && (
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
        )}

        {!participant?.hasSubmittedFeedback && canPromptFeedback && (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                window.open(programmeYear?.surveyUrl ?? "#", "_blank");
                setFeedbackModalOpen(true);
              }}
            >
              Provide Feedback
            </Button>
            <Button
              variant="outline"
              onClick={() => setFeedbackModalOpen(true)}
            >
              Enter Confirmation Code
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ParticipantProfileCard;
