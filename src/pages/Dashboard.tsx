import { Box, Button, Grid, Popover, ScrollArea } from "@mantine/core";
import { DatePicker, DatesRangeValue, DateValue, MonthPicker, YearPicker } from "@mantine/dates";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import FillPatientDetails from "../components/dashboard/FillPatientDetails";
import RealTimePatientStatus from "../components/dashboard/RealTimePatientStatus";
import InsuranceRatio from "../components/dashboard/InsuranceRatio";
import DpaDetails from "../components/dashboard/DpaDetails";
import TransactionDetails from "../components/dashboard/TransactionDetails";
import PlannedCases from "../components/dashboard/PlannedCases";
import useDashboard from "../hooks/useDashboard";
import GlobalLoader from "../components/GlobalLoader";
import Notifications from "../components/Notifications";
import useHospital from "../hooks/useHospital";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import HospitalDetailsModal from "../components/modals/HospitalDetailsModal";

const Dashboard: React.FC = () => {

    const { isLoading, error } = useDashboard()
    const { getHospital } = useHospital()

    const hospitalData = useSelector((state: RootState) => state.hospital.hospital)

    const [date, setDate] = useState<"today" | "yesterday" | "lastWeek" | "thisWeek" | "month" | "year" | "customRange">("today")
    const [dateString, setDateString] = useState<any>("")
    const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null])

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getHospital()
            } catch (error) {
                // handle by redux
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        setDateString("")
    }, [date])

    const handleMonthChange = (month: DateValue) => {
        if(!month) {
            return
        }
        const dateString = dayjs(month).format("YYYY-MM")
        setDateString(dateString)
    }

    const handleYearChange = (year: DateValue) => {
        if(!year) {
            return
        }
        const yearString = dayjs(year).format("YYYY")
        setDateString(yearString)
    }

    const handleRangeChange = (range: DatesRangeValue) => {
        if(!range) {
            return
        }
        setDateRange(range)
        if(range[0] && range[1]) {
            const start = dayjs(range[0]).format("YYYY-MM-DD")
            const end = dayjs(range[1]).format("YYYY-MM-DD")
            setDateString(`${start},${end}`)
        }
    }

    return (
        <>
            {isLoading && <GlobalLoader/>}
            {error && error.message && error.message.toLocaleLowerCase() !== "validation error" && <Notifications type="error" title="Error" message={error.message} />}
            {error && error.message && error.message.toLocaleLowerCase() === "validation error" && Array.isArray(error.errors) && error.errors[0]?.message && <Notifications type="error" title="Error" message={error.errors[0].message} />}
            {/* terms and condition modal */}
            {hospitalData && !hospitalData.basicDetailUpdates && <HospitalDetailsModal initialData={hospitalData} />}
            {/* main dashboard component */}
            <main className="bg-[#F2F5FA] w-[100vw] md:w-[calc(100vw-50px)] mt-[3.5rem] md:ml-[50px]">
                <ScrollArea h={"calc(100vh - 3.5rem)"} className="p-4" scrollbarSize={4} scrollbars="y">
                    {/* date selection button */}
                    <div className="flex items-center justify-between flex-wrap gap-y-4 mb-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button size="xs" radius={6} onClick={()=>setDate("today")} classNames={{
                                root: `${date==="today" ? "!bg-[#39B54A]" : "!bg-[#FFFFFF] !border-1 !border-[#DDDDDD]"}`,
                                label: `!text-[0.7rem] !font-medium ${date==="today" ? "!text-[#FFFFFF]" : "!text-[#404040]"}`
                            }}>
                                Today
                            </Button>
                            <Button size="xs" radius={6} onClick={()=>setDate("yesterday")} classNames={{
                                root: `${date==="yesterday" ? "!bg-[#39B54A]" : "!bg-[#FFFFFF] !border-1 !border-[#DDDDDD]"}`,
                                label: `!text-[0.7rem] !font-medium ${date==="yesterday" ? "!text-[#FFFFFF]" : "!text-[#404040]"}`
                            }}>
                                Yesterday
                            </Button>
                            <Button size="xs" radius={6} onClick={()=>setDate("lastWeek")} classNames={{
                                root: `${date==="lastWeek" ? "!bg-[#39B54A]" : "!bg-[#FFFFFF] !border-1 !border-[#DDDDDD]"}`,
                                label: `!text-[0.7rem] !font-medium ${date==="lastWeek" ? "!text-[#FFFFFF]" : "!text-[#404040]"}`
                            }}>
                                Last Week
                            </Button>
                            <Button size="xs" radius={6} onClick={()=>setDate("thisWeek")} classNames={{
                                root: `${date==="thisWeek" ? "!bg-[#39B54A]" : "!bg-[#FFFFFF] !border-1 !border-[#DDDDDD]"}`,
                                label: `!text-[0.7rem] !font-medium ${date==="thisWeek" ? "!text-[#FFFFFF]" : "!text-[#404040]"}`
                            }}>
                                This Week
                            </Button>
                            <div onClick={()=>setDate("month")}>
                                <Popover position="bottom" offset={5}>
                                    <Popover.Target>
                                        <Button size="xs" radius={6} classNames={{
                                            root: `${(date==="month" && dateString) ? "!bg-[#39B54A]" : "!bg-[#FFFFFF] !border-1 !border-[#DDDDDD]"}`,
                                            label: `!text-[0.7rem] !font-medium ${(date==="month" && dateString) ? "!text-[#FFFFFF]" : "!text-[#404040]"}`
                                        }}>
                                            Month
                                        </Button>
                                    </Popover.Target>
                                    <Popover.Dropdown className="!p-0">
                                        <MonthPicker value={dateString} onChange={e => handleMonthChange(e)} size="xs" className="!border-1 !border-[#BDBDBD] !shadow-[0_5px_5px_#00000040] !rounded-[0.375rem]"/>
                                    </Popover.Dropdown>
                                </Popover>
                            </div>
                            <div onClick={()=>setDate("year")}>
                                <Popover position="bottom" offset={5}>
                                    <Popover.Target>
                                        <Button size="xs" radius={6} classNames={{
                                            root: `${(date==="year" && dateString) ? "!bg-[#39B54A]" : "!bg-[#FFFFFF] !border-1 !border-[#DDDDDD]"}`,
                                            label: `!text-[0.7rem] !font-medium ${(date==="year" && dateString) ? "!text-[#FFFFFF]" : "!text-[#404040]"}`
                                        }}>
                                            Year
                                        </Button>
                                    </Popover.Target>
                                    <Popover.Dropdown className="!p-0">
                                        <YearPicker value={dateString} onChange={e => handleYearChange(e)} size="xs" className="!border-1 !border-[#BDBDBD] !shadow-[0_5px_5px_#00000040] !rounded-[0.375rem]"/>
                                    </Popover.Dropdown>
                                </Popover>
                            </div>
                            <div onClick={()=>setDate("customRange")}>
                                <Popover position="bottom" offset={5}>
                                    <Popover.Target>
                                        <Button size="xs" radius={6} classNames={{
                                            root: `${(date==="customRange" && dateString) ? "!bg-[#39B54A]" : "!bg-[#FFFFFF] !border-1 !border-[#DDDDDD]"}`,
                                            label: `!text-[0.7rem] !font-medium ${(date==="customRange" && dateString) ? "!text-[#FFFFFF]" : "!text-[#404040]"}`
                                        }}>
                                            Select Range
                                        </Button>
                                    </Popover.Target>
                                    <Popover.Dropdown className="!p-0">
                                        <DatePicker value={dateRange} onChange={e => handleRangeChange(e)} allowSingleDateInRange size="xs" type="range" className="!border-1 !border-[#BDBDBD] !shadow-[0_5px_5px_#00000040] !rounded-[0.375rem]"/>
                                    </Popover.Dropdown>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
                            <Box className="border-1 border-[#43B75D] rounded-[0.5rem]" bg="#FFFFFF" mih={215}>
                                <FillPatientDetails/>
                            </Box>
                            <Box className="border-1 border-[#BBBBBB] rounded-[0.5rem] mt-[1rem]" bg="#FFFFFF" mih={250}>
                                <RealTimePatientStatus date={date} dateString={dateString} />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
                            <Box className="border-1 border-[#C9C9C9] rounded-[0.5rem]" bg="#FFFFFF" mih={505}>
                                <InsuranceRatio date={date} dateString={dateString} />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
                            <Box className="border-1 border-[#C9C9C9] rounded-[0.5rem]" bg="#FFFFFF" mih={250}>
                                <DpaDetails date={date} dateString={dateString} />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
                            <Box className="border-1 border-[#C9C9C9] rounded-[0.5rem]" bg="#FFFFFF" mih={250}>
                                <TransactionDetails date={date} dateString={dateString} />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Box className="border-1 border-[#C9C9C9] rounded-[0.5rem]" bg="#FFFFFF" mih={400}>
                                <PlannedCases date={date} dateString={dateString} />
                            </Box>
                        </Grid.Col>
                    </Grid>
                </ScrollArea>
            </main>
        </>
    );
};

export default Dashboard;                    