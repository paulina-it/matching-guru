import {  MatchStatus } from "./enums";
import { ParticipantResponseDto } from "./participant";

export type DetailedMatchResponseDto = {
  id: number;
  programmeYearId: number;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
  mentor: ParticipantResponseDto;
  mentees: ParticipantResponseDto[]; 
  mentee?: ParticipantResponseDto; 
  compatibilityScore: number;
};
