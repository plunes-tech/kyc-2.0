import React, { useEffect } from "react";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { HomeIcon } from "../assets/icons";

const NotFound: React.FC = () => {

    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/')
        }, 5000);
        return () => {
            clearTimeout(timer)
        }
    }, [])

    return (
        <main className="flex flex-col items-center gap-10 justify-center min-h-[100vh]">
            <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/404_image.png" alt="404" className="w-[90vw] sm:w-[75vw] md:w-[35vw]" />
            <h3 className="text-[1.5rem] font-semibold">Page Not Found</h3>
            <div className="flex items-center gap-2 w-[100%] mb-[5rem]">
                <div className="bg-[#00A82E] h-[2px] w-[100%]"/>
                <Button leftSection={<HomeIcon className="text-[#FFFFFF]" width={16} height={16} />}
                    classNames={{
                        root: '!bg-[#00A82E] !rounded-[0.5rem] !min-w-[9.5rem]',
                        label: "!text-[1rem]"
                    }}
                    onClick={()=>navigate('/')}
                >
                    Go Home
                </Button>
                <div className="bg-[#00A82E] h-[2px] w-[100%]"/>
            </div>
        </main>
    )
}

export default NotFound