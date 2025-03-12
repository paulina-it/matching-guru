export interface CourseGroupCreateDto {
  name: string;
  organisationId: number;
}

export interface CourseCreateDto {
  name: string;
  type: string;
  duration: number;
  groupId: number;
}
