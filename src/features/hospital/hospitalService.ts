import api from "../../utils/axios";
import { Hospital, HospitalResponse, HospitalUpdate } from "./types";

const HOSPITAL_ENDPOINTS = {
    GET_HOSPITAL: "/api/hospitals",
    UPDATE_HOSPITAL: "/api/hospitals",
}

const hospitalService = {

    addHospital: async (payload: Hospital): Promise<HospitalResponse> => {
        const result = await api.post<HospitalResponse>(`${HOSPITAL_ENDPOINTS.UPDATE_HOSPITAL}`, { ...payload })
        return result.data
    },

    getHospital: async (): Promise<HospitalResponse> => {
        const result = await api.get<HospitalResponse>(`${HOSPITAL_ENDPOINTS.GET_HOSPITAL}`)
        return result.data
    },

    updateHospital: async (hospitalId: string, payload: HospitalUpdate): Promise<HospitalResponse> => {
        const result = await api.patch<HospitalResponse>(`${HOSPITAL_ENDPOINTS.UPDATE_HOSPITAL}/${hospitalId}`, { ...payload })
        return result.data
    },

}

export default hospitalService;