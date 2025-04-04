export type MatchSummaryDto = {
  matchId: number;
  mentor: boolean;
  matchWithName: string;
  matchWithEmail: string;
  compatibilityScore: number;
  status: "PENDING" | "DECLINED" | "APPROVED" | "REJECTED" | "COMPLETED";
  programmeYearId: number;
  programmeName: string;
  academicYear: string;
  feedbackSubmitted: boolean;
  lastInteractionDate: string | null;
  lastInteractionStatus?: string;
  lastInteractionType?: string;
  programmeId: number;
};

export type ProgrammeParticipationSummaryDto = {
  programmeYearId: number;
  programmeId: number;
  participantId: number;
  programmeName: string;
  academicYear: string;
  role: string;
  isMatched: boolean;
  matched?: boolean;
  feedbackSubmitted: boolean;
  surveyUrl?: string;
  surveyCloseDate?: string;
};

export type ParticipantDashboardDto = {
  participantName: string;
  organisationName: string;
  activeParticipations: ProgrammeParticipationSummaryDto[];
  matches: MatchSummaryDto[];

  hasUnconfirmedMatches: boolean;
  hasFeedbackPending: boolean;
  hasOverdueInteractions: boolean;

  lastInteraction: string | null;
  nextSuggestedMeetingDate: string | null;
  suggestedMeetingDay: string | null;
  lastUpdated: string;
};

export type CoordinatorDashboardDto = {
  recentActivity: { description: string; timestamp: string; link: string }[];
  activeProgrammeYears: {
    id: number;
    programmeId: number;
    name: string;
    participantsCount: number;
    matchesCount: number;
    active: boolean;
  }[];
};
