
export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export interface UserLoginDto {
    email: string;
    password: string;
}

export interface UserCreateDto {
    firstName: string; 
    lastName: string;  
    email: string;     
    uniEmail?: string;  //Optional
    studentNumber?: number; // Optional
    role: UserRole;    
    course?: string,
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
    uniEmail?: string,
    studentNumber?: number,
    role: UserRole,
    course?: string,
    organisationId?: number,
    organisationName?: string
}
