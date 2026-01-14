import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ZodError } from "zod"
import hospitalService from "./hospitalService"
import { ErrorResponse, HospitalResponse, HospitalState, HospitalUpdate } from "./types";
import { removeNulls } from "../../utils/utilits";
import { AddHospitalSchema, updateHospitalSchema } from "./schema";
import { RootState } from "../../app/store";

const initialState: HospitalState = {
    isLoading: false,
    error: null,
    success: false,
    message: "",
    hospital: null,
}

export const CreateHospitalThunk = createAsyncThunk<HospitalResponse, HospitalUpdate, {rejectValue: ErrorResponse}>("hospital/CreateHospitalThunk", async (payload, { rejectWithValue }) => {
    try {
        const validateData = AddHospitalSchema.parse(payload)
        const cleandPayload = removeNulls(validateData)
        return await hospitalService.addHospital(cleandPayload)
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

export const GetHospitalThunk = createAsyncThunk<HospitalResponse, {}, {rejectValue: ErrorResponse}>("hospital/GetHospitalThunk", async (_, { rejectWithValue }) => {
    try {
        return await hospitalService.getHospital()
    } catch (error) {

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetched data';
        return rejectWithValue({ message });
    }
})

export const UpdateHospitalThunk = createAsyncThunk<HospitalResponse, {hospitalId: string, payload: HospitalUpdate}, {rejectValue: ErrorResponse}>("hospital/UpdateHospitalThunk", async ({hospitalId, payload}, { rejectWithValue }) => {
    try {
        const cleanedData = removeNulls(payload)
        const validateData = updateHospitalSchema.parse(cleanedData)
        return await hospitalService.updateHospital(hospitalId, validateData)
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

const hospitalSlice = createSlice({
    name: "hospital",
    initialState,
    reducers: {
        reset: state => {
            state.isLoading = false
            state.error = null
            state.success = false
            state.message = ""
            state.hospital = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(CreateHospitalThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = ""
            })
            .addCase(CreateHospitalThunk.fulfilled, (state) => {
                state.isLoading = false
                state.message = "Hospital data updated successfully"
            })
            .addCase(CreateHospitalThunk.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload || { message: "Failed to create hospital" }
                state.message = ""
            })

            // get hospital thunk
            .addCase(GetHospitalThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = ""
            })
            .addCase(GetHospitalThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.hospital = action.payload.data
            })
            .addCase(GetHospitalThunk.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload || { message: "Failed to fetch hospital data" }
                state.message = ""
            })

            // update hospital thunk
            .addCase(UpdateHospitalThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = ""
            })
            .addCase(UpdateHospitalThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.hospital = action.payload.data
            })
            .addCase(UpdateHospitalThunk.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload || { message: "Failed to update hospital data" }
                state.message = ""
            })
    }
})

export const { reset } = hospitalSlice.actions

export const selectHospitalLoading = (state: RootState) => state.hospital.isLoading;
export const selectHospitalError = (state: RootState) => state.hospital.error;
export const selectHospitalSuccess = (state: RootState) => state.hospital.success;
export const selectHospitalMessage = (state: RootState) => state.hospital.message;

export default hospitalSlice.reducer