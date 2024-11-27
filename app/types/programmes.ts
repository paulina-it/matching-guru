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
  }
  