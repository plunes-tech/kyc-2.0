import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { ZodError } from "zod"
import dashboardService from "./dashboardService"
import { filterDateSchema, filterTableSchema } from "./schema"
import { DashboardState, DpaResponse, ErrorResponse, FilterDate, FilterTable, InsuranceRatioResponse, PatientStatusResponse, PlannedCasesResponse, SuccessTransactionResponse } from "./types";
import { RootState } from "../../app/store";

const initialState: DashboardState = {
    isLoading: false,
    error: null,
    success: false,
    message: "",
    patientStatus: null,
    insuranceRatio: null,
    dpaStatus: null,
    transactionData: null,
    plannedCasesData: null,
}

// insurance ratio
export const InsuranceRatioThunk = createAsyncThunk<InsuranceRatioResponse, FilterDate, { rejectValue: ErrorResponse }>("dashboard/InsuranceRatioThunk", async (filter, { rejectWithValue }) => {
    try {
        const validateData = filterDateSchema.parse(filter)
        return await dashboardService.insuranceRatio(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetched data';
        return rejectWithValue({ message });
    }
})

// patient status
export const PatientStatusThunk = createAsyncThunk<PatientStatusResponse, FilterDate, { rejectValue: ErrorResponse }>("dashboard/PatientStatusThunk", async (filter, { rejectWithValue }) => {
    try {
        const validateData = filterDateSchema.parse(filter)
        return await dashboardService.patientStatus(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetched data';
        return rejectWithValue({ message });
    }
})

// dpa statement
export const DpaStatusThunk = createAsyncThunk<DpaResponse, FilterDate, { rejectValue: ErrorResponse }>("dashboard/DpaStatusThunk", async (filter, { rejectWithValue }) => {
    try {
        const validateData = filterDateSchema.parse(filter)
        return await dashboardService.dpaStatus(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetched data';
        return rejectWithValue({ message });
    }
})

// transaction status
export const TransactionStatusThunk = createAsyncThunk<SuccessTransactionResponse, FilterTable, { rejectValue: ErrorResponse }>("dashboard/TransactionStatusThunk", async (filter, { rejectWithValue }) => {
    try {
        const validateData = filterTableSchema.parse(filter)
        return await dashboardService.transactionStatus(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetched data';
        return rejectWithValue({ message });
    }
})

// planned cases
export const PlannedCasesThunk = createAsyncThunk<PlannedCasesResponse, FilterTable, { rejectValue: ErrorResponse }>("dashboard/PlannedCasesThunk", async (filter, { rejectWithValue }) => {
    try {
        const validateData = filterTableSchema.parse(filter)
        return await dashboardService.plannedCases(validateData)
    } catch (error) {
        if(error instanceof ZodError) {
            return rejectWithValue({
                message: "Validation error",
                errors: error.errors
            })
        }

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetched data';
        return rejectWithValue({ message });
    }
})

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        reset: state => {
            state.isLoading = false
            state.error = null
            state.message = ""
            state.success = false
            state.insuranceRatio = null
            state.patientStatus = null
            state.dpaStatus = null
            state.transactionData = null
            state.plannedCasesData = null
        },
    },
    extraReducers: (builder) => {
        builder
            // insurance ratio status
            .addCase(InsuranceRatioThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.insuranceRatio = null
            })
            .addCase(InsuranceRatioThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.success = true
                state.message = action.payload.message || "Data fetched successfully"
                state.insuranceRatio = action.payload.data ?? null
            })
            .addCase(InsuranceRatioThunk.rejected, (state, action) => {
                state.isLoading = false
                state.success = false
                state.insuranceRatio = null
                state.error = action.payload || { message: "Failed to fecth data" }
            })

            // patient status
            .addCase(PatientStatusThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.patientStatus = null
            })
            .addCase(PatientStatusThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.success = true
                state.message = action.payload.message || "Data fetched successfully"
                state.patientStatus = action.payload.data ?? null
            })
            .addCase(PatientStatusThunk.rejected, (state, action) => {
                state.isLoading = false
                state.success = false
                state.patientStatus = null
                state.error = action.payload || { message: "Failed to fecth data" }
            })

            // dpa statement
            .addCase(DpaStatusThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.dpaStatus = null
            })
            .addCase(DpaStatusThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.success = true
                state.message = action.payload.message || "Data fetched successfully"
                state.dpaStatus = action.payload.data ?? null
            })
            .addCase(DpaStatusThunk.rejected, (state, action) => {
                state.isLoading = false
                state.success = false
                state.dpaStatus = null
                state.error = action.payload || { message: "Failed to fecth data" }
            })

            // transaction status
            .addCase(TransactionStatusThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.transactionData = null
            })
            .addCase(TransactionStatusThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.success = true
                state.message = action.payload.message || "Data fetched successfully"
                state.transactionData = action.payload.data ?? null
            })
            .addCase(TransactionStatusThunk.rejected, (state, action) => {
                state.isLoading = false
                state.success = false
                state.transactionData = null
                state.error = action.payload || { message: "Failed to fecth data" }
            })

            // planned cases
            .addCase(PlannedCasesThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.plannedCasesData = null
            })
            .addCase(PlannedCasesThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.success = true
                state.message = action.payload.message || "Data fetched successfully"
                state.plannedCasesData = action.payload.data ?? null
            })
            .addCase(PlannedCasesThunk.rejected, (state, action) => {
                state.isLoading = false
                state.success = false
                state.plannedCasesData = null
                state.error = action.payload || { message: "Failed to fecth data" }
            })
    }
})

export const { reset } = dashboardSlice.actions

export const selectDashboardLoading = (state: RootState) => state.dashboard.isLoading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardSuccess = (state: RootState) => state.dashboard.success;
export const selectDashboardMessage = (state: RootState) => state.dashboard.message;

export default dashboardSlice.reducer