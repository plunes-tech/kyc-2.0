import api from "../../utils/axios";
import { DpaResponse, FilterDate, FilterTable, InsuranceRatioResponse, PatientStatusResponse, PlannedCasesResponse, SuccessTransactionResponse } from "./types";

const DASHBOARD_ENDPOINTS = {
    INSURANCE_RATIO: "/api/dashboard/",
    PATIENT_STATUS: "/api/dashboard/",
    DPA_STATUS: "/api/dashboard/",
    TRANSACTION_STATUS: "/api/dashboard/",
    PLANNED_CASES: "/api/dashboard/",
}

const dashboardService = {

    insuranceRatio: async (filters: FilterDate): Promise<InsuranceRatioResponse> => {
        const response = await api.get<InsuranceRatioResponse>(`${DASHBOARD_ENDPOINTS.INSURANCE_RATIO}`, {
            params: {
                ...(filters.filterType && {filterType: filters.filterType}),
                ...(filters.filterValue && {filterValue: filters.filterValue}),
                ...(filters.from && {from: filters.from}),
                ...(filters.to && {to: filters.to}),
            }
        })

        return response.data
    },

    patientStatus: async (filters: FilterDate): Promise<PatientStatusResponse> => {
        const response = await api.get<PatientStatusResponse>(`${DASHBOARD_ENDPOINTS.PATIENT_STATUS}`, {
            params: {
                ...(filters.filterType && {filterType: filters.filterType}),
                ...(filters.filterValue && {filterValue: filters.filterValue}),
                ...(filters.from && {from: filters.from}),
                ...(filters.to && {to: filters.to}),
            }
        })

        return response.data
    },

    dpaStatus: async (filters: FilterDate): Promise<DpaResponse> => {
        const response = await api.get<DpaResponse>(`${DASHBOARD_ENDPOINTS.DPA_STATUS}`, {
            params: {
                ...(filters.filterType && {filterType: filters.filterType}),
                ...(filters.filterValue && {filterValue: filters.filterValue}),
                ...(filters.from && {from: filters.from}),
                ...(filters.to && {to: filters.to}),
            }
        })

        return response.data
    },

    transactionStatus: async (filters: FilterTable): Promise<SuccessTransactionResponse> => {
        const response = await api.get<SuccessTransactionResponse>(`${DASHBOARD_ENDPOINTS.TRANSACTION_STATUS}`, {
            params: {
                page: filters.page,
                limit: filters.limit,
                ...(filters.filterType && {filterType: filters.filterType}),
                ...(filters.filterValue && {filterValue: filters.filterValue}),
                ...(filters.from && {from: filters.from}),
                ...(filters.to && {to: filters.to}),
            }
        })

        return response.data
    },

    plannedCases: async (filters: FilterTable): Promise<PlannedCasesResponse> => {
        const response = await api.get<PlannedCasesResponse>(`${DASHBOARD_ENDPOINTS.PLANNED_CASES}`, {
            params: {
                page: filters.page,
                limit: filters.limit,
                ...(filters.type && {type: filters.type}),
                ...(filters.filterType && {filterType: filters.filterType}),
                ...(filters.filterValue && {filterValue: filters.filterValue}),
                ...(filters.from && {from: filters.from}),
                ...(filters.to && {to: filters.to}),
            }
        })

        return response.data
    },

}

export default dashboardService