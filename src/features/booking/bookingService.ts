import api from "../../utils/axios";
import { AddBookingResponse, Booking, BookingData, CaseStartResponse, FilterTable, GetBookingResponse, GetBookingsResponse, GetTransactionResponse, InsuranceResponse, MergeDocResponse, UpdateBookingResponse } from "./types";

const BOOKING_ENDPOINT = {
    ADD_BOOKING: "/api/bookings/add-booking",
    UPDATE_BOOKING: "/api/bookings",
    GET_BOOKINGS: "/api/bookings/all",
    GET_TRANSACTION_DETAILS: "/api/bookings/all",
    GET_BOOKING_BY_ID: "/api/bookings",
    // insurance
    GET_INSURANCE_LIST: "/api/insurance",
    // iAssist routes
    MERGE_DOCS: "/api/assist/merge",
    CASE_START: "/api/assist/case-initiation",
};

const bookingService = {

    addBooking: async (payload: Booking):Promise<AddBookingResponse> => {
        const response = await api.post<AddBookingResponse>(BOOKING_ENDPOINT.ADD_BOOKING, {...payload});
        return response.data;
    },

    getBookingById: async (bookingId: string):Promise<GetBookingResponse> => {
        const response = await api.get<GetBookingResponse>(`${BOOKING_ENDPOINT.GET_BOOKING_BY_ID}/${bookingId}`);
        return response.data;
    },

    updateBookingById: async (bookingId: string, payload: BookingData):Promise<UpdateBookingResponse> => {
        const response = await api.patch(`${BOOKING_ENDPOINT.UPDATE_BOOKING}/${bookingId}`, {...payload});
        return response.data;
    },

    getBookings: async (filters: FilterTable):Promise<GetBookingsResponse> => {
        const from = filters.date?.split(",")[0]
        const to = filters.date?.split(",")[1]
        const response = await api.get<GetBookingsResponse>(BOOKING_ENDPOINT.GET_BOOKINGS, {
            params: {
                page: filters.page,
                limit: filters.limit,
                ...(from && { from }),
                ...(to && { to }),
                ...(filters.plNumber && { plNumber: filters.plNumber }),
                ...(filters.patientName && { patientName: filters.patientName }),
                ...(filters.mobileNumber && { mobileNumber: filters.mobileNumber }),
                ...(filters.claimStatus && { claimStatus: filters.claimStatus }),
                ...(filters.insuranceId && { insuranceId: filters.insuranceId }),
            }
        });
        return response.data;
    },

    getTransactionBookings: async (filters: FilterTable):Promise<GetTransactionResponse> => {
        const from = filters.date?.split(",")[0]
        const to = filters.date?.split(",")[1]
        const response = await api.get<GetTransactionResponse>(BOOKING_ENDPOINT.GET_BOOKINGS, {
            params: {
                page: filters.page,
                limit: filters.limit,
                ...(from && { from }),
                ...(to && { to }),
                ...(filters.plNumber && { plNumber: filters.plNumber }),
                ...(filters.patientName && { patientName: filters.patientName }),
                ...(filters.mobileNumber && { mobileNumber: filters.mobileNumber }),
                ...(filters.claimStatus && { claimStatus: filters.claimStatus }),
                ...(filters.insuranceId && { insuranceId: filters.insuranceId }),
            }
        });
        return response.data;
    },

    // insurances
    getAllInsurance: async ():Promise<InsuranceResponse> => {
        const response = await api.get<InsuranceResponse>(BOOKING_ENDPOINT.GET_INSURANCE_LIST, {
            params: {
                all: "true",
                activeStatus: "true",
            }
        });
        return response.data;
    },

    // iAssist
    mergeAndUploadDocs: async (bookingId: string, files: string[]) => {
        const result = await api.post<MergeDocResponse>(`${BOOKING_ENDPOINT.MERGE_DOCS}`, { bookingId, files })
        return result.data
    },

    caseStartviaIAssist: async (documentId: string, type: string, bookingId: string) => {
        const result = await api.post<CaseStartResponse>(`${BOOKING_ENDPOINT.CASE_START}`, {documentId, type, bookingId})
        return result.data
    },

}

export default bookingService