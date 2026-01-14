import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ErrorResponse, UploadParams, UploadResponse, UploadState } from "./types"
import { RootState } from "../../app/store"
import uploadService from "./uploadService"

const initialState: UploadState = {
    isLoading: false,
    error: null,
    success: false,
    message: "",
}

// hospital report api
export const GetPresignedUrlThunk = createAsyncThunk<UploadResponse, UploadParams, { rejectValue: ErrorResponse }>("upload/GetPresignedUrlThunk", async (params, { rejectWithValue }) => {
    try {
        return await uploadService.getPresignedUrl(params)
    } catch (error) {

        const err = error as any;
        const message = err.response?.data?.details?.errors[0]?.message || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetched data';
        return rejectWithValue({ message });
    }
})

const uploadSlice = createSlice({
    name: "upload",
    initialState,
    reducers: {
        reset: state => {
            state.isLoading = false
            state.error = null
            state.success = false
            state.message = ""
        },
    },
    extraReducers: (builder) => {
        builder
            // hospital report
            .addCase(GetPresignedUrlThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = ""
            })
            .addCase(GetPresignedUrlThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.message = action.payload.message || "pre-signed url fetched successfully"
            })
            .addCase(GetPresignedUrlThunk.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload || { message: "failed to generate pre-signed url" }
                state.message = ""
            })
    }
})

export const { reset } = uploadSlice.actions

export const selectUploadLoading = (state: RootState) => state.upload.isLoading;
export const selectUploadError = (state: RootState) => state.upload.error;
export const selectUploadSuccess = (state: RootState) => state.upload.success;
export const selectUploadMessage = (state: RootState) => state.upload.message;

export default uploadSlice.reducer