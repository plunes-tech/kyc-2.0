import React, { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {

    const navigate = useNavigate()
    const [appLink, setAppLink] = useState<string>("https://play.google.com/store/apps/details?id=com.plunes&amp;hl=en_IN/")

    useEffect(() => {
        if(getMobileOperatingSystem() === 'iOS') {
            setAppLink('https://apps.apple.com/us/app/plunes/id1463747553/')
        }
    }, [])

    const getMobileOperatingSystem = () => {
        try {
            var userAgent = navigator.userAgent || navigator.vendor;

            if (/windows phone/i.test(userAgent)) {
                return "Windows Phone";
            }
        
            if (/android/i.test(userAgent)) {
                return "Android";
            }
        
            if (/iPad|iPhone|iPod/.test(userAgent)) {
                return "iOS";
            }
        
            return "unknown";
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    const redirectToAppLink = () => {
        window.location.href = appLink
    }

    return (
        <main>
            <div className="md:mt-6 md:flex md:flex-row-reverse md:items-start md:justify-around">
                <div className="text-center md:flex-2/5">
                    <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/cashless-hero-image.png" alt="" className="w-[95vw] text-center mb-4 mx-auto sm:w-[75vw] md:w-[60vw] sm:mb-8 xl:w-[35vw]"/>
                    <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/download-app-image.png" alt="" className="cursor-pointer w-[45vw] text-center mx-[auto] sm:w-[30vw] md:w-[12rem] xl:w-[16rem]" onClick={()=>redirectToAppLink()}/>
                </div>
                <div className="md:flex-3/5">
                    <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/plunes-logo.png" alt="logo" 
                        className="h-[2rem] sm:h-[2.75rem] xl:h-[4rem] w-auto sm:mx-4 md:mx-8 xl:mx-[8rem] xl:my-[3rem] md:mt-3 mb-8 sm:mb-14 md:mb-20 cursor-pointer" onClick={() => navigate("/")}
                    />
                    <h1 className="font-bold text-[1.75rem] xl:text-[2.5rem] pl-2 mb-4 text-black sm:px-4 xl:px-[8rem] xl:mb-10">Join Plunes Network</h1>
                    <h3 className="font-medium text-[0.7rem] text-[#545353] px-2 mb-5 sm:text-[0.8rem] sm:w-[90%] sm:px-4 md:px-[] xl:px-[8rem] xl:text-[1.25rem] xl:mb-10">We enable cashless inpatient services in <strong>12,000+</strong> network hospitals, across <strong>1100</strong> cities, in India.</h3>
                    <p className="bg-gradient-to-r from-[#d9f6da] to-[#ffffff] p-2 mb-7 text-[0.7rem] sm:p-4 sm:text-[0.8rem] xl:px-[8rem] xl:py-[4rem] xl:text-[1rem] xl:w-[90%] xl:pr-0">
                        <strong>'AWC PLATFORM'</strong> is a cloud platform powered by robust technology and can help your hospital to expand reach and attract more patients, 
                        especially those who are looking for a seamless and convenient health care experience. The hospital can directly raise cash/ cashless 
                        requests for any insurer and provide cashless to the patient as per the policy coverage
                    </p>
                    <Button variant="filled" color="#3248F5" className="!w-[calc(100vw-1rem)] mx-2 !text-lg mb-6 !h-10 !rounded-[0.5rem] sm:!w-[calc(100vw-2rem)] sm:mx-4 sm:mb-10 md:!w-[12rem] xl:!w-[17rem] xl:!h-[3.5rem] xl:!rounded-[1.2rem] xl:!text-[1.5rem] xl:mx-[8rem] md:mt-[3rem]" onClick={()=>navigate("/login")}>Login</Button>
                </div>
            </div>
            <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/dot-grid.png" className="absolute z-[-1] top-4 left-4 w-20 sm:w-24 sm:top-18 sm:left-6 xl:w-40 xl:top-40 xl:left-10" alt="grid"/>
            <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/dot-grid.png" className="absolute z-[-1] bottom-4 right-4 w-20 sm:w-24 sm:bottom-6 sm:right-6 xl:w-40" alt="grid"/>
        </main>
    )
}

export default Landing