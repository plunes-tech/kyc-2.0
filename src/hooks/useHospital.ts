import { useSelector } from "react-redux"
import { useAppDispatch } from "../app/hooks"
import { AppDispatch } from "../app/store"
import { CreateHospitalThunk, GetHospitalThunk, selectHospitalError, selectHospitalLoading, selectHospitalMessage, selectHospitalSuccess, UpdateHospitalThunk } from "../features/hospital/hospitalSlice"
import { HospitalResponse, HospitalUpdate } from "../features/hospital/types"

const useHospital = () => {

    const dispatch = useAppDispatch<AppDispatch>()

    const isLoading = useSelector(selectHospitalLoading)
    const error = useSelector(selectHospitalError)
    const success = useSelector(selectHospitalSuccess)
    const message = useSelector(selectHospitalMessage)

    const addHospital = async (payload: HospitalUpdate): Promise<HospitalResponse> => {
        try {
            const result = await dispatch(CreateHospitalThunk(payload)).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const getHospital = async (): Promise<HospitalResponse> => {
        try {
            const result = await dispatch(GetHospitalThunk({})).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const updateHospital = async (hospitalId: string, payload: HospitalUpdate): Promise<HospitalResponse> => {
        try {
            const result = await dispatch(UpdateHospitalThunk({hospitalId, payload})).unwrap()
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
        // hospital hooks
        getHospital,
        addHospital,
        updateHospital,
    }

}

export default useHospital