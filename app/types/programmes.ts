export interface ProgrammeCreateDto {
  name: string;
  description: string;
  organisationId: number;
  courseGroupIds: number[];
}

export interface ProgrammeUpdateDto {
  name: string;
  description: string;
  courseGroupIds: number[];
}

export interface ProgrammeDto {
  id: number;
  name: string;
  description: string;
  organisationId: number;
  courseGroupIds: number[];
  participants: number;
}

export interface MatchingCriteriaDto {
  name: string;
  weight: number;
  criterionType?: string;
}

export enum AlgorithmType {
  GALE_SHAPLEY = "GALE_SHAPLEY",
  COLLABORATIVE_FILTERING = "COLLABORATIVE_FILTERING",
  BRACE = "BRACE",
}

export interface ProgrammeYearDto {
  id: number;
  academicYear: string;
  isActive: boolean;
  preferredAlgorithm: "GALE_SHAPLEY" | "COLLABORATIVE_FILTERING" | "BRACE";
  joinCode?: string;
  participantCount?: number;
  unmatchedCount?: number;
  matchingCriteria?: MatchingCriteriaDto[];
  initialMatchingIsDone?: boolean;
  matchApprovalSettings?: MatchApprovalSettingsDto;
}
export interface ProgrammeYearUpdateDto {
  academicYear?: string;
  preferredAlgorithm?: "GALE_SHAPLEY" | "COLLABORATIVE_FILTERING" | "BRACE";
  isActive?: boolean;
  matchingCriteria?: MatchingCriteriaDto[];
  matchApprovalSettings?: MatchApprovalSettingsDto;
}

export interface ProgrammeYearCreateDto {
  programmeId: number;
  academicYear: string;
  customSettings: string;
  preferredAlgorithm: AlgorithmType;
  matchingCriteria: MatchingCriteriaDto[];
  matchApprovalSettings: MatchApprovalSettingsDto;
}
export interface MatchApprovalSettingsDto {
  approvalType: "MANUAL" | "THRESHOLD" | "AUTO";
  approvalThreshold?: number | null;
}

export enum CriterionType {
  FIELD = "FIELD",
  AVAILABILITY = "AVAILABILITY",
  PERSONALITY = "PERSONALITY",
  SKILLS = "SKILLS",
  GENDER = "GENDER",
  AGE = "AGE",
  NATIONALITY = "NATIONALITY",
  LIVING_ARRANGEMENT = "LIVING_ARRANGEMENT",
}

export interface ProgrammeMatchingCriteriaDto {
  id: number;
  criterionType: CriterionType;
  weight: number;
}

export interface CourseDto {
  id: number;
  name: string;
  type: string;
  duration?: number;
  groupId: number;
}
