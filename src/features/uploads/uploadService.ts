import api from "../../utils/axios";
import { UploadParams, UploadResponse } from "./types";

const UPLOAD_END_POINTS = {
    GET_PRE_SIGNED_URL: "/api/bucket/presign-url"
}

const uploadService = {

    getPresignedUrl: async (params: UploadParams): Promise<UploadResponse> => {
        const result = await api.get<UploadResponse>(`${UPLOAD_END_POINTS.GET_PRE_SIGNED_URL}`, {
            params: {
                filePath: params.filePath,
                method: params.method,
            }
        })
        return result.data
    }

}

export default uploadService