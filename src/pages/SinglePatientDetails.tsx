import React, { useEffect, useState } from "react";
import useBooking from "../hooks/useBooking";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { useLocation, useNavigate } from "react-router-dom";
import { getUrlParams } from "../utils/utilits";
import GlobalLoader from "../components/GlobalLoader";
import { Button, Modal, ScrollArea, Timeline } from "@mantine/core";
import { BackIcon, CheckIcon, TimelineIcon } from "../assets/icons";
import dayjs from "dayjs";
import AllDetails from "../components/bookingDetails/allDetails";
import BookingDocuments from "../components/bookingDetails/documents";
import Enhancement from "../components/bookingDetails/enhancements";
import Notifications from "../components/Notifications";
import useHospital from "../hooks/useHospital";

const SinglePatientDetails: React.FC = () => {

    const { isLoading, error, getBookingById } = useBooking()
    const { getHospital } = useHospital()
    const data = useSelector((state: RootState) => state.booking.booking)

    const navigate = useNavigate()
    const location = useLocation()

    const [activePage, setActivePage] = useState('allDetails')
    const [activeSideBarTab, setActiveSideBarTab] = useState("dashoard")
    const [openTimeline, setOpenTimeline] = useState(false)

    useEffect(() => {
        const fetchData = async (bookingId: string) => {
            try {
                await getBookingById(bookingId)
            } catch (error) {
                // handled by redux
            }
        }
        const fetchHospitalData = async () => {
            try {
                await getHospital()
            } catch (error) {
                // handle by redux
            }
        }

        const bookingId = getUrlParams("bookingId")
        if(bookingId) {
            fetchData(bookingId)
            fetchHospitalData()
        }
    }, [])

    useEffect(() => {
            if(location.state) {
                if(location.state?.activePage) {
                    setActivePage(location.state?.activePage)
                }
                if(location.state.activeTab) {
                    setActiveSideBarTab(location.state.activeTab)
                } else {
                    setActiveSideBarTab("dashoard")
                }
            } else {
                setActivePage('allDetails')
            }
    }, [location])

    return (
        <>
        {isLoading && <GlobalLoader/>}
        {error && error.message && error.message.toLocaleLowerCase() !== "validation error" && <Notifications type="error" title="Error" message={error.message} />}
        {error && error.message && error.message.toLocaleLowerCase() === "validation error" && Array.isArray(error.errors) && error.errors[0]?.message && <Notifications type="error" title="Error" message={error.errors[0].message} />}
        <main className="bg-[#F6F6F6] mt-[3.5rem] xl:mt-[4.25rem] md:ml-[50px] min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4.25rem)] min-w-[100vw] md:min-w-[calc(100vw-50px)] p-2 sm:p-4">
            {/* smaller screens button and heading */}
            <div className="flex items-center justify-between flex-wrap gap-4 mt-2 mb-6 md:hidden">
                <div className="flex items-start gap-3">
                    <span onClick={()=>{}}><BackIcon width={18} height={18} className="cursor-pointer text-[#606060]"/></span>
                    <h3 className="text-[#606060] text-[0.9rem] font-semibold">{data?.plNumber ?? "-"}, {data?.patient?.name ?? "-"}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        leftSection={<TimelineIcon className="text-[#636363]" width={15} height={15}/>}
                        classNames={{
                            root: "!border-1 !border-[#CECECE] !rounded-[0.5rem] !bg-[#FFFFFF] !p-2 !h-[1.75rem]",
                            label: "text-[#636363] !text-[0.9rem] !h-[max-content]"
                        }}
                        onClick={()=>setOpenTimeline(true)}
                        >
                        Timeline
                    </Button>
                </div>
            </div>

            {/* navigation buttons */}
            <div className="flex items-center gap-4 flex-wrap sm:gap-8 sm:justify-start">
                <Button size="compact-xs"
                    classNames={{
                        root: `!px-4 !rounded-[0.25rem] ${activePage === "allDetails" ? "!bg-[#39B54A]" : "!border-1 !border-[#5D5959] !bg-[#FFFFFF]"}`,
                        label: `${activePage==="allDetails" ? "!text-[#FFFFFF]" : "!text-[#5D5959]"} !text-[0.8rem] !h-[max-content] font-medium`,
                    }}
                    onClick={()=>navigate(`/patient-details/booking-details?bookingId=${data?.id}`, {state: {activePage: "allDetails", activeTab: activeSideBarTab}})}
                >
                    All Details
                </Button>
                <Button size="compact-xs"
                    classNames={{
                        root: `!px-4 !rounded-[0.25rem] ${activePage === "enhancements" ? "!bg-[#39B54A]" : "!border-1 !border-[#5D5959] !bg-[#FFFFFF]"}`,
                        label: `${activePage==="enhancements" ? "!text-[#FFFFFF]" : "!text-[#5D5959]"} !text-[0.8rem] !h-[max-content] font-medium`,
                    }}
                    onClick={()=>navigate(`/patient-details/booking-details?bookingId=${data?.id}`, {state: {activePage: "enhancements", activeTab: activeSideBarTab}})}
                >
                    Enhancements
                </Button>
                <Button size="compact-xs"
                    classNames={{
                        root: `!px-4 !rounded-[0.25rem] ${activePage === "documents" ? "!bg-[#39B54A]" : "!border-1 !border-[#5D5959] !bg-[#FFFFFF]"}`,
                        label: `${activePage==="documents" ? "!text-[#FFFFFF]" : "!text-[#5D5959]"} !text-[0.8rem] !h-[max-content] font-medium`,
                    }}
                    onClick={()=>navigate(`/patient-details/booking-details?bookingId=${data?.id}`, {state: {activePage: "documents", activeTab: activeSideBarTab}})}
                >
                    Documents
                </Button>
            </div>

            <div className="mt-6 flex items-start gap-4">
                {/* main component */}
                <div className="flex-2/3">
                    {activePage === "allDetails" && <AllDetails/>}
                    {activePage === "enhancements" && <Enhancement/>}
                    {activePage === "documents" && <BookingDocuments/>}
                </div>

                <div className="hidden md:block md:flex-1/3 h-[calc(100vh-8.5rem)] border-1 border-[#B0B0B0] rounded-[0.5rem]">
                    <div className={`flex items-center justify-start gap-2 py-1 px-2 text-[0.8rem] font-medium border-b-1 border-b-[#DCDCDC] text-[#2C2B2B]`}>
                        <TimelineIcon width={26} height={12} />
                        Timeline
                    </div>
                    <ScrollArea h={"calc(100vh - 11rem)"} type="always" scrollbarSize={5}>
                        <div className="p-4">
                            {data && !!data?.auditTrail?.length && <Timeline active={data?.auditTrail?.filter(item => item.type === "CLAIM_STATUS" || item.type === "DOC")?.length ? data?.auditTrail?.filter(item => item.type === "CLAIM_STATUS" || item.type === "DOC")?.length : 0} bulletSize={16} color="green" lineWidth={2}>
                                {data?.auditTrail?.length && data?.auditTrail?.length > 0 && data?.auditTrail
                                    .filter(item => item.type === "CLAIM_STATUS" || item.type === "DOC")
                                    .map(item => (
                                        <Timeline.Item key={item.datetime} lineVariant="dashed" bullet={<CheckIcon className="text-[#FFFFFF]" width={20} height={20}/>} >
                                            <h4 className="text-[0.8rem] font-medium">{item.heading}</h4>
                                            <h5 className="text-[0.7rem] font-medium">{item.task}</h5>
                                            <p className="font-medium text-[0.7rem] text-[#9C9C9C] mb-1">{item.desc}</p>
                                            <p className="font-medium text-[0.7rem] text-[#9C9C9C] mb-1">{dayjs(item.datetime).format("DD-MMM-YYYY, hh:mm a")}</p>
                                        </Timeline.Item>
                                    ))}
                            </Timeline>}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </main>

        {/* timeline for smaller screens */}
        <Modal
            opened={openTimeline}
            onClose={()=>setOpenTimeline(false)}
            title={<div className="flex items-center gap-2">
                <TimelineIcon className="text-[#2C2B2B]" width={20} height={12}/>
                <h3 className="font-semibold text-[#2C2B2B] text-[1rem]">Timeline</h3>
            </div>}
            classNames={{
                content: '!border-1 !border-[#B0B0B0] !rounded-[0.5rem]',
                header: '!border-b-1 !border-b-[#DCDCDC]',
            }}
        >
            <div className="mt-6">
                {data && !!data?.auditTrail?.length && <Timeline active={data?.auditTrail?.filter(item => item.type === "CLAIM_STATUS" || item.type === "DOC")?.length ? data?.auditTrail?.filter(item => item.type === "CLAIM_STATUS" || item.type === "DOC")?.length : 0} bulletSize={16} color="green" lineWidth={2}>
                    {data?.auditTrail?.length && data?.auditTrail?.length > 0 && data?.auditTrail
                        .filter(item => item.type === "CLAIM_STATUS" || item.type === "DOC")
                        .map(item => (
                            <Timeline.Item key={item.datetime} lineVariant="dashed" bullet={<CheckIcon className="text-[#FFFFFF]" width={20} height={20}/>} >
                                <h4 className="text-[0.8rem] font-medium">{item.heading}</h4>
                                <h5 className="text-[0.7rem] font-medium">{item.task}</h5>
                                <p className="font-medium text-[0.7rem] text-[#9C9C9C] mb-1">{item.desc}</p>
                                <p className="font-medium text-[0.7rem] text-[#9C9C9C] mb-1">{dayjs(item.datetime).format("DD-MMM-YYYY, hh:mm a")}</p>
                            </Timeline.Item>
                        ))}
                </Timeline>}
            </div>
        </Modal>
        </>
    )
}

export default SinglePatientDetails;