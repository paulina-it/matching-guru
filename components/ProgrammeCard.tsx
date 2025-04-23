import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProgrammeCardProps {
  id: number;
  programmeId: number;
  name: string;
  participantsCount: number;
  matchesCount: number;
  status: "Active" | "Inactive" | "Upcoming";
}

const ProgrammeCard: React.FC<ProgrammeCardProps> = ({
  id,
  programmeId,
  name,
  participantsCount,
  matchesCount,
  status,
}) => {
  const router = useRouter();

  const statusColors = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-700",
    Upcoming: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 p-4 rounded shadow-sm bg-gray-50 dark:bg-dark dark:border dark:border-white/30 transition-colors">
      {/* Programme Info */}
      <div className="flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-light">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-light/60 mt-1">
          Participants: <strong>{participantsCount}</strong> | Matches:{" "}
          <strong>{matchesCount}</strong>
        </p>
      </div>

      {/* Status + View Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}
        >
          {status}
        </span>
        <Button
          variant="outline"
          className="w-full sm:w-auto text-accent"
          onClick={() =>
            router.push(`/coordinator/programmes/${programmeId}/years/${id}`)
          }
        >
          View
        </Button>
      </div>
    </div>
  );
};

export default ProgrammeCard;
