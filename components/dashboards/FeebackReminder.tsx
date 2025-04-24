"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { downloadServerCertificate } from "@/app/api/programmes";
import { UserResponseDto } from "@/app/types/auth";
import { ProgrammeParticipationSummaryDto } from "@/app/types/dashboard";

interface FeedbackReminderProps {
  participation: ProgrammeParticipationSummaryDto;
  user: UserResponseDto | null;
  openCodeDialog: boolean;
  setOpenCodeDialog: (value: boolean) => void;
  codeIsValid: boolean;
  setCodeIsValid: (value: boolean) => void;
  confirmationCodeInput: string;
  setConfirmationCodeInput: (value: string) => void;
  handleConfirmCode: () => void;
  setActiveProgrammeYearId: (id: number) => void;
  setActiveParticipantId: (id: number) => void;
}

const FeedbackReminder: React.FC<FeedbackReminderProps> = ({
  participation,
  user,
  openCodeDialog,
  setOpenCodeDialog,
  codeIsValid,
  setCodeIsValid,
  confirmationCodeInput,
  setConfirmationCodeInput,
  handleConfirmCode,
  setActiveProgrammeYearId,
  setActiveParticipantId,
}) => {
  const openSurveyAndDialog = () => {
    window.open(participation.surveyUrl, "_blank");
    setActiveProgrammeYearId(participation.programmeYearId);
    setActiveParticipantId(participation.participantId);
    setOpenCodeDialog(true);
    setCodeIsValid(false); 
  };

  return (
    <div className="mb-4">
      <p>
        📝 Feedback pending for{" "}
        <span className="font-medium">
          {participation.programmeName} ({participation.academicYear})
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        Please complete the survey by{" "}
        <strong>
          {new Date(participation.surveyCloseDate!).toLocaleDateString("en-GB")}
        </strong>{" "}
        to receive your certificate.
      </p>

      <Button
        aria-label="Open feedback survey"
        variant="blueOutline"
        className="w-full sm:w-fit my-2 sm:mt-0"
        onClick={openSurveyAndDialog}
      >
        Fill out feedback survey
      </Button>

      <Dialog open={openCodeDialog} onOpenChange={setOpenCodeDialog}>
        <DialogContent className="rounded" role="dialog" aria-modal="true">
          <DialogHeader>
            <DialogTitle>
              {codeIsValid ? "✅ Code Verified" : "Enter Confirmation Code"}
            </DialogTitle>
            <DialogDescription>
              {codeIsValid
                ? "The code is valid. You can now download your certificate."
                : "Paste the code you received after completing the feedback survey."}
            </DialogDescription>
          </DialogHeader>

          {!codeIsValid ? (
            <>
              <Input
                value={confirmationCodeInput}
                onChange={(e) => setConfirmationCodeInput(e.target.value)}
                placeholder="e.g. 6e152370-1111-4888-a27d-c93b1f09efaf"
                className="mt-4"
              />
              <DialogFooter>
                <Button onClick={handleConfirmCode}>Confirm Code</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="mt-4 flex justify-center">
              <Button
                variant="default"
                onClick={() =>
                  downloadServerCertificate(
                    `${user?.firstName} ${user?.lastName}`,
                    participation.role.toLowerCase(),
                    participation.programmeName,
                    participation.academicYear,
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackReminder;
