export interface ProgrammeYearStats {
    academicYear: string;
    participants: number;
    matches: number;
    rate: number;
  }
  
  export interface ProgrammeStats {
    programmeName: string;
    totalParticipants: number;
    totalMatches: number;
    matchRate: number;
    years: ProgrammeYearStats[];
  }
  
  export interface OrganisationMatchStats {
    organisation: string;
    totalParticipants: number;
    totalMatches: number;
    matchRatePercent: number;
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
  