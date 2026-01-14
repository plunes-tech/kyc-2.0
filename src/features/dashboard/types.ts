import { z } from "zod"
import { filterDateSchema, filterTableSchema } from "./schema"

export type dateValue = "today" | "yesterday" | "lastWeek" | "thisWeek" | "month" | "year" | "customRange"

export type FilterDate = z.infer<typeof filterDateSchema>
export type FilterTable = z.infer<typeof filterTableSchema>
export type DateProps = {
    date?: dateValue;
    dateString?: string;
}

export type DashboardBookings = {
    id?: string;
    plNumber?: string;
    dod?: string;
    doa?: string;
    patient?: {
        name?: string;
        mobileNumber?: number;
        patientAge?: number;
    };
    insuranceCompany?: {
        name?: string;
    };
    treatmentType?: string;
    claimStatus?: string;
    paymentDetails?: {
        totalBill?: number;
        finalBill?: number;
        finalApprovalAmount?: number;
        utr?: string;
    };
}

export type InsuranceRatio = {
    id?: string;
    name?: string;
    count?: number;
}

// redux state interfaces
export interface ErrorResponse {
    message?: string;
    errors?: Record<string, string> | unknown;
}

export interface DashboardState {
    isLoading: boolean;
    error: ErrorResponse | null;
    success: boolean;
    message: string;
    patientStatus: {
        admitted?: number;
        discharged?: number;
        underProcess?: number;
        approved?: number;
        rejected?: number;
        raised?: number;
    } | null;
    insuranceRatio: InsuranceRatio[] | null;
    dpaStatus: {
        amountProcessed?: number;
        totalClaimAmount?: number;
        finalApprovedAmount?: number;
    } | null;
    transactionData: {
        bookings?: DashboardBookings[];
        successfull?: number;
        total?: number;
    } | null;
    plannedCasesData: {data?: DashboardBookings[], total?: number} | null;
}

// api responses
export interface PatientStatusResponse {
    success: boolean;
    message?: string;
    data?: {
        admitted?: number;
        discharged?: number;
        underProcess?: number;
        approved?: number;
        rejected?: number;
        raised?: number;
    };
}

export interface InsuranceRatioResponse {
    success: boolean;
    message?: string;
    data?: InsuranceRatio[];
}

export interface DpaResponse {
    success: boolean;
    message?: string;
    data?: {
        amountProcessed?: number;
        totalClaimAmount?: number;
        finalApprovedAmount?: number;
    };
}

export interface SuccessTransactionResponse {
    success: boolean;
    message?: string;
    data?: {
        bookings?: DashboardBookings[];
        successfull?: number;
        total?: number;
    };
}

export interface PlannedCasesResponse {
    success: boolean;
    message?: string;
    data?: {
        bookings?: DashboardBookings[];
        total?: number;
    };
}