import React, { useEffect, useState } from "react";
import { CloseIcon } from "../../assets/icons";
import { Button, PinInput, TextInput } from "@mantine/core";
import useAuth from "../../hooks/useAuth";

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s} sec`
}

const ForgotPassword:React.FC<{setOpenModal: React.Dispatch<React.SetStateAction<boolean>>}> = ({setOpenModal}) => {

    const { requestPasswordReset, resetPassword, verifyOtp, resendOtp } = useAuth();

    const [section, setSection] = useState<"email" | "otp" | "reset">('email')
    const [formData, setFormData] = useState({
        userId: "",
        mail: "",
        otp: "",
        password: "",
        confirmPassword: "",
    })
    const [timer, setTimer] = useState(90)
    const [reloadTimer, setReloadTimer] = useState(false)

    useEffect(() => {
        if (section === "otp") {
            setTimer(90)

            const countdown = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(countdown)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(countdown)
        }
    }, [section, reloadTimer])

    const handleSendOtp = async () => {
        try {
            const result = await requestPasswordReset(formData.mail)
            if(result.success) {
                setFormData({...formData, userId: result.data.userId})
                setSection("otp")
            }
        } catch (error) {
            // error already handled by redux
        }
    }

    const handleVerifyOtp = async () => {
        try {
            const result = await verifyOtp({userId: formData.userId, otp: formData.otp})
            if(result.success) {
                setSection("reset")
            }
        } catch (error) {
            // error already handled by redux
        }
    }

    const handleResendOtp = async () => {
        try {
            const result = await resendOtp(formData.userId)
            if(result.success) {
                setTimer(90)
                setReloadTimer(prev => !prev)
            }
        } catch (error) {
            // error already handled by redux
        }
    }


    const handleResetPassword = async () => {
        try {
            const result = await resetPassword(formData.userId, {password: formData.password, confirmPassword: formData.confirmPassword})
            if(result.success) {
                setOpenModal(false)
            }
        } catch (error) {
            // error already handled by redux
        }
    }

    return (
        <>
        <div className="relative px-2 py-10 md:px-4 md:py-20">
            <CloseIcon className="absolute top-2 right-2 text-[#000000] cursor-pointer" width={12} height={12} onClick={()=>setOpenModal(false)}/>
            <div className="flex items-center justify-center">
                <div className="hidden md:grid place-content-center md:flex-1/2">
                    <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/reset-password.png" alt="" className="hidden md:block w-[20rem] xl:w-[45rem]" />
                </div>
                <div className="md:flex-1/2">
                    {/* based on page render details */}
                    {section==="email" && <>
                        <div>
                            <h3 className="text-[0.8rem] md:text-[0.9rem] mb-2 font-semibold">Forgot Password?</h3>
                            <p className="text-[0.6rem] md:text-[0.7rem] mb-10 font-medium">Please enter your email address to receive a reset code</p>
                            <TextInput label="Email Address" value={formData.mail} placeholder="Enter email address"
                                onChange={e => setFormData({...formData, mail: e.target.value})} 
                                classNames={{
                                    root: "mb-1",
                                    label: "!text-[#828282] !text-[0.7rem] md:!text-[0.8rem] !font-medium mb-1.5",
                                    input: `!h-[3rem] !text-[#000000] !rounded-[0.25rem] !border-1 !border-[#E5E5E5]`,
                                }}
                            />
                            <Button fullWidth size="compact-xs"
                                classNames={{
                                    root: "!h-[2rem] !rounded-[0.25rem] !bg-[#39B54A] mt-6",
                                    label: "!text-[0.8rem]"
                                }}
                                onClick={() => handleSendOtp()}
                            >
                                Get OTP
                            </Button>
                        </div>
                    </>}
                    {section==="otp" && <>
                        <div>
                            <h3 className="text-[0.8rem] md:text-[0.9rem] mb-2 font-semibold">Verify Your Email</h3>
                            <p className="text-[0.6rem] md:text-[0.7rem] mb-10 font-medium">Please enter the 4 digit code sent to {formData.mail}</p>
                            <label className="text-[#828282] text-[0.9rem] font-medium mb-1.5">Enter Verification Code</label>
                            <PinInput length={6} placeholder="0" value={formData.otp} aria-label="Enter forgot password Otp"
                                onChange={e => setFormData({...formData, otp: e})}
                                classNames={{
                                    root: "!w-full !justify-between",
                                    pinInput: "!h-[3rem] !w-[2.25rem] sm:!w-[3.5rem]",
                                    input: `!border-1 !text-[#000000] !rounded-[0.25rem] !h-[3rem] !border-[#E5E5E5]`,
                                }}
                            />
                            <div className="flex items-center justify-between mt-1 mb-10">
                                <p className="text-[#A1A1A1] text-[0.8rem] font-medium">{formatTime(timer)}</p>
                                <Button disabled={timer > 0} onClick={()=>handleResendOtp()}
                                    classNames={{
                                        root: "!bg-transparent !h-[1rem] !p-0",
                                        label: "!text-[#A1A1A1] !text-[0.8rem] !font-medium"
                                    }}
                                    >
                                    Resend Code
                                </Button>
                            </div>
                            <Button fullWidth size="compact-xs"
                                classNames={{
                                    root: "!h-[2rem] !rounded-[0.25rem] !bg-[#39B54A] mt-6",
                                    label: "!text-[0.8rem]"
                                }}
                                onClick={() => handleVerifyOtp()}
                                >
                                Verify
                            </Button>
                        </div>
                    </>}
                    {section==="reset" && <>
                        <div>
                            <h3 className="text-[0.8rem] md:text-[0.9rem] mb-2 font-semibold">Create Password</h3>
                            <p className="text-[0.6rem] md:text-[0.7rem] mb-10 font-medium">Enter a new password to create a new password</p>
                            <TextInput label="New Password" value={formData.password} placeholder="********" type="password"
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                classNames={{
                                    root: "mb-1",
                                    label: "!text-[#828282] !text-[0.7rem] md:!text-[0.8rem] !font-medium mb-1.5",
                                    input: `!h-[3rem] !text-[#000000] !rounded-[0.25rem] !border-1 !border-[#E5E5E5]`,
                                }}
                            />
                            <TextInput label="Confirm New Password" value={formData.confirmPassword} placeholder="********" type="password"
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                                classNames={{
                                    root: "mb-1",
                                    label: "!text-[#828282] !text-[0.7rem] md:!text-[0.8rem] !font-medium mb-1.5",
                                    input: `!h-[3rem] !text-[#000000] !rounded-[0.25rem] !border-1 !border-[#E5E5E5]`,
                                }}
                            />
                            <Button fullWidth size="compact-xs"
                                classNames={{
                                    root: "!h-[2rem] !rounded-[0.25rem] !bg-[#39B54A] mt-6",
                                    label: "!text-[0.8rem]"
                                }}
                                onClick={() => handleResetPassword()}
                                >
                                Reset Password
                            </Button>
                        </div>
                    </>}
                </div>
            </div>
        </div>
        </>
    )
}

export default ForgotPassword