import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ZodError } from "zod"
import { RootState } from "../../app/store"
import bookingService from "./bookingService"
import { AddBookingResponse, Booking, BookingData, BookingState, CaseStartResponse, ErrorResponse, FilterTable, GetBookingResponse, GetBookingsResponse, GetTransactionResponse, InsuranceResponse, MergeDocResponse, UpdateBookingResponse } from "./types"
import { AddBookingSchema, BookingUpdateSchema, filterTableSchema } from "./schema"

const initialState: BookingState = {
    isLoading: false,
    error: null,
    success: false,
    message: "",
    booking: null,
    allInsurance: null,
    allBookings: null,
    allBookingCount: 0,
    transactionBooking: null,
    transactionBookingCount: 0,
    transactionAmount: null,
}

// create booking thunk
export const CreateBookingThunk = createAsyncThunk<AddBookingResponse, Booking, { rejectValue: ErrorResponse }>("booking/CreateBookingThunk", async (payload, { rejectWithValue }) => {
    try {
        const validateData = AddBookingSchema.parse(payload)
        return await bookingService.addBooking(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create booking';
        return rejectWithValue({ message });
    }
})

// get booking by id thunk
export const GetBookingByIdThunk = createAsyncThunk<GetBookingResponse, string, { rejectValue: ErrorResponse }>("booking/GetBookingByIdThunk", async (bookingId, { rejectWithValue }) => {
    try {
        return await bookingService.getBookingById(bookingId)
    } catch (error) {

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create booking';
        return rejectWithValue({ message });
    }
})

// update booking thunk
export const UpdateBookingThunk = createAsyncThunk<UpdateBookingResponse, {bookingId: string, payload: BookingData}, { rejectValue: ErrorResponse }>("booking/UpdateBookingThunk", async ({bookingId, payload}, { rejectWithValue }) => {
    try {
        const validateData = BookingUpdateSchema.parse(payload)
        return await bookingService.updateBookingById(bookingId, validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create booking';
        return rejectWithValue({ message });
    }
})

// get booking table thunk
export const GetTableBookingsThunk = createAsyncThunk<GetBookingsResponse, {filter: FilterTable}, { rejectValue: ErrorResponse }>("booking/GetTableBookingsThunk", async (filter, { rejectWithValue }) => {
    try {
        const validateData = filterTableSchema.parse(filter)
        return await bookingService.getBookings(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create booking';
        return rejectWithValue({ message });
    }
})

// get booking table thunk
export const GetTransactionThunk = createAsyncThunk<GetTransactionResponse, {filter: FilterTable}, { rejectValue: ErrorResponse }>("booking/GetTransactionThunk", async (filter, { rejectWithValue }) => {
    try {
        const validateData = filterTableSchema.parse(filter)
        return await bookingService.getTransactionBookings(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create booking';
        return rejectWithValue({ message });
    }
})

// update booking table thunk
export const UpdateBookingTableThunk = createAsyncThunk<UpdateBookingResponse, {bookingId: string, payload: BookingData}, { rejectValue: ErrorResponse }>("booking/UpdateBookingTableThunk", async ({bookingId, payload}, { rejectWithValue }) => {
    try {
        const validateData = BookingUpdateSchema.parse(payload)
        return await bookingService.updateBookingById(bookingId, validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create booking';
        return rejectWithValue({ message });
    }
})

// insurance thunks
export const GetAllInsuranceThunk = createAsyncThunk<InsuranceResponse, {}, {rejectValue: ErrorResponse}>("booking/GetAllInsuranceThunk", async (_, { rejectWithValue }) => {
    try {
        return await bookingService.getAllInsurance()
    } catch (error) {

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to merge document';
        return rejectWithValue({ message });
    }
})

// iAssist Thunks
export const MergeDocThunk = createAsyncThunk<MergeDocResponse, {bookingId: string, file: string[]}, {rejectValue: ErrorResponse}>("booking/MergeDocThunk", async ({bookingId, file}, { rejectWithValue }) => {
    try {
        return await bookingService.mergeAndUploadDocs(bookingId, file)
    } catch (error) {

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to merge document';
        return rejectWithValue({ message });
    }
})

export const CaseStartThunk = createAsyncThunk<CaseStartResponse, {documentId: string, type: string, bookingId: string}, {rejectValue: ErrorResponse}>("booking/CaseStartThunk", async ({documentId, type, bookingId}, { rejectWithValue }) => {
    try {
        return await bookingService.caseStartviaIAssist(documentId, type, bookingId)
    } catch (error) {

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to start case';
        return rejectWithValue({ message });
    }
})

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        reset: state => {
            state.isLoading = false
            state.error = null
            state.success = false
            state.message = ""
            state.booking = null
            state.allInsurance = null
            state.allBookings = null
            state.allBookingCount = 0
            state.transactionBooking = null
            state.transactionBookingCount = 0
            state.transactionAmount = null
        },
    },
    extraReducers: (builder) => {
        builder
            // add booking
            .addCase(CreateBookingThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
                state.message = "";
            })
            .addCase(CreateBookingThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = "Booking created successfully";
                if(state.allBookings) {
                    state.allBookings.pop()
                    state.allBookings.unshift(action.payload.data)
                }
                if(state.allBookingCount || state.allBookingCount == 0) {
                    state.allBookingCount = state.allBookingCount++
                }
            })
            .addCase(CreateBookingThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.success = false;
                state.error = action.payload || { message: "Failed to create booking" };
                state.message = "";
            })

            // get booking by id
            .addCase(GetBookingByIdThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
                state.message = "";
                state.booking = null;
            })
            .addCase(GetBookingByIdThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = "";
                state.booking = action.payload.data;
            })
            .addCase(GetBookingByIdThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.success = false;
                state.error = action.payload || { message: "Failed to fetch booking" };
                state.message = "";
                state.booking = null;
            })

            // update booking by id
            .addCase(UpdateBookingThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
                state.message = "";
            })
            .addCase(UpdateBookingThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = "Booking updated successfully";
                state.booking = action.payload.data;
            })
            .addCase(UpdateBookingThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.success = false;
                state.error = action.payload || { message: "Failed to update booking" };
                state.message = "";
            })

            // get table bookings
            .addCase(GetTableBookingsThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
                state.message = "";
            })
            .addCase(GetTableBookingsThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = "";
                state.allBookings = action.payload.data.bookings;
                state.allBookingCount = action.payload.data.total || 0;
            })
            .addCase(GetTableBookingsThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.success = false;
                state.error = action.payload || { message: "Failed to fetch booking" };
                state.message = "";
                state.allBookings = null;
                state.allBookingCount = 0;
            })

            // update booking table
            .addCase(UpdateBookingTableThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
                state.message = "";
            })
            .addCase(UpdateBookingTableThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = "Booking updated successfully";
                if(state.allBookings) {
                    state.allBookings = state.allBookings?.map((data) => data.id === action.payload.data.id ? action.payload.data : data)
                }
            })
            .addCase(UpdateBookingTableThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.success = false;
                state.error = action.payload || { message: "Failed to update booking" };
                state.message = "";
            })

            // get transaction table bookings
            .addCase(GetTransactionThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
                state.message = "";
            })
            .addCase(GetTransactionThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = "";
                state.transactionBooking = action.payload.data.bookings;
                state.transactionBookingCount = action.payload.data.total || 0;
                state.transactionAmount = action.payload.data.amountCounts || null;
            })
            .addCase(GetTransactionThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.success = false;
                state.error = action.payload || { message: "Failed to fetch booking" };
                state.message = "";
                state.transactionBooking = null;
                state.transactionBookingCount = 0;
                state.transactionAmount = null;
            })

            // all insurance
            .addCase(GetAllInsuranceThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
                state.message = "";
            })
            .addCase(GetAllInsuranceThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = "";
                state.allInsurance = action.payload.data.insurance
            })
            .addCase(GetAllInsuranceThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.success = false;
                state.error = action.payload || { message: "Failed to fetch insurance list" };
                state.message = "";
                state.allInsurance = null
            })
    },
})

export const { reset } = bookingSlice.actions

export const selectBookingLoading = (state: RootState) => state.booking.isLoading;
export const selectBookingError = (state: RootState) => state.booking.error;
export const selectBookingSuccess = (state: RootState) => state.booking.success;
export const selectBookingMessage = (state: RootState) => state.booking.message;

export default bookingSlice.reducer