import React from "react";
import { formatText } from "@/app/utils/text";

interface ParticipantCardProps {
  participant: any;
  role: "mentor" | "mentee";
  sortAvailableDays: (availableDays: string[]) => string[];
  sharedDays: string[];
  sharedSkills: string[];
}

const ParticipantAdminCard: React.FC<ParticipantCardProps> = ({
  participant,
  role,
  sortAvailableDays,
  sharedDays,
  sharedSkills,
}) => {
  const { availableDays, skills } = participant;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {role === "mentor" ? "👨‍🏫 Mentor" : "🧑‍🎓 Mentee"}
        </h3>
        <span className="text-xs text-muted-foreground ">
          ID: {participant.participantId}
        </span>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span className="font-bold">Name</span>
          <span>
            {participant.firstName} {participant.lastName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Email</span>
          <span>{participant.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Course</span>
          <span>{participant.course}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Academic Stage</span>
          <span>{formatText(participant.academicStage)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Gender</span>
          <span>{formatText(participant.gender)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Age Group</span>
          <span>
            {participant.ageGroup?.replace("AGE_", "").replace(/_/g, "-")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Home Country</span>
          <span>{participant.homeCountry}</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold text-muted-foreground mb-1">
          Availability
        </p>
        <div className="flex flex-wrap gap-2">
          {availableDays?.length > 0 ? (
            sortAvailableDays(availableDays).map((day: string) => (
              <span
                key={day}
                className={`text-xs px-3 py-1 rounded-full ${
                  sharedDays.includes(day)
                    ? "bg-secondary/70 text-white"
                    : "bg-muted"
                }`}
              >
                {formatText(day)}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Not specified
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-bold text-muted-foreground mb-1">Skills</p>
        <div className="flex flex-wrap gap-2">
          {skills?.length > 0 ? (
            skills.map((skill: string) => (
              <span
                key={skill}
                className={`text-xs px-3 py-1 rounded-full ${
                  sharedSkills.includes(skill)
                    ? "bg-secondary/70 text-white"
                    : "bg-muted"
                }`}
              >
                {formatText(skill)}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantAdminCard;
