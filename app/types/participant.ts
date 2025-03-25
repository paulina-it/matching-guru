export interface ParticipantCreateDto {
  userId: number;
  programmeYearId: number;
  role: "MENTOR" | "MENTEE";
  menteesNumber?: number | null;
  isMatched?: boolean | null;
  academicStage: string;
  hadPlacement?: boolean | null;
  placementDescription?: string | null;
  placementInterest?: boolean | null;
  motivation?: string | null;
  isReturningParticipant?: boolean | null;
  availableDays?: string[] | null; 
  timeRange?: string | null; 
  meetingFrequency?: string | null;
  skills?: string[] | null;
  gender?: string | null;
  age?: number | null;
  nationality?: string | null;
  homeCountry?: string | null;
  personalityType?: string | null;
  courseId?: number | null;
  livingArrangement?: string | null;
  disability?: string | null;
  dbsCertificate?: boolean | null;
  ageGroup?: string | null;
}

  
  export type AcademicStage =
  | "FOUNDATION"
  | "PG_PHD"
  | "PLACEMENT"
  | "INCOMING"
  | "FINAL_YEAR_P"
  | "SECOND_YEAR"
  | "PG_MASTERS"
  | "GRADUATE"
  | "FIRST_YEAR"
  | "FINAL_YEAR"
  | "SECOND_YEAR_P";

  export interface ParticipantDto {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    programmeYearId: number;
    programmeName: string;
    academicYear: string;
    role: "MENTOR" | "MENTEE";
    menteesNumber: number | null;
    isMatched: boolean;
    academicStage: AcademicStage;
    hadPlacement: boolean;
    placementDescription: string | null;
    motivation: string | null;
    isReturningParticipant: boolean;
  }