import React, { useEffect } from "react";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { HomeIcon } from "../assets/icons";

const NotFound:React.FC = () => {
    
    const navigate = useNavigate()
    
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/dashboard")
        }, 3000)

        return () => {
            clearTimeout(timer)
        }
    }, [])

    return (
        <main className="flex items-center justify-center flex-col py-[2rem] h-[100vh]">
            <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/404_image.png" alt="" className="max-h-[60vh] w-auto" />
            <h3 className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] my-8 font-semibold text-center">Page Not Found</h3>
            <div className="flex items-center gap-4 w-full">
                <div className="h-0.5 bg-[#0F3D46] w-full"/>
                <Button leftSection={<HomeIcon className="text-[#FFFDFA]" width={18} height={18} />}
                    classNames={{
                        root: "!bg-[#0F3D46] !w-[20rem] !h-[2.5rem] !rounded-[0.5rem]",
                        label: "!text-[1rem]"
                    }}
                    onClick={()=>navigate("/dashboard")}
                >
                    Home
                </Button>
                <div className="h-0.5 bg-[#0F3D46] w-full"/>
            </div>
        </main>
    )
}

export default NotFound