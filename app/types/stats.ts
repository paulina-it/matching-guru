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
  