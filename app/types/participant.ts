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
export type ParticipantResponseDto = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userGender: "MALE" | "FEMALE" | "OTHER";
  userAge: number;
  userNationality: string;
  userHomeCountry: string;
  userPersonalityType: string;
  userCourseId: number;
  userCourseName: string;
  userLivingArrangement: string;
  userDisability: string;
  userDbsCertificate: boolean;
  userAgeGroup: string;

  programmeYearId: number;
  programmeName: string;
  academicYear: string;

  role: "MENTOR" | "MENTEE";
  menteesNumber: number | null;
  isMatched: boolean;
  academicStage: string;
  hadPlacement: boolean;
  placementDescription: string;
  motivation: string;
  isReturningParticipant: boolean;
  availableDays: DayOfWeek[];
  timeRange: string;
  meetingsFrequency: string;
  skills: string[];
};

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface FeedbackSubmissionDto {
  userId: number;
  programmeYearId: number;
  secretCode: string;
}
