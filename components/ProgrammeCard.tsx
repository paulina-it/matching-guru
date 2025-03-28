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
    <div className="flex flex-col md:flex-row justify-between items-center p-4 rounded shadow-sm bg-gray-50">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600">
          Participants: <strong>{participantsCount}</strong> | Matches: <strong>{matchesCount}</strong>
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2 mt-3 md:mt-0">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
          {status}
        </span>
        <Button
          variant="outline"
          className="text-accent"
          onClick={() => router.push(`/coordinator/programmes/${programmeId}/year/${id}`)}
        >
          View
        </Button>
      </div>
    </div>
  );
};


export default ProgrammeCard;
