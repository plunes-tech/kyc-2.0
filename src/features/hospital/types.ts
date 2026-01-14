import { z } from "zod";
import { AddHospitalSchema, updateHospitalSchema } from "./schema";

export type Hospital = z.infer<typeof AddHospitalSchema>
export type HospitalUpdate = z.infer<typeof updateHospitalSchema>

// redux state interfaces
export interface ErrorResponse {
    message?: string;
    errors?: Record<string, string> | unknown;
}

export interface HospitalState {
    isLoading: boolean;
    error: ErrorResponse | null;
    success: boolean;
    message: string;
    hospital: HospitalUpdate | null;
}

export interface HospitalResponse {
    success: boolean;
    message?: string;
    data: HospitalUpdate;
}

export interface DocumentResponse {
    success: boolean;
    message?: string;
    docUrl: string;
}