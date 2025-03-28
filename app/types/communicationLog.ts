export enum CommunicationStatus {
    SCHEDULED = "SCHEDULED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
  }
  
  export enum CommunicationType {
    VIDEO_CALL = "VIDEO_CALL",
    PHONE_CALL = "PHONE_CALL",
    IN_PERSON_MEETING = "IN_PERSON_MEETING",
    EMAIL = "EMAIL",
    CHAT_MESSAGE = "CHAT_MESSAGE",
    DOCUMENT_SHARING = "DOCUMENT_SHARING",
    FOLLOW_UP = "FOLLOW_UP",
  }
  
  export interface CommunicationLogCreateDto {
    matchId: number;
    type: CommunicationType;
    timestamp: string;
    status: CommunicationStatus;
  }
  
  export interface CommunicationLogDto {
    id: number;
    matchId: number;
    type: CommunicationType;
    timestamp: string;
    status: CommunicationStatus;
  }
  