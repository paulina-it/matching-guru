"use client";

import React from "react";
import { MatchSummaryDto } from "@/app/types/dashboard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CommunicationLogReminderProps {
  match: MatchSummaryDto;
}

const CommunicationLogReminder: React.FC<CommunicationLogReminderProps> = ({ match }) => {
  const router = useRouter();

  return (
    <div
      className="mb-2 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800"
      aria-label="Communication Reminder"
    >
      <p className="text-yellow-800 dark:text-yellow-100 font-medium">
        💬 It's been over 2 weeks since you logged communication in{" "}
        <span className="font-semibold">
          {match.programmeName} ({match.academicYear})
        </span>
        .
      </p>
      <Button
        variant="link"
        className="w-full sm:w-fit mt-2"
        onClick={() =>
          router.push(
            `/participant/programmes/${match.programmeId}/years/${match.programmeYearId}/my-details`
          )
        }
      >
        Log interaction
      </Button>
    </div>
  );
};

export default CommunicationLogReminder;
