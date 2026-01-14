import React, { useState } from "react";
import { Button, ScrollArea, TextInput } from "@mantine/core";
import GlobalLoader from "../components/GlobalLoader";
import { LockIcon, LockSlashedIcon } from "../assets/icons";
import useAuth from "../hooks/useAuth";
import Notifications from "../components/Notifications";
import { notifications } from "@mantine/notifications";

const ResetPassword: React.FC = () => {

    const { isLoading, error, changePassword } = useAuth()

    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handleSubmit = async () => {
        try {
            const result = await changePassword(formData)
            if(result.success) {
                setFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                })
                return notifications.show({
                    color: "#28A745",
                    title: "Success",
                    message: "Password reset successfully",
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    return (
        <>
            {isLoading && <GlobalLoader/>}
            {error && error.message && error.message.toLocaleLowerCase() !== "validation error" && <Notifications type="error" title="Error" message={error.message} />}
            {error && error.message && error.message.toLocaleLowerCase() === "validation error" && Array.isArray(error.errors) && error.errors[0]?.message && <Notifications type="error" title="Error" message={error.errors[0].message} />}
            <ScrollArea h={"100vh"} w={"100vw"} scrollbarSize={6}>
                <main className="bg-[#F6F6F6] flex flex-row items-center md:ml-[50px] min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4.25rem)] min-w-[100vw] md:min-w-[calc(100vw-50px)] p-2 sm:p-4">
                    <div className="md:flex-1/2 self-center">
                        <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/reset-password.png" alt=""
                            className="object-contain hidden self-stretch my-auto mx-auto w-[75%] max-md:mt-10 max-md:max-w-full md:block mt-[3rem]"
                        />
                    </div>
                    <section className="ml-5 w-[42%] mt-0 max-md:ml-0 max-md:w-full max-md:px-[1rem] sm:mt-16 md:flex-1/2">
                        <div className="flex flex-col grow max-md:max-w-full">
                            <div className="flex flex-col self-end w-full">
                                <header className="flex flex-col items-center">
                                    <h1 className="mt-6 text-[1.5rem] font-semibold leading-none text-neutral-950">Re-Set New Password</h1>
                                    <h3 className="mt-3 text-[1rem] font-semibold text-neutral-950 mb-12">Create Your New Password</h3>
                                </header>
                                <div className="sm:p-[3rem] sm:pt-0">
                                    <TextInput size="xs" placeholder="Enter old password" radius={6} type="password" label="Old Password" withAsterisk
                                        value={formData.oldPassword} onChange={(e)=>setFormData({...formData, oldPassword: e.target.value})}
                                        rightSection={showOldPassword ? 
                                        <LockIcon width={16} height={16} className="text-[#6C6868] cursor-pointer" onClick={()=>setShowOldPassword(false)} /> : 
                                        <LockSlashedIcon width={16} height={16} className="text-[#6C6868] cursor-pointer" onClick={()=>setShowOldPassword(true)} />}
                                        classNames={{
                                            root: "mb-4",
                                            label: "text-[#0C0C0C] mb-2",
                                            input: `!border-[#8AC0FF] !h-[2.5rem] !px-[1rem]`,
                                            section: "!mr-[0.5rem]",
                                        }}
                                    />

                                    <TextInput size="xs" placeholder="Enter new password" radius={6} type="password" label="New Password" withAsterisk
                                        value={formData.newPassword} onChange={(e)=>setFormData({...formData, newPassword: e.target.value})}
                                        rightSection={showNewPassword ? 
                                        <LockIcon width={16} height={16} className="text-[#6C6868] cursor-pointer" onClick={()=>setShowNewPassword(false)} /> : 
                                        <LockSlashedIcon width={16} height={16} className="text-[#6C6868] cursor-pointer" onClick={()=>setShowNewPassword(true)} />}
                                        classNames={{
                                            root: "mb-4",
                                            label: "text-[#0C0C0C] mb-2",
                                            input: `!border-[#8AC0FF] !h-[2.5rem] !px-[1rem]`,
                                            section: "!mr-[0.5rem]",
                                        }}
                                    />

                                    <TextInput size="xs" placeholder="Confirm new password" radius={6} type="password" label="Confirm Password" withAsterisk
                                        value={formData.confirmPassword} onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})}
                                        rightSection={showConfirmPassword ? 
                                        <LockIcon width={16} height={16} className="text-[#6C6868] cursor-pointer" onClick={()=>setShowConfirmPassword(false)} /> : 
                                        <LockSlashedIcon width={16} height={16} className="text-[#6C6868] cursor-pointer" onClick={()=>setShowConfirmPassword(true)} />}
                                        classNames={{
                                            root: "mb-4",
                                            label: "text-[#0C0C0C] mb-2",
                                            input: `!border-[#8AC0FF] !h-[2.5rem] !px-[1rem]`,
                                            section: "!mr-[0.5rem]",
                                        }}
                                    />
                                    
                                    <Button size="xs" color="#39B54A" fullWidth radius={6}
                                        classNames={{
                                            root: "!h-[2.5rem] mt-15",
                                            label: "text-[0.8rem]"
                                        }}
                                        onClick={()=>handleSubmit()}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </ScrollArea>
        </>
    )
}

export default ResetPassword