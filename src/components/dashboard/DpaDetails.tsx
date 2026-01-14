import React, { useEffect } from "react";
import { Button, Grid, RingProgress } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { DateProps, dateValue } from "../../features/dashboard/types";
import useDashboard from "../../hooks/useDashboard";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

const DpaDetails:React.FC<DateProps> = ({date, dateString}) => {

    const navigate = useNavigate()
    const { dpaStatus } = useDashboard()

    const data = useSelector((state: RootState) => state.dashboard.dpaStatus)

    useEffect(() => {
    
        const fetchData = async (date: dateValue, dateString?: string, from?: string, to?: string) => {
            try {
                await dpaStatus({filterType: date, filterValue: dateString, from: from, to: to})
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
            <h3 className="text-[#111111] text-[0.8rem] font-semibold mb-2">DPA Account Statement</h3>
            <div className="flex flex-col sm:flex-row items-center gap-8">
                {data && <RingProgress transitionDuration={250} size={200} thickness={20}
                    sections={[
                        {color: "#F3AE47", value: data?.amountProcessed ?? 0},
                        {color: "#49AF97", value: data?.totalClaimAmount ?? 0},
                        {color: "#2257BA", value: data?.finalApprovedAmount ?? 0},
                    ]}
                />}
                {!data && <RingProgress transitionDuration={250} size={200} thickness={20} sections={[{color: "#F3AE47", value: 100}]}/>}
                <div className="w-full">
                    <Grid className="mb-4">
                        <Grid.Col span={8} className="flex items-center gap-4">
                            <div className="border-3 border-[#F3AE47] rounded-[50%] h-4 w-4"/>
                            <p className="text-[#000000DE] text-[0.8rem] font-semibold">Actual Amount Processed</p>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <p className="text-[#F3AE47] text-[0.8rem] font-semibold">{(data?.amountProcessed || data?.amountProcessed == 0) ? "₹ " + data?.amountProcessed?.toLocaleString("en-In") : 0}</p>
                        </Grid.Col>
                    </Grid>
                    <Grid className="mb-4">
                        <Grid.Col span={8} className="flex items-center gap-4">
                            <div className="border-3 border-[#49AF97] rounded-[50%] h-4 w-4"/>
                            <p className="text-[#000000DE] text-[0.8rem] font-semibold">Total Claim Amount</p>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <p className="text-[#49AF97] text-[0.8rem] font-semibold">{(data?.totalClaimAmount || data?.totalClaimAmount == 0) ? "₹ " + data?.totalClaimAmount?.toLocaleString("en-In") : 0}</p>
                        </Grid.Col>
                    </Grid>
                    <Grid>
                        <Grid.Col span={8} className="flex items-center gap-4">
                            <div className="border-3 border-[#2257BA] rounded-[50%] h-4 w-4"/>
                            <p className="text-[#000000DE] text-[0.8rem] font-semibold">Final Approved Amount</p>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <p className="text-[#2257BA] text-[0.8rem] font-semibold">{(data?.finalApprovedAmount || data?.finalApprovedAmount == 0) ? "₹ " + data?.finalApprovedAmount?.toLocaleString("en-In") : 0}</p>
                        </Grid.Col>
                    </Grid>
                </div>
            </div>
            <div className="flex justify-end">
                <Button variant="light" size="xs"
                    classNames={{
                        root: '!bg-[#E6F4FF] !rounded-[0.25rem] !px-6 -mt-5',
                        label: '!text-[#3E97FF] !text-[0.8rem] font-medium'
                    }}
                    onClick={() => navigate('/transaction-details')}
                >
                    View
                </Button>
            </div>
        </div>
    )
}

export default DpaDetails