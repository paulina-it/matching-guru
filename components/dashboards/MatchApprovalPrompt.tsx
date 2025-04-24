"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MatchSummaryDto } from "@/app/types/dashboard";

interface MatchApprovalPromptProps {
  match: MatchSummaryDto;
}

const MatchApprovalPrompt: React.FC<MatchApprovalPromptProps> = ({ match }) => {
  const router = useRouter();

  return (
    <div className="mb-2" aria-label="Match Approval Prompt">
      <p>
        🧩 Your match in <span className="font-medium">{match.programmeName}</span>{" "}
        ({match.academicYear}) has been approved.
      </p>
      <Button
        variant="blueOutline"
        className="w-full sm:w-fit mt-2 sm:mt-0"
        onClick={() =>
          router.push(
            `/participant/programmes/${match.programmeId}/years/${match.programmeYearId}/my-details`
          )
        }
      >
        Review and Respond
      </Button>
    </div>
  );
};

export default MatchApprovalPrompt;
