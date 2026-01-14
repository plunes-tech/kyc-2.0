import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../app/store";
import { CaseStartThunk, CreateBookingThunk, GetAllInsuranceThunk, GetBookingByIdThunk, GetTableBookingsThunk, MergeDocThunk, selectBookingError, selectBookingLoading, selectBookingMessage, selectBookingSuccess, UpdateBookingTableThunk, UpdateBookingThunk } from "../features/booking/bookingSlice";
import { AddBookingResponse, Booking, BookingData, CaseStartResponse, FilterTable, GetBookingResponse, GetBookingsResponse, InsuranceResponse, MergeDocResponse, UpdateBookingResponse } from "../features/booking/types";

const useBooking = () => {

    const dispatch = useDispatch<AppDispatch>();
    
    const isLoading = useSelector(selectBookingLoading);
    const error = useSelector(selectBookingError);
    const success = useSelector(selectBookingSuccess);
    const message = useSelector(selectBookingMessage);

    const createBooking = async (payload: Booking): Promise<AddBookingResponse> => {
        try {
            const result = await dispatch(CreateBookingThunk(payload)).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const getBookingById = async (bookingId: string): Promise<GetBookingResponse> => {
        try {
            const result = await dispatch(GetBookingByIdThunk(bookingId)).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const updateBookingById = async (bookingId: string, payload: BookingData): Promise<UpdateBookingResponse> => {
        try {
            const result = await dispatch(UpdateBookingThunk({bookingId, payload})).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const getTableBookings = async (filter: FilterTable): Promise<GetBookingsResponse> => {
        try {
            const result = await dispatch(GetTableBookingsThunk({filter})).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const updateTableBookings = async (bookingId: string, payload: BookingData): Promise<UpdateBookingResponse> => {
        try {
            const result = await dispatch(UpdateBookingTableThunk({bookingId, payload})).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const getTransactionTableBookings = async (filter: FilterTable): Promise<GetBookingsResponse> => {
        try {
            const result = await dispatch(GetTableBookingsThunk({filter})).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const getAllInsurance = async (): Promise<InsuranceResponse> => {
        try {
            const result = await dispatch(GetAllInsuranceThunk({})).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const mergeAndUploadDocs = async (bookingId: string, file: string[]): Promise<MergeDocResponse> => {
        try {
            const result = await dispatch(MergeDocThunk({bookingId, file})).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const caseStartviaIAssist = async (documentId: string, type: string, bookingId: string): Promise<CaseStartResponse> => {
        try {
            const result = await dispatch(CaseStartThunk({documentId, type, bookingId})).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    return {
        isLoading,
        error,
        success,
        message,
        createBooking,
        getBookingById,
        updateBookingById,
        getTableBookings,
        updateTableBookings,
        getTransactionTableBookings,
        // insurance
        getAllInsurance,
        // iassist methods
        mergeAndUploadDocs,
        caseStartviaIAssist,
    };
}

export default useBooking;