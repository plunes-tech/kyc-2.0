import React, { useEffect, useRef, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk"
import { ExtendedJitsiMeetExternalApi } from "../utils/types";
import { getUrlParams } from "../utils/utilits";
import { notifications } from "@mantine/notifications";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "../components/GlobalLoader";
import { ActionIcon, Button, Checkbox, CheckboxProps, NumberInput, TextInput } from "@mantine/core";
import { CheckIcon, PhoneIcon, RecordingIcon } from "../assets/icons";
import { Config } from "../utils/config";
import { IJitsiMeetExternalApi } from "@jitsi/react-sdk/lib/types";

const CheckboxIcon: CheckboxProps['icon'] = ({ className }) => <CheckIcon width={20} height={20} className={className} />;

const PatientKyc: React.FC = () => {

    const navigate = useNavigate()
    const apiRef = useRef<ExtendedJitsiMeetExternalApi>(null)

    const [roomId, setRoomId] = useState('')
    const [consent, setConsent] = useState(false)
    const [endCall, setEndCall] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [detailsPage, setDetailsPage] = useState(true)
    const [loading, setLoading] = useState(false)
    const [endVisible, setEndvisible] = useState(false)
    const [locationDenied, setLocationDenied] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [postData, setPostData] = useState({
        name: "",
        mobile: "",
        plNumber: "",
        meetingToken: "",
    })
    const [cordinates, setCordinates] = useState({
        latitude: 0,
        longitude: 0,
    })

    useEffect(() => {
        const id = getUrlParams('plNumber')
        if (id) {
            setRoomId(id)
            setLoading(false)
            setPostData({ ...postData, plNumber: id, meetingToken: id })
            fetchUserLocation()
        }
    }, [])

    const getIpLocation = async () => {
        try {
            const response = await api.get("https://ipapi.co/json/");
            return { latitude: response.data?.latitude, longitude: response.data?.longitude };
        } catch (error) {
            console.error("IP location fetch failed:", error);
            return { latitude: 0, longitude: 0 }; // fallback if API fails
        }
    };

    const fetchUserLocation = async () => {
        try {
            console.log("calling function >>>>");
            console.log(navigator.geolocation);
            if (!navigator.geolocation) {
                notifications.show({
                    title: "Error",
                    color: "red",
                    message: "Location is not supported on this device. Please use another device"
                })
                throw new Error("Geolocation is not available on this device.");
            }

            setLocationLoading(true); // Changed from setLoading to setLocationLoading

            await navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    console.log("inside success fuction");
                    const { latitude, longitude } = pos.coords;
                    console.log({ latitude, longitude });
                    setCordinates({
                        latitude: latitude,
                        longitude: longitude,
                    });
                    setLocationLoading(false);
                },
                async (err) => {
                    console.log("Error getting position, falling back to IP location:", err);
                    try {
                        const ipLocation = await getIpLocation();
                        setCordinates({
                            latitude: ipLocation.latitude,
                            longitude: ipLocation.longitude,
                        });
                    } catch (error) {
                        console.log("Error fetching IP location:", error);
                        notifications.show({
                            title: "Error",
                            color: "red",
                            message: "Unable to fetch location"
                        });
                    } finally {
                        setLocationLoading(false);
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );

            setLocationDenied(false);
        } catch (error: any) {
            console.log("inside catch block");
            console.log(error);
            setLocationLoading(false); // Also set loading to false on error
            if (error.code === error.PERMISSION_DENIED) {
                console.log("LOCATION PERMISSION DENIED");
                setLocationDenied(true);
            } else {
                console.log("Error fetching location:", error);
            }
        }
    };

    const handleSubmit = async () => {
        if (!consent) {
            return notifications.show({
                title: "Error",
                color: "red",
                message: "Please check the consent check box to proceed"
            })
        }
        if (!postData.mobile) {
            return notifications.show({
                title: "Error",
                color: "red",
                message: "Please enter mobile number"
            })
        }
        if (postData.mobile) {
            if (postData.mobile.length !== 10) {
                return notifications.show({
                    title: "Error",
                    color: "red",
                    message: "Please enter valid 10-digit mobile number"
                })
            }
        }
        if (!postData.name) {
            return notifications.show({
                title: "Error",
                color: "red",
                message: "Please enter name"
            })
        }
        if (!postData.plNumber) {
            return notifications.show({
                title: "Error",
                color: "red",
                message: "Please enter PL number"
            })
        }
        let { longitude, latitude } = { ...cordinates }
        if (latitude == 0 && longitude == 0) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords
                    latitude = lat
                    longitude = lng
                    if (lat === 0 && lng === 0) {
                        const position = await getIpLocation();
                        latitude = position.latitude
                        longitude = position.longitude
                    }
                },
                async (err) => {
                    console.log("Error getting position, falling back to IP location:", err);
                    const position = await getIpLocation();
                    latitude = position.latitude
                    longitude = position.longitude
                }
            )
        }
        setLoading(true)
        try {
            const result = await api.post("/api/kyc/verify-kyc-token", {}, {
                params: {
                    token: postData.plNumber,
                    lat: latitude,
                    long: longitude
                }
            })
            if (!result.data?.success) {
                return notifications.show({
                    title: "Error",
                    color: "red",
                    message: "An error occured, please try again later"
                })
            }
            setDetailsPage(false)
        } catch (error: any) {
            const errMsg = error?.response?.data?.message
            return notifications.show({
                title: "Error",
                color: "red",
                message: errMsg || "An error occured, please try again later"
            })
        } finally {
            setLoading(false)
        }
    }

    const leaveCall = async () => {
        try {
            if (!apiRef.current) {
                return
            }
            await apiRef.current.executeCommand('hangup')
            setEndCall(true)
            navigate('/thank-you')
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    return (
        <>
            {loading && <GlobalLoader />}
            {locationLoading && <GlobalLoader message="Fetching location. Please wait..." />}
            {locationDenied && (
                <div className="fixed z-10000 top-0 left-0 bg-[#00000020] h-[100vh] w-[100vw] grid place-content-center">
                    <div className="bg-[#FFFFFF] flex flex-col items-center rounded-[10px] px-[2rem] py-[4rem]">
                        <img src="https://plunes-data.s3.ap-south-1.amazonaws.com/hourglass_web.png" alt="session-expired" className="h-[150px] mb-[2rem]" />
                        <h3 className="text-[1.5rem] text-[#215675] font-semibold text-center mb-[0.5rem]">Permission Denied!</h3>
                        <p className="text-[0.9rem] text-[#999999] mb-[2rem] w-[80%] text-center leading-[1.45em]">Location permission has been blocked. Please enable it manually:</p>
                        <ol className="text-[0.9rem] text-[#999999] mb-[2rem] w-[80%] text-center leading-[1.45em]">
                            <li>Please turn on your device's location</li>
                            <li>1. Click the lock icon in your browser's address bar</li>
                            <li>2. Set Location to "Allow"</li>
                            <li>3. Refresh the page</li>
                        </ol>
                    </div>
                </div>
            )}
            {detailsPage ? (
                <div className='flex items-center justify-center bg-[#1C6EA9] min-h-[100vh] py-4'>
                    <div className="bg-[#FFFFFF] rounded-[0.75rem] p-8 md:w-1/2">
                        <h3 className="text-[1.25rem] text-[#111111] font-semibold text-center mb-[1.5rem]">Enter your details</h3>
                        <TextInput label="Enter your name" withAsterisk mb={20} radius={4}
                            placeholder="Enter name" value={postData.name}
                            onChange={e => setPostData({ ...postData, name: e.target.value })}
                            classNames={{
                                label: "!text-[0.8rem] !text-[#222222] !font-semibold !mb-[0.25rem]",
                                input: "!border-1 !border-[#4CDA73]",
                            }}
                        />
                        <NumberInput label="Enter your registered mobile number" withAsterisk mb={20} radius={4}
                            hideControls allowNegative={false} maxLength={10}
                            placeholder="Enter mobile number" value={Number(postData.mobile) || undefined}
                            onChange={e => setPostData({ ...postData, mobile: e.toString() ?? "" })}
                            classNames={{
                                label: "!text-[0.8rem] !text-[#222222] !font-semibold !mb-[0.25rem]",
                                input: "!border-1 !border-[#4CDA73]",
                            }}
                        />
                        <TextInput label="Enter your room ID" withAsterisk mb={20} radius={4}
                            placeholder="Enter room ID" value={postData.name}
                            onChange={e => setPostData({ ...postData, name: e.target.value })}
                            classNames={{
                                label: "!text-[0.8rem] !text-[#222222] !font-semibold !mb-[0.25rem]",
                                input: "!border-1 !border-[#4CDA73]",
                            }}
                        />
                        <div className="mt-8">
                            <ol className="text-[0.7rem] text-[#444444] mb-2">
                                <li className="mb-0.5"><strong>1. Consent to Video Verification: </strong>By proceeding with the Video KYC process, you consent to the recording and verification of your identity through video.</li>
                                <li className="mb-0.5"><strong>2. Data Privacy: </strong>Your video and personal information will be used solely for the purpose of identity verification and will be handled in accordance with our privacy policy.</li>
                                <li className="mb-0.5"><strong>3. Accuracy of Information: </strong>You agree to provide accurate and truthful information during the video verification process.</li>
                                <li className="mb-0.5"><strong>4. Technical Requirements: </strong>Ensure you have a stable internet connection and a compatible device for the video call.</li>
                                <li className="mb-0.5"><strong>5. Confidentiality: </strong>All data collected during the Video KYC process will be kept confidential and secure.</li>
                                <li className="mb-0.5"><strong>6. Compliance: </strong>By participating, you acknowledge and agree to comply with all relevant legal and regulatory requirements.</li>
                            </ol>
                            <div className="consent-checkbox">
                                <Checkbox size="xxs" label="Please agree with the terms before proceeding." radius={4}
                                    icon={CheckboxIcon} checked={consent}
                                    onChange={e => setConsent(e.currentTarget.checked)}
                                    classNames={{
                                        label: `text-[0.8rem] font-medium`,
                                        input: "!cursor-pointer !rounded-[0.15rem] !h-3 !w-3 !mt-0.5",
                                        icon: "!flex !items-start !justify-center !w-auto !-mt-0.5",
                                        root: "mb-1",
                                    }}
                                />
                            </div>
                        </div>
                        <Button fullWidth mt={48} bg={"#4CDA73"} radius={4}
                            className="!font-medium"
                            onClick={() => handleSubmit()}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-[#5B5B5B] p-4 pt-2 min-h-[100vh]">
                    <div className="flex items-center justify-between mb-2 text-[#FFFFFF]">
                        <p className="text-[1rem] font-medium"><span className="font-semibold">KYC</span> Verification</p>
                        {isRecording && <div className="bg-[#FE2222] px-[0.5rem] rounded-[0.25rem] flex items-center gap-1">
                            <RecordingIcon width={12} height={12} />
                            <p className="text-[0.9rem]">Recording</p>
                        </div>}
                    </div>
                    <div className="relative">
                        <div className="w-full rounded-[0.25rem]" id='video-meet-container'>
                            {endCall ? (
                                <div className="bg-[#000000] min-h-[93vh] w-full" />
                            ) : (
                                <JitsiMeeting
                                    domain={Config.meetRoom} roomName={roomId}
                                    configOverwrite={{
                                        resolution: 360,
                                        constraints: {
                                            video: {
                                                height: {
                                                    ideal: 360,
                                                    max: 360,
                                                    min: 360,
                                                }
                                            }
                                        },
                                        toolbar: [],
                                        toolbarButtons: [],
                                        prejoinPageEnabled: false,
                                        startWithAudioMuted: false,
                                        startWithVideoMuted: false,
                                        disableDeepLinking: true,
                                        defaultLogoUrl: '',
                                        customizationReady: true,
                                        hiddenPremeetingButtons: ['toggle-camera', 'toggle-mic'],
                                        enableClosePage: true,
                                        disableSelfViewSettings: true,
                                        disableSelfView: false,
                                        disableTileView: false,
                                        disableProfile: true,
                                        disableTileEnlargement: false,
                                        disableModeratorIndicator: true,
                                        disableNoisyMicDetection: true,
                                        disableInviteFunctions: true,
                                        disbaleNotifications: true,
                                        disablePerformanceSettings: true,
                                        disableMoreSettings: true,
                                        startInTileView: true,
                                        hideConferenceSubject: true,
                                    }}
                                    interfaceConfigOverwrite={{
                                        TOOLBAR_BUTTONS: [],
                                        SETTINGS_SECTIONS: ['devices'],
                                        SHOW_JITSI_WATERMARK: false,
                                        SHOW_WATERMARK_FOR_GUESTS: false,
                                        SHOW_BRAND_WATERMARK: false,
                                        BRAND_WATERMARK_LINK: '',
                                        DEFAULT_LOGO_URL: '',
                                        DEFAULT_WELCOME_PAGE_LOGO_URL: '',
                                        DISABLE_SELF_VIEW_SETTINGS: true,
                                        DISABLE_SELF_VIEW: false,
                                        DISABLE_TILE_VIEW: false,
                                        DISABLE_PROFILE: true,
                                        DISABLE_TILE_ENLARGEMENT: false,
                                        DISABLE_FLIP_SETTINGS: true,
                                        HIDE_INVITE_MORE_HEADER: true,
                                        JITSI_WATERMARK_LINK: '',
                                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                                        DISABLE_PERFORMANCE_SETTINGS: true,
                                        DISABLE_MORE_SETTINGS: true,
                                        SHOW_SELF_VIEW_WITH_VIDEO_OFF: true,
                                        TILE_VIEW_ENABLED: true,
                                        SHOW_ROOM_NAME: false,
                                    }}
                                    userInfo={{
                                        displayName: postData.name,
                                        email: '',
                                    }}
                                    onApiReady={(api: IJitsiMeetExternalApi) => {
                                        const extendApi = api as ExtendedJitsiMeetExternalApi
                                        apiRef.current = extendApi
                                        setEndvisible(true)
                                        extendApi.addListener('videoConferenceJoined', async () => {
                                            if (extendApi.getNumberOfParticipants() >= 2) {
                                                setIsRecording(true)
                                            } else {
                                                setIsRecording(false)
                                            }
                                        })
                                        extendApi.addListener('participantJoined', () => {
                                            if (extendApi.getNumberOfParticipants() >= 2) {
                                                setIsRecording(true)
                                            } else {
                                                setIsRecording(false)
                                            }
                                        })
                                        extendApi.addListener('participantLeft', () => {
                                            notifications.show({
                                                color: "blue",
                                                message: "User has left the meeting",
                                            })
                                            setIsRecording(false)
                                        })
                                        extendApi.executeCommand('setVideoQuality', 360)
                                        extendApi.addListener('tileViewChanged', event => {
                                            if(!event.enabled) {
                                                console.warn("executing commnad");
                                                extendApi.executeCommand('setTileView', {enabled: true})
                                            }
                                        })
                                    }}
                                    getIFrameRef = { (iframeRef) => { iframeRef.style.height = 'calc(100vh - (1.5rem + 37px))';} }
                                />
                            )}
                        </div>
                        <div className="absolute bottom-[1rem] left-0 right-0 z-100 flex items-center ga-[1.25rem] w-fit mx-auto">
                            {endVisible && <ActionIcon size="md" bg={"#FE2222"} radius={1000}
                                onClick={() =>leaveCall()}
                            >
                                <PhoneIcon/>
                            </ActionIcon>}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default PatientKyc