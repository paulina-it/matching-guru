export interface ProgrammeYearStats {
  academicYear: string;
  participants: number;
  matches: number;
  accepted?: number;
  acceptedByBoth?: number;
  acceptedByOne?: number;
  pending?: number;
  rejected?: number;
  acceptRate?: number;
  rejectRate?: number;
  rate: number;
}

export interface ProgrammeStats {
  programmeName: string;
  totalParticipants: number;
  totalMatches: number;
  accepted?: number;
  acceptedByBoth?: number;
  acceptedByOne?: number;
  pending?: number;
  rejected?: number;
  acceptRate?: number;
  rejectRate?: number;
  matchRate: number;
  years: ProgrammeYearStats[];
}

export interface OrganisationMatchStats {
  organisation: string;
  totalParticipants: number;
  totalMatches: number;
  totalAccepted?: number;
  totalRejected?: number;
  matchRatePercent: number;
  overallAcceptRate?: number;
  overallRejectRate?: number;
  acceptedByBoth?: number;
  acceptedByOne?: number;
  pending?: number;
  rejected?: number;
  programmes: ProgrammeStats[];
}

export interface WeeklyEngagementPoint {
  week: string;
  interactions: number;
}

export interface ProgrammeYearEngagementStats {
  academicYear: string;
  participants: number;
  mentors: number;
  mentees: number;
  bothRoles: number;
  inactivePairs: number;
  feedbackSubmitted: number;
  avgInteractionsPerMatch: number;
  communicationBreakdown: Record<string, number>;
  weeklyEngagement: WeeklyEngagementPoint[];
}

export interface ProgrammeEngagementStats {
  programmeName: string;
  years: ProgrammeYearEngagementStats[];
}

export interface OrganisationEngagementStats {
  organisation: string;
  programmes: ProgrammeEngagementStats[];
}

export interface CourseBreakdown {
  course: string;
  count: number;
}
export interface StageBreakdown {
  stage: string;
  count: number;
}

export interface CourseGroupBreakdown {
  group: string;
  count: number;
}

export interface ProgrammeYearDemo {
  academicYear: string;
  courseDistribution: CourseBreakdown[];
  stageDistribution: StageBreakdown[];
  courseGroupDistribution: CourseGroupBreakdown[];
  totalParticipants: number;
}

export interface ProgrammeDemo {
  programmeName: string;
  years: ProgrammeYearDemo[];
}

export interface OrganisationDemographicStats {
  organisation: string;
  totalParticipants: number;
  courseDistribution: CourseBreakdown[];
  stageDistribution: StageBreakdown[];
  courseGroupDistribution: CourseGroupBreakdown[];
  programmes: ProgrammeDemo[];
}
