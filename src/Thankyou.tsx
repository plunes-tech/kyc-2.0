import React, { useEffect } from "react";
import { scrollToTop } from "./utils/utilits";

const Thankyou:React.FC = () => {

    useEffect(() => {
        scrollToTop()
    }, [])

    return (
        <>
            <div className={`bg-[url("https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-background.webp")]
                w-[100vw] h-[100vh] bg-no-repeat flex flex-col items-center justify-center absolute top-0 left-0 z-1000`}
            >
                <div className="container">
                    <img className="block m-auto h-[2rem] sm:h-[3.5rem] md:h-[4.5rem]" 
                        src={
                            window.innerWidth > 567 ? "https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-web.png" 
                            : "https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-mob.png"
                        } 
                    />
                    <h1 className="text-[1.75rem] text-[#022E85] text-center font-bold mt-8">Thank you for completing your KYC!</h1>
                    <h2 className="text-[1rem] text-[#222222] text-center">Your KYC verification is now complete!</h2>
                    <p className="text-[0.8rem] text-[#7C8087] text-center w-[90%] md:w-[70%] mx-auto mt-4">
                        We appreciate you verifying your identity. Your KYC process has been successfully completed, 
                        and no further action is required at this time. If we need any additional information, 
                        we will reach out to you.
                    </p>
                </div>
            </div>
        </>
    )
}

export default Thankyou