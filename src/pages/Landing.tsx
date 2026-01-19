import React, { useEffect, useState } from "react";
import { getMobileOperatingSystem } from "../utils/utilits";
import { Grid } from "@mantine/core";
import { AndroidIcon, AppleIcon } from "../assets/icons";

const Landing: React.FC = () => {

    const [appLink, setAppLink] = useState('https://play.google.com/store/apps/details?id=com.plunes&amp;hl=en_IN/')

    useEffect(() => {
        if (getMobileOperatingSystem() === "iOS") {
            setAppLink('https://apps.apple.com/us/app/plunes/id1463747553/')
        }
    }, [])

    return (
        <main className={`bg-[url("https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-background.webp")]
            w-[100vw] min-h-[100vh] bg-[length:100%_100%] bg-no-repeat flex flex-col items-center justify-center absolute top-0 left-0 z-1000`}
        >
            <div className="container">
                <img className="block m-auto h-[2rem] sm:h-[3.5rem] md:h-[4.5rem]"
                    src={
                        window.innerWidth > 567 ? "https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-web.png"
                            : "https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-mob.png"
                    }
                />
                <h1 className="mt-8 text-center text-[#022E85] font-extrabold text-[1.75rem]">Thank You For Choosing Plunes.</h1>
                <div className="flex flex-wrap items-center justify-center gap-[2rem] m-auto mt-8">
                    <img className="h-[8rem] w-auto" src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-scan-code.webp" />
                    <div className="flex items-center gap-1.5 text-[#FFFFFF] text-[1rem] bg-[#14B961] hover:bg-[#129F53] px-6 py-1.25 rounded-[5rem] cursor-pointer"
                        onClick={() => {
                            window.open(appLink, "_blank")
                        }}
                    >
                        Download The App 
                        <div className="flex items-center gap-1">
                            <AppleIcon width={20} height={20}/>
                            <div className="h-4 w-0.25 bg-[#FFFFFF] rounded-[10rem]"/>
                            <AndroidIcon width={20} height={20}/>
                        </div>
                    </div>
                </div>
                <div className="mt-8 mx-auto md:w-[700px]">
                    <h3 className="text-center text-[#232323] font-semibold text-[1.25rem]">Download Plunes App to:</h3>
                    <Grid grow align="start" mt={32} p={16}>
                        <Grid.Col span={{base: 12, sm: 6, md: 4, lg: 4}}>
                            <div className="flex items-center gap-1.5">
                                <img src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-1.png" 
                                    className="h-[2.5rem]"
                                />
                                <p className="text-[0.8rem] text-[#7C8087]">
                                    Plan Your Surgery
                                </p>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base: 12, sm: 6, md: 4, lg: 4}}>
                            <div className="flex items-center gap-1.5">
                                <img src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-2.png" 
                                    className="h-[2.5rem]"
                                />
                                <p className="text-[0.8rem] text-[#7C8087]">
                                    Stay Updated with Your Treatment Journey
                                </p>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base: 12, sm: 6, md: 4, lg: 4}}>
                            <div className="flex items-center gap-1.5">
                                <img src="https://service-family-images.s3.ap-south-1.amazonaws.com/website_images_new/thank-you-logo-3.png" 
                                    className="h-[2.5rem]"
                                />
                                <p className="text-[0.8rem] text-[#7C8087]">
                                    Connect to Expert Doctors Personally
                                </p>
                            </div>
                        </Grid.Col>
                    </Grid>
                </div>
            </div>
        </main>
    )
}

export default Landing