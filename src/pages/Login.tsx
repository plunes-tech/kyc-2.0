import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, TextInput } from "@mantine/core";
import GlobalLoader from "../components/GlobalLoader";
import { LockIcon, LockSlashedIcon, MailIcon } from "../assets/icons";
import useAuth from "../hooks/useAuth";
import Notifications from "../components/Notifications";
import ForgotPassword from "../components/modals/ForgotPasswordModal";

const Login: React.FC = () => {

    const navigate = useNavigate()
    const { isLoading, error, login } = useAuth()
    
    const [openForgotModal, setOpenForgotModal] = useState(false)

    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleSubmit = async () => {
        // add submit logic here
        try {
            const response = await login({email: formData.email, password: formData.password})
            if(response.success) {
                navigate("/dashboard")
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
            <div className="h-[3rem] w-[90vw] bg-gradient-to-r from-[#d9f6da] to-[#ffffff] sm:h-[5rem] absolute top-0 left-0 z-[-1]" />
            <main className="flex flex-row items-center md:p-[3rem]">
                <div className="md:flex-1/2">
                    <img
                        src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/login-image-cashless.png" alt="login-image"
                        className="hidden md:block h-auto w-[40vw] my-auto"
                    />
                </div>
                <section className="ml-5 w-[42%] max-md:ml-0 max-md:w-full max-md:px-[1rem] md:flex-1/2">
                    <div className="flex flex-col grow max-md:max-w-full">
                        <div className="flex flex-col self-end w-full">
                            <header className="flex flex-col items-center">
                                <img
                                    src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/plunes-full-logo.png" alt="Plunes Logo"
                                    className="w-[10rem] object-contain self-center"
                                />
                                <h1 className="mt-6 text-base font-semibold leading-none text-neutral-950">Welcome to Plunes</h1>
                                <p className="mt-2 text-xs font-semibold text-neutral-950">Please Login to your account</p>
                            </header>
                            <div className="sm:p-[3rem]">
                                <TextInput size="xs" placeholder="example@email.com" radius={4} label="User email" withAsterisk
                                    value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})}
                                    rightSection={<MailIcon />}
                                    classNames={{
                                        root: "mb-4",
                                        label: "text-[#0C0C0C] mb-2",
                                        input: `!border-[#8AC0FF] !h-[2.5rem]`,
                                        section: "!mr-[0.5rem]",
                                    }}
                                />

                                <TextInput size="xs" placeholder="Enter password" radius={4} type={showPassword ? "text" : "password"} label="Password" withAsterisk
                                    value={formData.password} onChange={(e)=>setFormData({...formData, password: e.target.value})}
                                    rightSection={showPassword ? 
                                        <LockIcon className="cursor-pointer" onClick={()=>setShowPassword(false)} /> : 
                                        <LockSlashedIcon className="cursor-pointer" onClick={()=>setShowPassword(true)} width={22} height={22} />
                                    }
                                    classNames={{
                                        root: "mb-2",
                                        label: "text-[#0C0C0C] mb-2",
                                        input: `!border-[#8AC0FF] !h-[2.5rem]`,
                                        section: "!mr-[0.5rem]",
                                    }}
                                />

                                <div className="flex justify-end w-full">
                                    <Button size="compact-xs" w={"max-content"} h={18}
                                        onClick={()=>setOpenForgotModal(true)} classNames={{
                                            label: "!text-[0.6rem] sm:!text-[0.7rem] !text-[#0C0C0C] !font-medium",
                                            root: "ml-auto !bg-transparent !p-0",
                                        }}
                                    >
                                        Forgot Your Password?
                                    </Button>
                                </div>
                                
                                <Button size="xs" color="#39B54A" fullWidth radius={4}
                                    classNames={{
                                        root: "!h-[2.3rem] mt-15",
                                        label: "!text-[0.9rem]"
                                    }}
                                    onClick={()=>handleSubmit()}
                                >
                                    Login
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/dot-grid.png" className="absolute z-[-2] top-10 left-4 w-20 sm:w-24 sm:top-18 sm:left-6 xl:w-40 xl:top-40 xl:left-10" alt="grid" />
            <img src="https://portal-images-icons.s3.ap-south-1.amazonaws.com/images/dot-grid.png" className="absolute z-[-2] bottom-4 right-4 w-20 sm:w-24 sm:bottom-6 sm:right-6 xl:w-40" alt="grid" />
            <Modal opened={openForgotModal} onClose={()=>setOpenForgotModal(false)} withCloseButton={false} size={768} fullScreen={window.innerWidth <= 768}
                classNames={{
                header: "!hidden",
                content: "!rounded-none md:!rounded-[0.5rem]",
                body: "!p-0",
            }}>
                <ForgotPassword setOpenModal={setOpenForgotModal} />
            </Modal>
        </>
    )
}

export default Login