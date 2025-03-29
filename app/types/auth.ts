export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  uniEmail?: string;
  studentNumber?: number;
  role: UserRole;
  course?: string;
  joinCode?: string;
  password: string;
  profileImage?: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponseDto;
}

export interface UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  uniEmail?: string;
  studentNumber?: number;
  role: UserRole;
  courseName?: string;
  courseId?: number;
  organisationId?: number;
  organisationName?: string;
  personalityType?: PersonalityType;
  gender?: Gender;
  ethnicity?: string;
  nationality?: string;
  homeCountry?: string;
  livingArrangement?: LivingArrangement;
  disability?: string;
  profileImageUrl?: string;
  ageGroup?: AgeGroup;
}

export interface UserUpdateDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  uniEmail?: string;
  studentNumber?: number | string;
  role: UserRole;
  organisationId?: number;
  personalityType?: PersonalityType;
  gender?: Gender;
  ethnicity?: string;
  nationality?: string;
  homeCountry?: string;
  livingArrangement?: LivingArrangement;
  disability?: string;
  profileImageUrl?: string;
  ageGroup?: AgeGroup;
}

export enum PersonalityType {
  ARCHITECT_INTJ = "ARCHITECT_INTJ",
  LOGICIAN_INTP = "LOGICIAN_INTP",
  COMMANDER_ENTJ = "COMMANDER_ENTJ",
  DEBATER_ENTP = "DEBATER_ENTP",
  ADVOCATE_INFJ = "ADVOCATE_INFJ",
  MEDIATOR_INFP = "MEDIATOR_INFP",
  PROTAGONIST_ENFJ = "PROTAGONIST_ENFJ",
  CAMPAIGNER_ENFP = "CAMPAIGNER_ENFP",
  LOGISTICIAN_ISTJ = "LOGISTICIAN_ISTJ",
  DEFENDER_ISFJ = "DEFENDER_ISFJ",
  EXECUTIVE_ESTJ = "EXECUTIVE_ESTJ",
  CONSUL_ESFJ = "CONSUL_ESFJ",
  VIRTUOSO_ISTP = "VIRTUOSO_ISTP",
  ADVENTURER_ISFP = "ADVENTURER_ISFP",
  ENTREPRENEUR_ESTP = "ENTREPRENEUR_ESTP",
  ENTERTAINER_ESFP = "ENTERTAINER_ESFP",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum LivingArrangement {
  ON_CAMPUS = "ON_CAMPUS",
  PARENT_HOME = "PARENT_HOME",
  PRIVATE_RENT = "PRIVATE_RENT",
  STUDENT_ACCOMMODATION_OFFCAMPUS = "STUDENT_ACCOMMODATION_OFFCAMPUS",
  OTHER = "OTHER",
}

export enum AgeGroup {
  AGE_18_20 = "AGE_18_20",
  AGE_21_24 = "AGE_21_24",
  AGE_25_29 = "AGE_25_29",
  AGE_30_PLUS = "AGE_30_PLUS",
}