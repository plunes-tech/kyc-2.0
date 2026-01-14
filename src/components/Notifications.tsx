import { ActionIcon, CloseIcon, Notification } from "@mantine/core";
import React, { useEffect, useState } from "react";

type NotificationProps = {
    title: string | React.ReactNode,
    type?: "error" | "success" | "warn" | "info",
    message?: string | React.ReactNode,
    close?: number,
}

const Notifications:React.FC<NotificationProps> = ({title, type, message, close = 3000}) => {

    const [showNotification, setShowNotification] = useState(true)

    useEffect(() => {
        const closeNotification = setTimeout(() => {
            setShowNotification(false)
        }, close)

        return () => clearTimeout(closeNotification)
    }, [])

    return (
        <>
        {showNotification && <div className="fixed top-1 right-1 z-1000000">
            <Notification w={250} withBorder withCloseButton={false} color={type==="warn" ? "#FFAA00" : type==="info" ? "#0095FF" : type==="error" ? "#EE443F" : type==="success" ? "#43B75D" : "blue"}
            title={title} classNames={{
                body: "!mr-0"
            }}>
                <ActionIcon size={"sm"} onClick={()=>setShowNotification(false)} classNames={{
                    root: "!bg-transparent !absolute top-1 right-1"
                }}>
                    <CloseIcon className="text-[#000000]" width={30} height={30}/>
                </ActionIcon>
                <div className="text-[0.7rem]">
                    {message}
                </div>
            </Notification>
        </div>}
        </>
    )
}

export default Notifications