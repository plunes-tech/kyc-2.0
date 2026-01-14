export type UploadParams = {
    filePath: string;
    method: "GET" | "PUT" | "DELETE";
}

export interface UploadResponse {
    url: string;
    success: boolean;
    message?: string;
}

// redux states
export interface ErrorResponse {
    message?: string;
    errors?: Record<string, string> | unknown;
}

export interface UploadState {
    isLoading: boolean;
    error: ErrorResponse | null;
    success: boolean;
    message?: string;
}