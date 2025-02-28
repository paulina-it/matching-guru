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
    preferredAlgorithm: string;
    joinCode?: string;
    participantCount?: number;
    matchingCriteria?: MatchingCriteriaDto[];
    initialMatchingIsDone?: boolean;
  }
  
  export interface ProgrammeYearCreateDto {
    programmeId: number;
    academicYear: string;
    customSettings: string;
    preferredAlgorithm: AlgorithmType;
    matchingCriteria: MatchingCriteriaDto[];
  }
  
  export enum CriterionType {
    FIELD = "FIELD",
    AVAILABILITY = "AVAILABILITY",
    PERSONALITY = "PERSONALITY",
    SKILLS = "SKILLS",
    GENDER = "GENDER",
    AGE = "AGE",
    NATIONALITY = "NATIONALITY",
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
