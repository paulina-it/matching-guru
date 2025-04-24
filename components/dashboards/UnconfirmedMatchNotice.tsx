"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MatchSummaryDto } from "@/app/types/dashboard";

interface UnconfirmedMatchNoticeProps {
  group: MatchSummaryDto & { count: number };
}

const UnconfirmedMatchNotice: React.FC<UnconfirmedMatchNoticeProps> = ({ group }) => {
  const router = useRouter();

  return (
    <div className="mb-2" aria-label="Unconfirmed Match Notice">
      <p>
        🔔 You have <span className="font-bold">{group.count}</span>{" "}
        unconfirmed match{group.count > 1 ? "es" : ""} in{" "}
        <span className="font-medium">
          {group.programmeName} ({group.academicYear})
        </span>
      </p>
      <span className="text-sm text-dark/70 italic">
        Please wait for a coordinator to approve them.
      </span>
      <Button
        variant="link"
        className="w-full sm:w-fit mt-2 sm:mt-0"
        onClick={() =>
          router.push(
            `/participant/programmes/${group.programmeId}/years/${group.programmeYearId}/my-details`
          )
        }
      >
        View match details
      </Button>
    </div>
  );
};

export default UnconfirmedMatchNotice;
