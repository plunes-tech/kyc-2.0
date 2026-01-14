import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@mantine/core";
import { ChevronDownIcon, DashboardIcon, LogoutIcon, PatientDetailsIcon, SettingsIcon, TransactionDetailsIcon } from "../assets/icons";

const SideBar:React.FC = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const [hover, setHover] = useState(false)
    const [active, setActive] = useState("dashboard")
    const [subActiveTab, setSubActiveTab] = useState("")
    const [openSettings, setOpenSettings] = useState(false)

    useEffect(() => {
        if(location.state) {
            if(location.state?.activeTab) {
                setActive(location.state?.activeTab)
            } else {
                setActive("dashboard")
            }
            if(location.state?.subActiveTab) {
                setSubActiveTab(location.state?.subActiveTab)
            } else {
                setSubActiveTab("")
            }
        } else {
            setActive("dashboard")
            setSubActiveTab("")
        }
    }, [location])

    const handleLogout = async () => {
        try {
            navigate("/login")
        } catch (error) {
            // handle by redux
        }
    }

    return (
        <div className="relative hidden md:block">
            {/* top image */}
            <div className="fixed top-0 left-0 h-[3.5rem] xl:h-[4.25rem] w-[250px] xl:w-[300px] bg-[#FFFFFF] border-b-1 border-b-[#DFE0E2] px-5 py-3 z-15">
                <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/plunes-full-logo.png" alt="" className="h-[2rem] xl:h-[2.75rem] cursor-pointer" 
                    onClick={()=>navigate("/dashboard", {state: {activeTab: "dashboard", subActiveTab: ""}})}
                />
            </div>

            {/* sidebar */}
            <div className={`min-h-[calc(100vh-3.5rem)] fixed z-10 left-0 top-[3.5rem] border-r-1 border-r-[#DFE0E2] ${hover ? "w-[250px] xl:w-[300px] px-5 py-4" : "w-[50px]"} bg-[#FFFFFF]
                transition-all duration-200`}
                onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false); setOpenSettings(false)}}
            >
                <ScrollArea h={"calc(100vh - 5rem)"} scrollbarSize={0} >
                    {/* Menu section */}
                    <div className={`flex flex-col pb-4 ${hover ? "items-start" : "items-center pt-4"}`}>
                        {hover && <h3 className="text-[#4D4D4D] text-[0.9rem] mb-4">MENU</h3>}
                        <div className={`flex items-center cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] ${hover ? "mb-3 w-full" : "mb-4"}
                            ${active==="dashboard" ? "bg-[#39B54A] text-[#FFFDFD] p-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                            onClick={()=>navigate("/dashboard", {state: {activeTab: "dashboard", subActiveTab: ""}})}
                        >
                            <DashboardIcon width={16} height={16}/>
                            {hover && <p className="text-[0.9rem] font-medium ml-3">Dashboard</p>}
                        </div>
                        <div className={`flex items-center cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] ${hover ? "mb-3 w-full" : "mb-4"}
                            ${active==="patient-details" ? "bg-[#39B54A] text-[#FFFDFD] p-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                            onClick={()=>navigate("/patient-details", {state: {activeTab: "patient-details", subActiveTab: ""}})}
                        >
                            <PatientDetailsIcon width={16} height={20}/>
                            {hover && <p className="text-[0.9rem] font-medium ml-3">Patient Details</p>}
                        </div>
                        <div className={`flex items-center cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] ${hover ? "mb-3 w-full" : "mb-4"}
                            ${active==="transaction-details" ? "bg-[#39B54A] text-[#FFFDFD] p-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                            onClick={()=>navigate("/transaction-details", {state: {activeTab: "transaction-details", subActiveTab: ""}})}
                        >
                            <TransactionDetailsIcon width={18} height={18}/>
                            {hover && <p className="text-[0.9rem] font-medium ml-3">Transaction Details</p>}
                        </div>

                        <div className="h-[1px] bg-[#E1E1E1] w-full my-4"/>
                        {/* Management section */}
                        {hover && <h3 className="text-[#4D4D4D] text-[0.9rem] mb-4">Management</h3>}
                        <div className={`cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] ${hover ? "mb-3 w-full" : "mb-4"}
                            ${active==="settings" ? "bg-[#39B54A] text-[#FFFDFD] p-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                            onClick={()=>setOpenSettings(prev => !prev)}
                        >
                            <div className={`flex items-center ${openSettings ? "mb-2" : "mb-0"}`}>
                                <SettingsIcon width={17} height={17}/>
                                {hover && <div className="flex items-center justify-between w-full">
                                    <p className="text-[0.9rem] font-medium ml-3">Settings</p>
                                    <ChevronDownIcon className={`mr-2 ${openSettings && "rotate-180"} transition-all duration-300`}/>
                                </div>}
                            </div>
                            {openSettings && <>
                                <p className={`text-[0.8rem] font-medium ml-3 mb-1 hover:[text-shadow:0_4px_4px_#00000020] ${subActiveTab==="hospital-details" && "[text-shadow:0_4px_4px_#00000020]"}`}
                                    onClick={()=>navigate("/hospital-details", {state: {activeTab: "settings", subActiveTab: "hospital-details"}})}
                                >
                                    Hospital Details
                                </p>
                                <p className={`text-[0.8rem] font-medium ml-3 hover:[text-shadow:0_4px_4px_#00000020] ${subActiveTab==="reset-password" && "[text-shadow:0_4px_4px_#00000020]"}`}
                                    onClick={()=>navigate("/reset-password", {state: {activeTab: "settings", subActiveTab: "reset-password"}})}
                                >
                                    Reset Password
                                </p>
                            </>}
                        </div>
                        <div className={`flex items-center cursor-pointer mb-4 hover:bg-[#E0063A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] ${hover ? "w-full" : ""}
                            ${active==="logout" ? "bg-[#E0063A] text-[#FFFDFD] p-2 rounded-[0.25rem]" : "text-[#E0063A] px-0 py-0"} transition-all duration-150`}
                            onClick={()=>{handleLogout()}}
                        >
                            <LogoutIcon width={18} height={20}/>
                            {hover && <p className="text-[0.9rem] font-medium ml-3">Logout</p>}
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

export default SideBar