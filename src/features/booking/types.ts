import { z } from "zod"
import { AddBookingSchema, BookingUpdateSchema, filterTableSchema } from "./schema";

type ISODateString = string;

export type Booking = z.infer<typeof AddBookingSchema>
export type BookingData = z.infer<typeof BookingUpdateSchema>
export type FilterTable = z.infer<typeof filterTableSchema>

export type BookingTable = {
    id?: string;
    plNumber?: string;
    patient?: {
        name?: string;
    };
    createdAt?: ISODateString;
    doa?: ISODateString;
    dod?: ISODateString;
    insuranceCompany?: {
        name?: string;
    };
    paymentDetails?: {
        finalBill?: number;
    };
    patientStatus?: string;
    claimStatus?: string;
    closureStatus?: string;
}

export type TransactionTable = {
    id?: string;
    plNumber?: string;
    patient?: {
        name?: string;
    };
    createdAt?: ISODateString;
    doa?: ISODateString;
    dod?: ISODateString;
    insuranceCompany?: {
        name?: string;
    };
    paymentDetails?: {
        totalBill?: number;
        finalApprovedCost?: number;
        finalBill?: number;
        utr?: string;
    };
    patientStatus?: string;
    claimStatus?: string;
    closureStatus?: string;
}

// redux state interfaces
export interface ErrorResponse {
    message?: string;
    errors?: Record<string, string> | unknown;
}

export interface BookingState {
    isLoading: boolean;
    error: ErrorResponse | null;
    success: boolean;
    message: string;
    booking: BookingData | null;
    allInsurance: {id?: string; name?: string}[] | null;
    allBookings: BookingTable[] | null;
    allBookingCount: number;
    transactionBooking: TransactionTable[] | null;
    transactionBookingCount: number;
    transactionAmount: {
        amountProcessed: number | null;
        claimAmount: number | null;
        finalApprovalAmount: number | null;
    } | null;
}

// api responses
export interface AddBookingResponse {
    success: boolean;
    message?: string;
    data: BookingData;
    total?: number;
}

export interface GetBookingResponse {
    success: boolean;
    message?: string;
    data: BookingData;
}

export interface UpdateBookingResponse {
    success: boolean;
    message?: string;
    data: BookingData;
}

export interface GetBookingsResponse {
    success: boolean;
    message?: string;
    data: {
        bookings: BookingTable[];
        total?: number;
    };
}

export interface GetTransactionResponse {
    success: boolean;
    message?: string;
    data: {
        bookings: TransactionTable[];
        amountCounts: {
            amountProcessed: number;
            claimAmount: number;
            finalApprovalAmount: number;
        };
        total?: number;
    };
}

// insurance response
export interface InsuranceResponse {
    success: boolean;
    message?: string;
    data: {
        insurance: {id?: string; name?: string}[];
        total?: number;
    };
}

// iassist responses
export interface MergeDocResponse {
    success: boolean;
    message?: string;
    billClosurePath: string;
}

export interface CaseStartResponse {
    success: boolean;
    message?: string;
    billClosureDocType: string;
}