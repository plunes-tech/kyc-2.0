import { useDispatch } from "react-redux";
import { AppDispatch } from "../app/store";
import { useSelector } from "react-redux";
import { GetPresignedUrlThunk, selectUploadError, selectUploadLoading, selectUploadMessage, selectUploadSuccess } from "../features/uploads/uploadSlice";
import { UploadParams, UploadResponse } from "../features/uploads/types";

const useUploads = () => {
    
    const dispatch = useDispatch<AppDispatch>()
    
    const isLoading = useSelector(selectUploadLoading)
    const error = useSelector(selectUploadError)
    const success = useSelector(selectUploadSuccess)
    const message = useSelector(selectUploadMessage)

    const getPresignedUrl = async (params: UploadParams): Promise<UploadResponse> => {
        try {
            const result = await dispatch(GetPresignedUrlThunk(params)).unwrap()
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
        getPresignedUrl,
    }
}

export default useUploads