import React, { useEffect, useState } from "react";
import { Grid, RingProgress } from "@mantine/core";
import { DateProps, dateValue } from "../../features/dashboard/types";
import useDashboard from "../../hooks/useDashboard";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

const RealTimePatientStatus: React.FC<DateProps> = ({date, dateString}) => {

    const { patientStatus } = useDashboard()
    const patientData = useSelector((state: RootState) => state.dashboard.patientStatus)

    const [data, setData] = useState<{color: string, value: number}[]>([])

    useEffect(() => {

        const fetchData = async (date: dateValue, dateString?: string, from?: string, to?: string) => {
            try {
                const result = await patientStatus({filterType: date, filterValue: dateString, from: from, to: to})
                setData([
                    {color: "#4E61F6", value: result.data?.raised ?? 0},
                    {color: "#43B75D", value: result.data?.approved ?? 0},
                    {color: "#EE443F", value: result.data?.rejected ?? 0},
                    {color: "#0095FF", value: result.data?.underProcess ?? 0},
                    {color: "#008ABB", value: result.data?.admitted ?? 0},
                    {color: "#FFAA00", value: result.data?.discharged ?? 0},
                ])
            } catch (error) {
                // error handled by redux
            }
        }

        if(date) {
            if(date !== "month" && date !== "year" && date !== "customRange") {
                fetchData(date)
            } else {
                if(dateString && date==="customRange") {
                    fetchData(date, dateString, dateString.split(",")[0], dateString.split(",")[1])
                }
                if (dateString) {
                    fetchData(date, dateString)
                }
            }
        }
    }, [date, dateString])

    return (
        <div className="p-3">
            <h3 className="text-[#111111] text-[0.8rem] font-semibold">Real Time Patient Status</h3>
            <div className="flex items-center flex-col md:flex-row">
                <div className="relative flex justify-center items-center h-[250px] w-[250px] -mb-6 -mt-4">
                    {/* data rings */}
                    {data.length > 0 && data.map((item, idx) => (
                        <RingProgress key={idx + Math.random()} sections={[item]} 
                            transitionDuration={250} size={200 - (idx + 30)} thickness={4} 
                            roundCaps rootColor="#F6F6F6" 
                            classNames={{
                                root:'!absolute'
                            }}
                        />
                    ))}
                    {!data.length && <RingProgress sections={[{color: "#4E61F6", value: 100}]} 
                        transitionDuration={250} size={200} thickness={4} 
                        classNames={{
                            root:'!absolute',
                        }}
                    />}
                </div>
                <div className="w-[100%]">
                    <Grid>
                        <Grid.Col span={{base: 6, xs: 3}} className="!text-center">
                            <h4 className="text-[#4E61F6] text-[0.7rem] font-semibold">Raised</h4>
                            <p className="text-[#4E61F6] text-[0.9rem]">{patientData?.raised ?? 0}</p>
                            <span className="text-[#0B1C33] text-[0.7rem]">Patients</span>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, xs: 3}} className="!text-center">
                            <h4 className="text-[#43B75D] text-[0.7rem] font-semibold">Approved</h4>
                            <p className="text-[#43B75D] text-[0.9rem]">{patientData?.approved ?? 0}</p>
                            <span className="text-[#0B1C33] text-[0.7rem]">Patients</span>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, xs: 3}} className="!text-center">
                            <h4 className="text-[#EE443F] text-[0.7rem] font-semibold">Rejected</h4>
                            <p className="text-[#EE443F] text-[0.9rem]">{patientData?.rejected ?? 0}</p>
                            <span className="text-[#0B1C33] text-[0.7rem]">Patients</span>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, xs: 3}} className="!text-center">
                            <h4 className="text-[#0095FF] text-[0.7rem] font-semibold">Under Process</h4>
                            <p className="text-[#0095FF] text-[0.9rem]">{patientData?.underProcess ?? 0}</p>
                            <span className="text-[#0B1C33] text-[0.7rem]">Patients</span>
                        </Grid.Col>
                    </Grid>
                    <div className="h-[1px] bg-[#E4DFDF] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] my-5"/>
                    <Grid>
                        <Grid.Col span={6} className="!text-center">
                            <h4 className="text-[#008ABB] text-[0.8rem] font-semibold">Admitted</h4>
                            <p className="text-[#008ABB] text-[1rem] font-semibold">{patientData?.admitted ?? 0}</p>
                            <span className="text-[#0B1C33] text-[0.7rem]">Patients</span>
                        </Grid.Col>
                        <Grid.Col span={6} className="!text-center">
                            <h4 className="text-[#FFAA00] text-[0.8rem] font-semibold">Discharged</h4>
                            <p className="text-[#FFAA00] text-[1rem] font-semibold">{patientData?.discharged ?? 0}</p>
                            <span className="text-[#0B1C33] text-[0.7rem]">Patients</span>
                        </Grid.Col>
                    </Grid>
                </div>
            </div>
        </div>
    )
}

export default RealTimePatientStatus;