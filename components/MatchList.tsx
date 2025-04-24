"use client";

import React from "react";
import MatchCard from "@/components/MatchCard";
import {
  CommunicationLogDto,
  CommunicationStatus,
} from "@/app/types/communicationLog";
import { UserResponseDto } from "@/app/types/auth";
import { DetailedMatchResponseDto } from "@/app/types/match";
import { ParticipantDto } from "@/app/types/participant";

interface MatchListProps {
  matches: DetailedMatchResponseDto[];
  participant: ParticipantDto;
  isMentor: boolean;
  user: UserResponseDto;
  logsByMatchId: Record<number, CommunicationLogDto[]>;
  sortAvailableDays: (days: string[]) => string[];
  getNextDateForDay: (day: string) => string;
  onAccept: (matchId: number) => void;
  onReject: (matchId: number) => void;
  onLogCreate: (matchId: number) => void;
  onEditLog: (log: CommunicationLogDto) => void;
  onDeleteLog: (logId: number, matchId: number) => void;
  onMarkCompleted: (log: CommunicationLogDto, matchId: number) => void;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  logsByMatchId,
  participant,
  isMentor,
  user,
  getNextDateForDay,
  sortAvailableDays,
  onAccept,
  onReject,
  onLogCreate,
  onEditLog,
  onDeleteLog,
  onMarkCompleted,
}) => {
  const now = new Date();

  return (
    <>
      {matches.map((match, idx) => {
        const logs = logsByMatchId[match.id] || [];

        const sortedLogs = [...logs].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const lastInteraction = sortedLogs.find(
          (log) => log.status === CommunicationStatus.COMPLETED
        );
        const firstName = (() => {
          if (participant.role === "MENTOR") {
            return match.mentee?.firstName || "there";
          }
          return match.mentor?.firstName || "there";
        })();
        const msInDay = 1000 * 60 * 60 * 24;
        const daysSinceLastInteraction = lastInteraction
          ? Math.floor(
              (now.getTime() - new Date(lastInteraction.timestamp).getTime()) /
                msInDay
            )
          : match.updatedAt
          ? Math.floor(
              (now.getTime() - new Date(match.updatedAt).getTime()) / msInDay
            )
          : null;

        const shared = (() => {
          const mentor = match.mentor;
          const mentee = match.mentee;
          if (!mentor || !mentee) return null;

          const mentorDays = mentor.availableDays || [];
          const menteeDays = mentee.availableDays || [];
          const sharedDays = mentorDays.filter((day) =>
            menteeDays.includes(day)
          );
          if (!sharedDays.length) return null;

          const formattedDay =
            sharedDays[0].charAt(0).toUpperCase() +
            sharedDays[0].slice(1).toLowerCase();

          const mentorTime = mentor.timeRange || "ANYTIME";
          const menteeTime = mentee.timeRange || "ANYTIME";

          let timeSuggestion = "any time";
          if (mentorTime === menteeTime)
            timeSuggestion = mentorTime.toLowerCase();
          else if (mentorTime === "ANYTIME")
            timeSuggestion = menteeTime.toLowerCase();
          else if (menteeTime === "ANYTIME")
            timeSuggestion = mentorTime.toLowerCase();

          return { day: formattedDay, time: timeSuggestion };
        })();

        const nextDate = shared
          ? getNextDateForDay(shared.day)
          : "(next available)";

        const emailBody = `Hi ${firstName || "there"},

I hope you're well! Since we’re matched for the mentoring programme, I’d love to schedule our first meeting.

Would ${shared?.day.toLowerCase()} (${nextDate}) ${shared?.time} work for you?

Looking forward to connecting!

Best regards,  
${user?.firstName}`;

        return (
          <MatchCard
            key={match.id}
            match={match}
            index={idx}
            isMentor={isMentor}
            participant={participant}
            user={user}
            logs={logs}
            sortAvailableDays={sortAvailableDays}
            getNextDateForDay={getNextDateForDay}
            shared={shared}
            emailBody={emailBody}
            daysSinceLastInteraction={daysSinceLastInteraction}
            onAccept={() => onAccept(match.id)}
            onReject={() => onReject(match.id)}
            onLogCreate={() => onLogCreate(match.id)}
            onLogEdit={onEditLog}
            onLogDelete={(logId) => onDeleteLog(logId, match.id)}
            onMarkCompleted={(log) => onMarkCompleted(log, match.id)}
            onOpenNewLogDialog={() => onLogCreate(match.id)}
          />
        );
      })}
    </>
  );
};

export default MatchList;
