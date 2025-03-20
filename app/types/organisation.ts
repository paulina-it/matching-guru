export interface OrganisationCreateDto {
    name: string;
    description: string;
    logoUrl: string;
}

export interface OrganisationResponseDto {
    id: number;
    name: string;
    description: string;
    joinCode: string;
}

export interface InviteTokenResponse {
    token: string;
}
