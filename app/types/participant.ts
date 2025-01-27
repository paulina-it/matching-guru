export interface ParticipantCreateDto {
    userId: number;
    programmeYearId: number;
    role: "MENTOR" | "MENTEE";
    menteesNumber?: number | null;
    academicStage: string;
    hadPlacement?: boolean | null;
    placementDescription?: string | null;
    placementInterest?: boolean | null;
    meetingFrequency?: string | null;
    availableDays?: string[] | null;
    availableTime?: string | null;
    course?: string | null;
    personality?: string | null;
    skills?: string[] | null;
    genderPreference?: string | null;
    age?: number | null;
    nationality?: string | null;
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