import React, { useEffect, useState } from "react";
import { RingProgress, ScrollArea } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { DownChevronIcon, EmptyIcon } from "../../assets/icons";
import { DateProps, dateValue } from "../../features/dashboard/types";
import useDashboard from "../../hooks/useDashboard";

interface DataItem {
    id: string;
    name: string;
    value: number;
    percent: number;
    color: string;
    tooltip: string;
}

const colors = ["#A6CEE3", "#1F78B4", "#B2DF8A", "#33A02C", "#FB9A99", "#E31A1C", "#FDBF6F", "#FF9900"]

const InsuranceRatio: React.FC<DateProps> = ({date, dateString}) => {

    const { insuranceRatio } = useDashboard()
    const navigate = useNavigate()

    const [data, setData] = useState<DataItem[]>([]);

    useEffect(() => {
    
            const fetchData = async (date: dateValue, dateString?: string, from?: string, to?: string) => {
                try {
                    const result = await insuranceRatio({filterType: date, filterValue: dateString, from: from, to: to})
                    if(result.data && result.data?.length > 0) {
                        const allColors = [...colors, ...colors, ...colors, ...colors];
                        const newData: DataItem[] = []

                        let total = 0
                        result.data?.forEach(item => {
                            total += item.count ?? 0
                        });

                        result.data?.forEach((item, idx) => {
                            newData.push({
                                id: item.id ?? "",
                                name: item.name ?? "",
                                value: item.count ?? 0,
                                percent: item.count ? (item.count / total) * 100 : 0,
                                color: allColors[idx],
                                tooltip: `${item.name} - ${item.count ?? 0}`
                            })
                        })

                        setData(newData);
                    }
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

            return () => {
                setData([])
            }
        }, [date, dateString])

    return (
        <div>
            <h3 className="text-[#111111] text-[0.8rem] font-semibold p-3">Insurance Provider Ratio</h3>
            <div className="flex items-center flex-col justify-center">
                <RingProgress sections={data} transitionDuration={250} size={300} thickness={35} rootColor="#FFAA00"/>
            </div>
            <ScrollArea h={160} className="!border-t-[#E8E8E8] !border-t-1" scrollbarSize={4}>
                {data.length > 0 && data.map((item, idx) => (
                    <div key={Math.random().toString()} className={`flex items-center justify-between py-2 cursor-pointer ${idx !== data.length ? 'border-b-[#E8E8E8] border-b-1' : ''}`}
                        onClick={()=>navigate(`/patient-details?insurance=${item.id}`, {state: {activeTab: "patient-details"}})}
                    >
                        <div className="flex items-center">
                            <RingProgress rootColor="#DFDFDF" 
                                sections={[{ color: item.color, value: item.percent }]} size={40} thickness={4} 
                                label={<p className="text-center text-[0.5rem]">{item.percent}%</p>} 
                                classNames={{
                                    label: "!text-[#243465] !font-semibold"
                                }}
                            />
                            <p className="text-[#696666] text-[0.75rem] max-w-[90%]">{item.name}</p>
                        </div>
                        <DownChevronIcon className="text-[#696666] -rotate-90 mr-2"/>
                    </div>
                ))}
                {!data.length && <>
                    <div className="flex items-center justify-center flex-col gap-2 text-[#D9D9D9] text-[0.8rem] font-semibold mt-10">
                        <EmptyIcon width={40} height={40} />
                        No Data
                    </div>
                </>}
            </ScrollArea>
        </div>
    )
}

export default InsuranceRatio;