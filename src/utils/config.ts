export const Config = {
    env: import.meta.env.VITE_ENV as string,
    api: {
        kycUrl: import.meta.env.VITE_API_KYC_URL as string,
        kycUrlProd: import.meta.env.VITE_API_KYC_URL_PROD as string,
    }
}