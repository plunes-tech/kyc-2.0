import React, { useEffect, useRef, useState } from "react";
import { ExtendedJitsiMeetExternalApi } from "../utils/types";
import { useNavigate } from "react-router-dom";
import { getIpLocation, getMobileOperatingSystem, getUrlParams } from "../utils/utilits";
import api from "../utils/axios";
import { notifications } from "@mantine/notifications";
import GlobalLoader from "../components/GlobalLoader";
import { ActionIcon, Button, Checkbox, CheckboxProps, NumberInput, TextInput } from "@mantine/core";
import { CheckIcon, PhoneIcon, RecordingIcon, SyncIcon } from "../assets/icons";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Config } from "../utils/config";
import { IJitsiMeetExternalApi } from "@jitsi/react-sdk/lib/types";

const CheckboxIcon: CheckboxProps['icon'] = ({ className }) => <CheckIcon width={20} height={20} className={className} />;

const HospitalKyc: React.FC = () => {

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
    const [facingMode, setFacingMode] = useState<"back" | "front">('back')
    const [cordinates, setCordinates] = useState({
        latitude: 0,
        longitude: 0,
    })
    const [postData, setPostData] = useState({
        name: "",
        mobile: "",
        roomId: "",
        meetingToken: "",
    })

    useEffect(() => {
        const id = getUrlParams('roomId')
        if (id) {
            setRoomId(id)
            setPostData({ ...postData, roomId: id, meetingToken: id })
            fetchUserLocation()
        }
    }, [])

    useEffect(() => {
        if (roomId) {
            (async () => {
                setLoading(true)
                try {
                    const result = await api.get(`/api/kyc/get-meeting-data`, {
                        params: {
                            token: roomId,
                            type: "HOSPITAL"
                        }
                    })
                    if (result.data?.success) {
                        setPostData({
                            ...postData,
                            name: result.data?.data?.data?.name,
                            mobile: result.data?.data?.data?.mobileNumber,
                        })
                    }
                } catch (error) {
                    console.log("error >>>> ", error);
                } finally {
                    setLoading(false)
                }
            })()
        }
    }, [roomId])

    const fetchUserLocation = async () => {
        try {
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
        if (!postData.roomId) {
            return notifications.show({
                title: "Error",
                color: "red",
                message: "Please enter room ID"
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
                    token: postData.roomId,
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

    const switchToFrontCamera = async () => {
        if (!apiRef.current) {
            console.log("Already toggling or camera not ready");
            return
        }
        setLoading(true)
        try {
            if (getMobileOperatingSystem() === "iOS") {
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
                tempStream.getTracks().forEach(track => track.stop())
            }
            const frontVideoDevices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === "videoinput")
            const frontCamera = frontVideoDevices.find(device =>
                device.label.toLowerCase().includes('front') ||
                device.label.toLowerCase().includes('user') ||
                device.label.toLowerCase().includes('selfie') ||
                device.label.toLowerCase().includes('facetime'))

            if (!frontCamera) {
                console.log("No front camera found");
                notifications.show({
                    title: "Error",
                    color: "red",
                    message: "No front camera found"
                })
                return
            }

            await apiRef?.current?.setVideoInputDevice(frontCamera.label, frontCamera.deviceId)
            setFacingMode('back')
        } catch (error) {
            console.warn(error);
            notifications.show({
                title: "Error",
                color: "red",
                message: "Error switching camera"
            })
        } finally {
            setLoading(false)
        }
    }

    const switchToBackCamera = async () => {
        if (!apiRef.current) {
            console.log("Already toggling or camera not ready");
            return
        }
        setLoading(true)
        try {
            if (getMobileOperatingSystem() === "iOS") {
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
                tempStream.getTracks().forEach(track => track.stop())
            }
            const backVideoDevices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === "videoinput")
            const backCamera = backVideoDevices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('environment'))

            if (!backCamera) {
                console.log("No back camera found");
                notifications.show({
                    title: "Error",
                    color: "red",
                    message: "No back camera found"
                })
                return
                return
            }

            await apiRef?.current?.setVideoInputDevice(backCamera.label, backCamera.deviceId)
            setFacingMode('front')
        } catch (error) {
            console.warn(error);
            notifications.show({
                title: "Error",
                color: "red",
                message: "Error switching camera"
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
                        <TextInput label="Enter hospital name" withAsterisk mb={20} radius={4}
                            placeholder="Enter name" value={postData.name}
                            onChange={e => setPostData({ ...postData, name: e.target.value })}
                            classNames={{
                                label: "!text-[0.8rem] !text-[#222222] !font-semibold !mb-[0.25rem]",
                                input: "!border-1 !border-[#4CDA73]",
                            }}
                        />
                        <NumberInput label="Enter registered mobile number of hospital" withAsterisk mb={20} radius={4}
                            hideControls allowNegative={false} maxLength={10}
                            placeholder="Enter mobile number" value={Number(postData.mobile) || undefined}
                            onChange={e => setPostData({ ...postData, mobile: e.toString() ?? "" })}
                            classNames={{
                                label: "!text-[0.8rem] !text-[#222222] !font-semibold !mb-[0.25rem]",
                                input: "!border-1 !border-[#4CDA73]",
                            }}
                        />
                        <TextInput label="Enter room ID" withAsterisk mb={20} radius={4}
                            placeholder="Enter room ID" value={postData.roomId}
                            onChange={e => setPostData({ ...postData, roomId: e.target.value })}
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
                                <div className="bg-[#000000] h-[93vh] w-full" />
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
                                        displayName: postData.name || "You",
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
                                            if (!event.enabled) {
                                                console.warn("executing commnad");
                                                extendApi.executeCommand('setTileView', { enabled: true })
                                            }
                                        })
                                    }}
                                    getIFrameRef={(iframeRef) => { iframeRef.style.height = 'calc(100vh - (1.5rem + 37px))'; }}
                                />
                            )}
                        </div>
                        {endVisible && <div className="absolute bottom-[1rem] left-0 right-0 z-100 flex items-center gap-[1.25rem] w-fit mx-auto">
                            <ActionIcon size="md" bg={"#EAEAEA"} radius={1000}
                                onClick={() =>{
                                    if(facingMode==="back") {
                                        switchToFrontCamera()
                                    } else {
                                        switchToBackCamera()
                                    }
                                }}
                                className="!border-1 !border-[#484848] !text-[#484848]"
                            >
                                <SyncIcon className={`${facingMode==="back" ? "-scale-x-100" : ""}`} />
                            </ActionIcon>
                            <ActionIcon size="md" bg={"#FE2222"} radius={1000}
                                onClick={() =>leaveCall()}
                            >
                                <PhoneIcon/>
                            </ActionIcon>
                        </div>}
                    </div>
                </div>
            )}
        </>
    )
}

export default HospitalKyc