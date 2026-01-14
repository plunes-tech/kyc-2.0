import React, { JSX, useEffect, useState } from "react";
import { Button, Drawer } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { BackIcon, CloseIcon, DashboardIcon, HamMenuIcon, LogoutIcon, PatientDetailsIcon, PhoneIcon, SettingsIcon, TransactionDetailsIcon } from "../assets/icons";

const Header:React.FC = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const [openDrawer, setOpenDrawer] = useState(false)
    const [active, setActive] = useState("dashboard")
    const [header, setHeader] = useState<React.ReactNode>(<></>)

    useEffect(() => {
        if(location.state) {
            if(location.state?.activeTab) {
                setActive(location.state?.activeTab)
            } else {
                setActive("dashboard")
            }
        } else {
            setActive("dashboard")
        }
        // header title based on path name
        // Map paths to their corresponding icons and titles
        const pathHeaderMap: Record<string, { icon: JSX.Element; title: string }> = {
            "/dashboard": { icon: <DashboardIcon width={24} height={24} />, title: "Dashboard" },
            "/patient-details": { icon: <PatientDetailsIcon width={24} height={24} />, title: "Patient Details" },
            "/transaction-details": { icon: <TransactionDetailsIcon width={24} height={24} />, title: "Transaction Details" },
            "/hospital-details": { icon: <SettingsIcon width={24} height={24} />, title: "Settings (Hospital Details)" },
            "/patient-details/booking-details": { icon: <BackIcon className="cursor-pointer" onClick={()=>navigate("/patient-details")} width={24} height={24} />, title: "Patient Details" },    
            "/reset-password": { icon: <SettingsIcon width={24} height={24} />, title: "Settings (Re-set Password)" },    
        };

        const headerContent = pathHeaderMap[location.pathname];
        if (headerContent) {
            setHeader(
            <div className="flex items-center gap-4 text-[#556171] ml-[1rem]">
                {headerContent.icon}
                <h1 className="text-[1.2rem] xl:text-[1.5rem] font-medium">{headerContent.title}</h1>
            </div>
            );
        }
    }, [location])

    const handleContactSupport = async () => {
        try {
            
        } catch (error) {
            // handle by redux
        }
    }

    const handleLogout = async () => {
        try {
            navigate("/login")
        } catch (error) {
            // handle by redux
        }
    }

    return (
        <>
            <header className="fixed z-10 top-0 right-0 bg-[#FFFFFF] border-b-1 border-b-[#DFE0E2] h-[3.5rem] w-[100vw] md:w-[calc(100vw-250px)] flex items-center justify-between">
                {/* header title for larger screens */}
                <div className="hidden md:block">
                    {header}
                </div>

                {/* header menu for smaller screens */}
                <div className="md:hidden flex items-center gap-4 ml-4">
                    <div onClick={()=>setOpenDrawer(true)} className="cursor-pointer text-[#556171]">
                        <HamMenuIcon />
                    </div>
                    <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/plunes-full-logo.png" alt="" className="h-[1.5rem] cursor-pointer" 
                        onClick={()=>navigate("/dashboard", {state: {activeTab: "dashboard"}})}
                    />
                </div>

                {/* notification and profile icon */}
                <div className="flex items-center gap-8">
                    <Button bg={"#E53761"} size="xs" radius={6} className="!font-medium mr-4 md:mr-0" leftSection={<PhoneIcon width={14} height={14}/>} onClick={()=>handleContactSupport()}>
                        Help Desk
                    </Button>
                    <div className="hidden sm:flex items-center gap-2 md:gap-4 mr-4">
                        <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/default-user-image.png" alt="" className="h-[2rem] md:h-[2.25rem] xl:h-[auto]" />
                        <div>
                            <h2 className="text-[#556171] text-[0.75rem] md:text-[0.9rem] font-semibold mb-0">{"Hospital Name"}</h2>
                            <h3 className="text-[#556171] text-[0.6rem] md:text-[0.75rem]">{"Test Name"}</h3>
                        </div>
                    </div>
                </div>
            </header>
            <Drawer
                opened={openDrawer}
                onClose={()=>setOpenDrawer(false)}
                size={300} classNames={{
                    header:"!hidden",
                }}
            >
                {/* Menu section */}
                <div className="flex items-center justify-between text-[#4D4D4D]">
                    <h3 className="text-[1rem] my-4">MENU</h3>
                    <CloseIcon className="cursor-pointer" onClick={()=>setOpenDrawer(false)} />
                </div>
                <div className={`flex items-center cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] mb-3 w-full
                    ${active==="dashboard" ? "bg-[#39B54A] text-[#FFFDFD] px-3 py-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                    onClick={()=>navigate("/dashboard", {state: {activeTab: "dashboard"}})}
                >
                    <DashboardIcon/>
                    {<p className="text-[1rem] font-medium ml-3">Dashboard</p>}
                </div>
                <div className={`flex items-center cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] mb-3 w-full
                    ${active==="intimations" ? "bg-[#39B54A] text-[#FFFDFD] px-3 py-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                    onClick={()=>navigate("/patient-details", {state: {activeTab: "patient-details"}})}
                >
                    <PatientDetailsIcon/>
                    {<p className="text-[1rem] font-medium ml-3">Patient Details</p>}
                </div>
                <div className={`flex items-center cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] mb-3 w-full
                    ${active==="transaction-details" ? "bg-[#39B54A] text-[#FFFDFD] px-3 py-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                    onClick={()=>navigate("/transaction-details", {state: {activeTab: "transaction-details"}})}
                >
                    <TransactionDetailsIcon width={21} height={21} />
                    {<p className="text-[1rem] font-medium ml-3">Transaction Details</p>}
                </div>

                <div className="h-[1px] bg-[#E1E1E1] w-full my-4"/>
                {/* Management section */}
                {<h3 className="text-[#4D4D4D] text-[1rem] mb-4">Management</h3>}
                <div className={`flex items-center cursor-pointer hover:bg-[#39B54A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] mb-3 w-full
                    ${active==="nonnetwork" ? "bg-[#39B54A] text-[#FFFDFD] px-3 py-2 rounded-[0.25rem]" : "text-[#4D4D4D] px-0 py-0"} transition-all duration-150`}
                >
                    <SettingsIcon/>
                    {<p className="text-[1rem] font-medium ml-3">Settings</p>}
                </div>
                <div className={`flex items-center cursor-pointer hover:bg-[#E0063A] hover:text-[#FFFDFD] hover:px-3 hover:py-2 hover:rounded-[0.25rem] w-full
                    ${active==="logout" ? "bg-[#E0063A] text-[#FFFDFD] px-3 py-2 rounded-[0.25rem]" : "text-[#E0063A] px-0 py-0"} transition-all duration-150`}
                    onClick={()=>{handleLogout()}}
                >
                    <LogoutIcon width={20} height={24}/>
                    {<p className="text-[1rem] font-medium ml-3">Logout</p>}
                </div>
            </Drawer>
        </>
    )
}

export default Header