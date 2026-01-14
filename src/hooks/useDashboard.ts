import { useSelector } from "react-redux"
import { useAppDispatch } from "../app/hooks"
import { AppDispatch } from "../app/store"
import { DpaStatusThunk, InsuranceRatioThunk, PatientStatusThunk, PlannedCasesThunk, selectDashboardError, selectDashboardLoading, selectDashboardMessage, selectDashboardSuccess, TransactionStatusThunk } from "../features/dashboard/dashboardSlice"
import { DpaResponse, FilterDate, FilterTable, InsuranceRatioResponse, PatientStatusResponse, PlannedCasesResponse, SuccessTransactionResponse } from "../features/dashboard/types"

const useDashboard = () => {

    const dispatch = useAppDispatch<AppDispatch>()

    const isLoading = useSelector(selectDashboardLoading)
    const error = useSelector(selectDashboardError)
    const success = useSelector(selectDashboardSuccess)
    const message = useSelector(selectDashboardMessage)

    const insuranceRatio = async (filter: FilterDate): Promise<InsuranceRatioResponse> => {
        try {
            const result = await dispatch(InsuranceRatioThunk(filter)).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const patientStatus = async (filter: FilterDate): Promise<PatientStatusResponse> => {
        try {
            const result = await dispatch(PatientStatusThunk(filter)).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const dpaStatus = async (filter: FilterDate): Promise<DpaResponse> => {
        try {
            const result = await dispatch(DpaStatusThunk(filter)).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const transactionStatus = async (filter: FilterTable): Promise<SuccessTransactionResponse> => {
        try {
            const result = await dispatch(TransactionStatusThunk(filter)).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const plannedCases = async (filter: FilterTable): Promise<PlannedCasesResponse> => {
        try {
            const result = await dispatch(PlannedCasesThunk(filter)).unwrap()
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
        insuranceRatio,
        patientStatus,
        dpaStatus,
        transactionStatus,
        plannedCases,
    }

}

export default useDashboard