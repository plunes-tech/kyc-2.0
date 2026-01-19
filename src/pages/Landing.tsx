import React, { useEffect, useState } from "react";
import { getMobileOperatingSystem } from "../utils/utilits";

const Landing: React.FC = () => {

    const [appLink, setAppLink] = useState('https://play.google.com/store/apps/details?id=com.plunes&amp;hl=en_IN/')

    useEffect(() => {
        if(getMobileOperatingSystem() === "iOS") {
            setAppLink('https://apps.apple.com/us/app/plunes/id1463747553/')
        }
    }, [])

    return (
        <main className={`bg-[url("https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-background.webp")]
            bg-no-repeat w-[100vw] h-[100vh] flex items-center justify-center flex-col absolute top-0 left-0 z-1000`}
        >
            <div className="container">
                <img className="w-full m-auto" 
                    src={window.innerWidth > 567 ? 
                    "https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-web.png" : 
                    "https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-mob.png"} 
                />
                <h1 className="mt-8 text-center text-[#022E85] font-extrabold text-[3.5rem]">Thank You For Giving Your Details.</h1>
                <h2 className="text-[#111111] text-center mt-4 text-[2.25rem]">Our Team of Experts will Call You Back Soon!</h2>
                <div className="m-auto mt-8 items-center justify-center w-[60%] row">
                    <div className="col-lg-auto">
                        <img className="w-full" src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-scan-code.webp"/>
                    </div>
                    <div className="col-lg-auto download-btn">
                        <a href={appLink} target="_blank" title="app store">Download The App <i className="fab fa-apple" />|<i className="fab fa-android"/></a>
                    </div>
                </div>
                <div className="download-reasons">
                    <h3>Download Plunes App to:</h3>
                    <div className="row">
                        <div className="col-lg-3 col-12 row">
                            <div className="col-lg-4 col-auto">
                                <img src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-1.png" className="w-full" />
                            </div>
                            <div className="col-lg-8 col-6">
                                <span>Plan your Surgery</span>
                            </div>
                        </div>
                        <div className="col-lg-3 col-12 row">
                            <div className="col-lg-4 col-auto">
                                <img src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-2.png" className="w-full" />
                            </div>
                            <div className="col-lg-8 col-6">
                                <span>Stay Updated with Your Treatment Journey</span>
                            </div>
                        </div>
                        <div className="col-lg-3 col-12 row">
                            <div className="col-lg-4 col-auto">
                                <img src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-3.png" className="w-full" />
                            </div>
                            <div className="col-lg-8 col-6">
                                <span>Connect to Expert Doctors Personally</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Landing