// User Types
export type UserRole = "doctor" | "patient";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

// Mood Types
export interface Mood {
    id: string;
    userId: string;
    rate: number;
    date: string;
    createdAt: string;
}

export interface MoodOption {
    emoji: string;
    rating: number;
    label: string;
}

// Patient Types (for doctor view)
export interface Patient {
    id: string;
    email: string;
    name: string;
    role: string;
    moodScore: number | null;
    moodCount: number;
}

// API Response Types
export interface LoginResponse {
    message: string;
    token: string;
    user: User;
    error?: string;
}

export interface MoodsResponse {
    error: string | null;
    moods: Mood[];
    todayTracked: boolean;
    todayMood?: Mood;
}

export interface MoodConfigResponse {
    error: string | null;
    config: {
        rate: {
            min: number;
            max: number;
        };
    };
}

export interface PatientsResponse {
    error: string | null;
    myPatients: Patient[];
    unassignedPatients: Patient[];
}

export interface PatientMoodsResponse {
    error: string | null;
    patient: {
        id: string;
        name: string;
        email: string;
    };
    moods: Array<{
        id: string;
        rate: number;
        date: string;
    }>;
}
