import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import useHospital from "../hooks/useHospital";
import useUploads from "../hooks/useUploads";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { HospitalUpdate } from "../features/hospital/types";
import { asyncForEach, deepCompare, removeEmptyArr, removeEmptyObj, removeNulls } from "../utils/utilits";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import GlobalLoader from "../components/GlobalLoader";
import Notifications from "../components/Notifications";
import { Accordion, Button, FileInput, Grid, Modal, ScrollArea, Select, Table, TextInput } from "@mantine/core";
import { CalendarIcon, CheckIcon, ChevronDownIcon, CloseCircleIcon, CloseIcon, EditIcon, UploadIcon } from "../assets/icons";
import { updateHospitalSchema } from "../features/hospital/schema";
import { DatePickerInput } from "@mantine/dates";
import ViewDocModal from "../components/modals/ViewDocModal";

const getDateFromUrl = (url: string): string => {
    const parts = url.split("/")
    const endString = parts[parts.length - 1].split(".")
    let fileName = endString[0]
    let nameParts = fileName.split("-")
    let date = nameParts[nameParts.length - 1]
    if(isNaN(Number(date))) return "-"
    return dayjs(Number(date)).format("DD-MMM-YYYY")
}

const HospitalDetails: React.FC = () => {

    const { getPresignedUrl } = useUploads()
    const { isLoading, error, message, getHospital, updateHospital } = useHospital()
    const navigate = useNavigate()
    const location = useLocation()

    const [activePage, setActivePage] = useState("general")
    const [activeSideBarTab, setActiveSideBarTab] = useState("dashoard")
    const [generalEditFlag, setGeneralEditFlag] = useState(false)
    const [accountEditFlag, setAccountEditFlag] = useState(false)
    const [openDocModal, setOpenDocModal] = useState(false)
    const [documentUrl, setDocumentUrl] = useState("")

    const [hospitalDocuments, setHospitalDocuments] = useState({
        rohiniCertificate: "",
        registrationCertificate: "",
        tarrifList: "",
        cancelledCheque: "",
        panCard: "",
        gstCertificate: "",
        otherDocuments: [] as {name: string, docUrl: string, date?: string}[],
    })
    const [profileDocuments, setProfileDocuments] = useState({
        rohiniCertificate: null as File | null,
        registrationCertificate: null as File | null,
        tarrifList: null as File | null,
        cancelledCheque: null as File | null,
        panCard: null as File | null,
        gstCertificate: null as File | null,
        otherDoc: null as File | null,
        otherDocname: "",
    })

    const data = useSelector((state: RootState) => state.hospital.hospital)
    const [postData, setPostData] = useState<HospitalUpdate | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getHospital()
                if(result.success) {
                    setPostData(result.data)
                }
            } catch (error) {
                // handle by redux
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if(location.state) {
            if(location.state.activePage) {
                setActivePage(location.state.activePage)
            } else {
                setActivePage("general")
            }
            if(location.state.activeTab) {
                setActiveSideBarTab(location.state.activeTab)
            } else {
                setActiveSideBarTab("dashoard")
            }
        } else {
            setActivePage("general")
        }
    }, [location])

    useEffect(() => {
        setGeneralEditFlag(false)
        setOpenDocModal(false)
    }, [activePage])

    useEffect(() => {
        console.log("HERE >>>>>>>>>>>>>>> ", postData?.hospitalDetails?.registrationDate);
    }, [postData?.hospitalDetails?.registrationDate])

    const handleUploadFile = async (filePath: string, file: File): Promise<string> => {
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "PUT"
            })
            const response = await axios.put(result.url, file)
            if(response.status === 200) {
                return filePath
            }
            return ""
        } catch (error) {
            // handle by redux
            return ""
        }
    }

    const handleDeleteFile = async (filePath: string): Promise<boolean> => {
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE"
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                return true
            }
            return false
        } catch (error) {
            // handle by redux
            return false
        }
    }

    const uploadRohiniCertificate = async (file: File | null) => {
        if(!file) return
        try {
            const fileName = `Hospital-ROHINI-${Date.now()}.pdf` // add rohini id or hospital name in the filename later
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, file)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    rohiniCertificate: file
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    rohiniCertificate: docUrl,
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const deleteRohiniCerti = async (filePath: string | undefined) => {
        if(!filePath) return
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                setProfileDocuments({
                    ...profileDocuments,
                    rohiniCertificate: null,
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    rohiniCertificate: "",
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const uploadRegistrationCertificate = async (file: File | null) => {
        if(!file) return
        try {
            const fileName = `Hospital-Registration-certificate-${Date.now()}.pdf` // add rohini id or hospital name in the filename later
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, file)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    registrationCertificate: file
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    registrationCertificate: docUrl,
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const deleteRegistrationCerti = async (filePath: string | undefined) => {
        if(!filePath) return
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                setProfileDocuments({
                    ...profileDocuments,
                    registrationCertificate: null,
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    registrationCertificate: "",
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const uploadTariffList = async (file: File | null) => {
        if(!file) return
        try {
            const fileName = file.type ==="application/pdf" ? `Hospital-tariff-list-${Date.now()}.pdf` : `Hospital-tariff-list-${Date.now()}.xlsx` // add rohini id or hospital name in the filename later
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, file)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    tarrifList: file
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    tarrifList: docUrl,
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const deleteTariff = async (filePath: string | undefined) => {
        if(!filePath) return
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                setProfileDocuments({
                    ...profileDocuments,
                    tarrifList: null,
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    tarrifList: "",
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const uploadCancelledCheque = async (file: File | null) => {
        if(!file) return
        try {
            const fileName = `Hospital-Cancelled-Cheque-${Date.now()}.pdf` // add rohini id or hospital name in the filename later
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, file)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    cancelledCheque: file
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    cancelledCheque: docUrl,
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const deleteCancelledCheque = async (filePath: string | undefined) => {
        if(!filePath) return
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                setProfileDocuments({
                    ...profileDocuments,
                    cancelledCheque: null,
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    cancelledCheque: "",
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const uploadPanCard = async (file: File | null) => {
        if(!file) return
        try {
            const fileName = `Hospital-Pan-Card-${Date.now()}.pdf` // add rohini id or hospital name in the filename later
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, file)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    panCard: file
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    panCard: docUrl,
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const deletePanCard = async (filePath: string | undefined) => {
        if(!filePath) return
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                setProfileDocuments({
                    ...profileDocuments,
                    panCard: null,
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    panCard: "",
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const uploadGstCertificate = async (file: File | null) => {
        if(!file) return
        try {
            const fileName = `Hospital-GST-Certificate-${Date.now()}.pdf` // add rohini id or hospital name in the filename later
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, file)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    gstCertificate: file
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    gstCertificate: docUrl,
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const deleteGstCerti = async (filePath: string | undefined) => {
        if(!filePath) return
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                setProfileDocuments({
                    ...profileDocuments,
                    gstCertificate: null,
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    gstCertificate: "",
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const uploadOtherDoc = async () => {
        if(!profileDocuments.otherDoc || !profileDocuments.otherDocname) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Please enter document name and select a file before adding"
            })
        }
        try {
            const fileName = `Hospital-Document-${profileDocuments.otherDocname}-${Date.now()}.pdf`
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, profileDocuments.otherDoc)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    otherDoc: null,
                    otherDocname: "",
                })
                const newDocs = hospitalDocuments.otherDocuments ? [...hospitalDocuments.otherDocuments] : []
                newDocs.push({
                    name: profileDocuments.otherDocname,
                    docUrl: filePath,
                    date: new Date(Date.now()).toISOString(),
                })
                setHospitalDocuments({
                    ...hospitalDocuments,
                    otherDocuments: newDocs
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const deleteOtherDoc = async (filePath: string) => {
        try {
            const result = await handleDeleteFile(filePath)
            if(result) {
                let newDocs = hospitalDocuments.otherDocuments ? [...hospitalDocuments.otherDocuments] : []
                newDocs = newDocs.filter(doc => doc.docUrl !== filePath)
                setHospitalDocuments({
                    ...hospitalDocuments,
                    otherDocuments: newDocs
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const handleUpdateHospitalData = async () => {
        if(!data?.id) return
        try {
            const validateData = removeNulls(postData)
            if(!updateHospitalSchema.safeParse(validateData).success) {
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: updateHospitalSchema.safeParse(validateData).error?.errors[0].message ?? "Cannot update hospital profile"
                })
            }
            let comparedPayload = deepCompare(data, postData)
            if(!Object.keys(comparedPayload).length) {
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: "Please modify at least one field to save"
                })
            }
            comparedPayload = removeNulls(comparedPayload)
            comparedPayload = removeEmptyArr(comparedPayload)
            comparedPayload = removeEmptyObj(comparedPayload)
            const result = await updateHospital(data?.id, comparedPayload)
            if(result.success) {
                setGeneralEditFlag(false)
            }
        } catch (error) {
            // handle by redux and zod
        }
    }

    const handleCloseDocModal = async () => {
        try {
            if(hospitalDocuments.rohiniCertificate) {
                await deleteRohiniCerti(hospitalDocuments.rohiniCertificate)
            }
            if(hospitalDocuments.registrationCertificate) {
                await deleteRegistrationCerti(hospitalDocuments.registrationCertificate)
            }
            if(hospitalDocuments.tarrifList) {
                await deleteTariff(hospitalDocuments.tarrifList)
            }
            if(hospitalDocuments.cancelledCheque) {
                await deleteCancelledCheque(hospitalDocuments.cancelledCheque)
            }
            if(hospitalDocuments.panCard) {
                await deletePanCard(hospitalDocuments.panCard)
            }
            if(hospitalDocuments.gstCertificate) {
                await deleteGstCerti(hospitalDocuments.gstCertificate)
            }
            if(hospitalDocuments.otherDocuments.length > 0) {
                await asyncForEach(hospitalDocuments.otherDocuments, async (doc) => {
                    await deleteOtherDoc(doc.docUrl)
                })
            }
            setOpenDocModal(false)
            setHospitalDocuments({
                rohiniCertificate: "",
                registrationCertificate: "",
                tarrifList: "",
                cancelledCheque: "",
                panCard: "",
                gstCertificate: "",
                otherDocuments: [],
            })
            setProfileDocuments({
                rohiniCertificate: null,
                registrationCertificate: null,
                tarrifList: null,
                cancelledCheque: null,
                panCard: null,
                gstCertificate: null,
                otherDoc: null,
                otherDocname: "",
            })
        } catch (error) {
            // handle by redux
        }
    }

    const handleUpdateHospitalDocuments = async () => {
        if(!data?.id) return
        try {
            const cleanedData = removeNulls(hospitalDocuments)
            const finalData = cleanedData.otherDocuments.length === 0 ? (({ otherDocuments, ...rest }) => rest)(cleanedData) : cleanedData;
            if(!Object.keys(finalData).length) {
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: "Please upload at least one document to save"
                })
            }
            console.log(finalData);
            const result = await updateHospital(data?.id, {hospitalDetails: {profileDocuments: finalData}})
            if(result.success) {
                setGeneralEditFlag(false)
                setOpenDocModal(false)
                setHospitalDocuments({
                    rohiniCertificate: "",
                    registrationCertificate: "",
                    tarrifList: "",
                    cancelledCheque: "",
                    panCard: "",
                    gstCertificate: "",
                    otherDocuments: [],
                })
                setProfileDocuments({
                    rohiniCertificate: null,
                    registrationCertificate: null,
                    tarrifList: null,
                    cancelledCheque: null,
                    panCard: null,
                    gstCertificate: null,
                    otherDoc: null,
                    otherDocname: "",
                })
            }
        } catch (error) {
            // handle by redux and zod
        }
    }

    return (
        <>
        {isLoading && <GlobalLoader/>}
        {error && error.message && error.message.toLowerCase() !== "validation error" && <Notifications type="error" title="Error" message={error.message} />}
        {error && error.message && error.message.toLocaleLowerCase() === "validation error" && Array.isArray(error.errors) && error.errors[0]?.message && <Notifications type="error" title="Error" message={error.errors[0].message} />}
        {message && <Notifications type="success" title="Success" message={message} />}
        <main className="bg-[#F6F6F6] mt-[3.5rem] xl:mt-[4.25rem] md:ml-[50px] min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4.25rem)] min-w-[100vw] md:min-w-[calc(100vw-50px)] p-2 sm:p-4">
            {/* navigation buttons */}
            <div className="flex items-center gap-x-6 gap-y-2 mb-6">
                <Button variant="default" size="compact-xs"
                    classNames={{
                        root: `${activePage==="general" ? "!bg-[#39B54A] !shadow-[0_4px_4px_#00000040] !border-0" : "!bg-[#FFFFFF] !border-1 !border-[#0F3D46]"}`,
                        label: `${activePage==="general" ? "!text-[#FFFFFF]" : "!text-[#0F3D46]"} !text-[0.6rem] md:!text-[0.7rem] !font-medium`
                    }}
                    onClick={()=>navigate(`/hospital-details`, {state: {activePage: "general", activeTab: activeSideBarTab}})}
                >
                    General Information
                </Button>
                <Button variant="default" size="compact-xs"
                    classNames={{
                        root: `${activePage==="account" ? "!bg-[#39B54A] !shadow-[0_4px_4px_#00000040] !border-0" : "!bg-[#FFFFFF] !border-1 !border-[#0F3D46]"}`,
                        label: `${activePage==="account" ? "!text-[#FFFFFF]" : "!text-[#0F3D46]"} !text-[0.6rem] md:!text-[0.7rem] !font-medium`
                    }}
                    onClick={()=>navigate(`/hospital-details`, {state: {activePage: "account", activeTab: activeSideBarTab}})}
                >
                    Account Information
                </Button>
                <Button variant="default" size="compact-xs"
                    classNames={{
                        root: `${activePage==="document" ? "!bg-[#39B54A] !shadow-[0_4px_4px_#00000040] !border-0" : "!bg-[#FFFFFF] !border-1 !border-[#0F3D46]"}`,
                        label: `${activePage==="document" ? "!text-[#FFFFFF]" : "!text-[#0F3D46]"} !text-[0.6rem] md:!text-[0.7rem] !font-medium`
                    }}
                    onClick={()=>navigate(`/hospital-details`, {state: {activePage: "document", activeTab: activeSideBarTab}})}
                >
                    Documents
                </Button>
            </div>

            {/* main body */}
            {activePage==="general" && <>
            <div className="border-1 border-[#ACACAC] rounded-[0.5rem] overflow-hidden">
                <div className="bg-[#39B54A] p-1 sm:p-1.5 rounded-t-[0.5rem] flex items-center justify-between">
                    <h3 className="text-[0.7rem] md:text-[0.8rem] text-[#FFFFFF] font-semibold">General Information</h3>
                    {!generalEditFlag && <EditIcon className="text-[#FFFFFF] cursor-pointer" width={16} height={16} onClick={()=>{setGeneralEditFlag(true); setPostData(data)}}/>}
                    {generalEditFlag && <div className="flex items-center gap-2 mr-2">
                        <CheckIcon className="text-[#FFFFFF] cursor-pointer" width={20} height={20} onClick={()=>handleUpdateHospitalData()} />
                        <CloseIcon className="text-[#FFFFFF] cursor-pointer" width={10} height={10} onClick={()=>setGeneralEditFlag(false)}/>
                    </div>}
                </div>
                <ScrollArea h={"calc(100vh - 7.5rem - 46px - 1rem)"} className="!bg-[#FFFFFF]" scrollbarSize={6}>
                    <div className="p-2 sm:p-3 md:p-4">
                        <Grid grow>
                            <Grid.Col span={{base:12, md:6, lg:6}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">ROHINI Code </label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.rohiniId ? data?.rohiniId : "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.rohiniId} placeholder="Enter ROHINI ID" type="number" onWheel={e => e.currentTarget.blur()}
                                    onChange={e => setPostData({...postData, rohiniId: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, md:6, lg:6}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">ROHINI Certificate</label>
                                {data?.hospitalDetails?.profileDocuments?.rohiniCertificate && 
                                <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                    onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.rohiniCertificate}`)}
                                >
                                    View
                                </span>}
                                {!data?.hospitalDetails?.profileDocuments?.rohiniCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                            </Grid.Col>
                            <Grid.Col span={{base:12, md:6, lg:6}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Hospital Name </label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.name ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.name} disabled placeholder="Enter Hospital Name"
                                    onChange={e => setPostData({...postData, name: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:6, md:2, lg:2}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">State</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.state ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.state} placeholder="Enter State"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, state: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:6, md:2, lg:2}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">City</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.city ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.city} placeholder="Enter City"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, city: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:6, md:2, lg:2}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Pin Code</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.pinCode ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.pinCode} type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="000000"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, pinCode: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Address</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.address ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.address} placeholder="Enter Address"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, address: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Mobile No. </label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.mobileNumber ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" disabled value={postData?.mobileNumber} type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="000-0000-000"
                                    onChange={e => setPostData({...postData, mobileNumber: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Alternate No.</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.alternateMobileNumber ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.alternateMobileNumber} type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="000-0000-000"
                                    onChange={e => setPostData({...postData, alternateMobileNumber: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Hospital Email </label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.email ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" disabled value={postData?.email} placeholder="example@email.com"
                                    onChange={e => setPostData({...postData, email: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Contact Person Name</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.contactPerson ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.contactPerson} placeholder="Enter Contact Person Name"
                                    onChange={e => setPostData({...postData, contactPerson: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Contact Person Contact</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.contactPersonContact ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.contactPersonContact} type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="000-0000-000"
                                    onChange={e => setPostData({...postData, contactPersonContact: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Contact Person Email</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.contactPersonEmail ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.contactPersonEmail} placeholder="example@email.com"
                                    onChange={e => setPostData({...postData, contactPersonEmail: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="h-[1px] w-full bg-[#D2D2D2] my-4" />

                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Type Of Hospital</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.typeOfHospital ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable placeholder="Select Hospital Type" rightSection={!postData?.hospitalDetails?.typeOfHospital || (postData?.hospitalDetails?.typeOfHospital === data?.hospitalDetails?.typeOfHospital) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.typeOfHospital} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, typeOfHospital: e ?? data?.hospitalDetails?.typeOfHospital ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {label:"Multi Speciality", value:"Multi Speciality"},
                                        {label:"Single Speciality", value:"Single Speciality"},
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Type Of Care</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.careType ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable placeholder="Select Care Type" rightSection={!postData?.hospitalDetails?.careType || (postData?.hospitalDetails?.careType == data?.hospitalDetails?.careType) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.careType} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, careType: e ?? data?.hospitalDetails?.careType ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {label:"Primary Care", value:"Primary Care"},
                                        {label:"Secondary Care", value:"Secondary Care"},
                                        {label:"Tertiary Care", value:"Tertiary Care"},
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">PPN Status</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.ppnStatus ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable placeholder="Select PPN Status" rightSection={!postData?.hospitalDetails?.ppnStatus || (postData?.hospitalDetails?.ppnStatus === data?.hospitalDetails?.ppnStatus) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.ppnStatus} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ppnStatus: e ?? data?.hospitalDetails?.ppnStatus ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {label:"PPN", value:"PPN"},
                                        {label:"Non PPN", value:"Non PPN"},
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Platform Subcription Fee (%) </label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.platformSubscriptionFee ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" disabled value={postData?.platformSubscriptionFee || undefined} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Fee"
                                    onChange={e => setPostData({...postData, platformSubscriptionFee: e.target.value ? parseFloat(e.target.value) : undefined})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Representative Name</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.representativeName ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.representativeName} placeholder="Enter Representative Name"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, representativeName: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Representative Designation</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.representativeDesignation ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.representativeDesignation} placeholder="Enter Representative Designation"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, representativeDesignation: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Registration Number</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.registrationNumber ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.registrationNumber} placeholder="Enter Registration Number"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, registrationNumber: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Registration Date</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.registrationDate ? dayjs(data?.hospitalDetails?.registrationDate).format("DD-MMM-YYYY") :  "-"}</p>}
                                {generalEditFlag && <DatePickerInput clearable size="xs" placeholder="Select Registration Date" 
                                    rightSection={(!postData?.hospitalDetails?.registrationDate || (postData?.hospitalDetails?.registrationDate === data?.hospitalDetails?.registrationDate)) && <CalendarIcon className="text-[#0095FF]" width={14} height={14} />}
                                    value={postData?.hospitalDetails?.registrationDate ? postData?.hospitalDetails?.registrationDate : undefined} 
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, registrationDate: e ?? data?.hospitalDetails?.registrationDate ?? undefined}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Registration Authority</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.registrationAuthority}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.registrationAuthority} placeholder="Enter Registration Authority"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, registrationAuthority: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Registration Certificate</label>
                                {data?.hospitalDetails?.profileDocuments?.registrationCertificate && 
                                <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                    onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.registrationCertificate}`)}
                                >
                                    View
                                </span>}
                                {!data?.hospitalDetails?.profileDocuments?.registrationCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                            </Grid.Col>

                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Medical Superintendent Name</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.medicalSuperintendent ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.medicalSuperintendent} placeholder="Enter Medical Superintendent Name"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalSuperintendent: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Medical Superintendent Contact</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.medicalSuperintendentContact ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.medicalSuperintendentContact} placeholder="000-0000-000" type="number" onWheel={e => e.currentTarget.blur()}
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalSuperintendentContact: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Medical Superintendent Email</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.medicalSuperintendentEmail ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.medicalSuperintendentEmail} placeholder="example@email.com"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalSuperintendentEmail: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">TPA Head Name</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.marketingTpaHead ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.marketingTpaHead} placeholder="Enter TPA Name"
                                    onChange={e => setPostData({...postData, marketingTpaHead: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">TPA Head Contact</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.tpaHeadContact ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.tpaHeadContact} placeholder="000-0000-000" type="number" onWheel={e => e.currentTarget.blur()}
                                    onChange={e => setPostData({...postData, tpaHeadContact: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">TPA Head Email</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.tpaHeadEmail ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.tpaHeadEmail} placeholder="example@email.com"
                                    onChange={e => setPostData({...postData, tpaHeadEmail: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">TPA Designation</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.tpaHeadDesignation ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.tpaHeadDesignation} placeholder="Enter TPA Designation"
                                    onChange={e => setPostData({...postData, tpaHeadDesignation: e.target.value})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">MOU Signing Date</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.mouSiginingDate ? dayjs(data?.hospitalDetails?.mouSiginingDate).format("DD-MMM-YYYY") : "-"}</p>}
                                {generalEditFlag && <DatePickerInput size="xs" placeholder="Select MOU Signing Date" clearable rightSection={!postData?.hospitalDetails?.mouSiginingDate || (postData?.hospitalDetails?.mouSiginingDate === data?.hospitalDetails?.mouSiginingDate) && <CalendarIcon className="text-[#0095FF]" width={14} height={14} />}
                                    value={postData?.hospitalDetails?.mouSiginingDate} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, mouSiginingDate: e ?? data?.hospitalDetails?.mouSiginingDate ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">MOU Signing Authority</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.mouSiginingAuthority}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.mouSiginingAuthority} placeholder="Enter MOU Signing Authority"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, mouSiginingAuthority: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Hospital Tariff</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.hospitalTariff}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.hospitalTariff} placeholder="Enter Tariff"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, hospitalTariff: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Hospital Tariff</label>
                                {data?.hospitalDetails?.profileDocuments?.tarrifList && 
                                <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                    onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.tarrifList}`)}
                                >
                                    View
                                </span>}
                                {!data?.hospitalDetails?.profileDocuments?.tarrifList && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                            </Grid.Col>

                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">General Info</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.generalInfo ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable placeholder="General Info" rightSection={!postData?.hospitalDetails?.generalInfo || (postData?.hospitalDetails?.generalInfo === data?.hospitalDetails?.generalInfo) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.generalInfo} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, generalInfo: e ?? data?.hospitalDetails?.generalInfo ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'Metro City',
                                            value: 'Metro City'
                                        },
                                        {
                                            label: 'Non Metro (Non State capital Population above 10 Lakhs)',
                                            value: 'Non Metro (Non State capital Population above 10 Lakhs)'
                                        },
                                        {
                                            label: 'Non Metro (Population 5-10 Lakhs)',
                                            value: 'Non Metro (Population 5-10 Lakhs)'
                                        },
                                        {
                                            label: 'Non Metro (Population below 5 Lakhs)',
                                            value: 'Non Metro (Population below 5 Lakhs)'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Total Area (in Sq. Ft)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.totalArea ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.totalArea} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Total Area"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, totalArea: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Ownership</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.ownership ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select Ownership" rightSection={!postData?.hospitalDetails?.ownership || (postData?.hospitalDetails?.ownership === data?.hospitalDetails?.ownership) && <ChevronDownIcon className="text-[#000]" />}
                                    value={postData?.hospitalDetails?.ownership} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ownership: e ?? data?.hospitalDetails?.ownership ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'Fully Owned Premises',
                                            value: 'Fully Owned Premises'
                                        },
                                        {
                                            label: 'Floor in commercial complex',
                                            value: 'Floor in commercial complex'
                                        },
                                        {
                                            label: 'Leased Premises',
                                            value: 'Leased Premises'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Age Of The Building</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.buildingAge ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select Ownership" rightSection={!postData?.hospitalDetails?.buildingAge || (postData?.hospitalDetails?.buildingAge === postData?.hospitalDetails?.buildingAge) && <ChevronDownIcon className="text-[#000]" />}
                                    value={postData?.hospitalDetails?.buildingAge} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, buildingAge: e ?? data?.hospitalDetails?.buildingAge ??""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'Less than 5 years',
                                            value: 'Less than 5 years'
                                        },
                                        {
                                            label: '5 to 10 years',
                                            value: '5 to 10 years'
                                        },
                                        {
                                            label: '10 to 20 years',
                                            value: '10 to 20 years'
                                        },
                                        {
                                            label: 'More than 20 years',
                                            value: 'More than 20 years'
                                        },
                                    ]}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Operation Theaters</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Major/Nos</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.majorNos ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.majorNos} placeholder="Enter Major/Nos" type="number" onWheel={e => e.currentTarget.blur()}
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, majorNos: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Minor/Nos</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.minorNos ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.minorNos} placeholder="Enter Minor/Nos" type="number" onWheel={e => e.currentTarget.blur()}
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, minorNos: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Specialised OT's (Specify)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.specializedOT ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.specializedOT} placeholder="Specify Specialised OT's"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, specializedOT: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">OT Zones</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.otZones ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.otZones} placeholder="Enter OT Zones"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, otZones: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            
                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">OT Rooms</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Preparation, Pre & Post-Operative, Scrub</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.preparationScrub ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.preparationScrub} placeholder="Enter Preparation, Pre & Post-Operative, Scrub"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, preparationScrub: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Laminar Flow</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.laminarFlow ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.laminarFlow} placeholder="Enter Laminar Flow"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, laminarFlow: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Infection Control</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Periodical checks for pest management</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.pestManagement ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.pestManagement} placeholder="Enter Periodical checks for pest management"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, pestManagement: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Periodical monitoring and audits for Hospital acquired infections</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.monitoring ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.monitoring} placeholder="Enter Periodical Monitoring And Audits For Hospital Acquired Infections"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, monitoring: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Patient safety</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Earthquake safety - Building parameters</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.earthquakeSafety ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.earthquakeSafety} placeholder="Enter Earthquake Safety - Building Parameters"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, earthquakeSafety: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Fire safety drills</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.fireSafety ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.fireSafety} placeholder="Enter Fire Safety Drills"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, fireSafety: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Medical/Paramedical staff details</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Duty Doctor to patient Ratio</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.doctorPatientRatio ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.doctorPatientRatio || (postData?.hospitalDetails?.doctorPatientRatio === data?.hospitalDetails?.doctorPatientRatio) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.doctorPatientRatio} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, doctorPatientRatio: e ?? data?.hospitalDetails?.doctorPatientRatio ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: '1:10',
                                            value: '1:10'
                                        },
                                        {
                                            label: '1:10 to 1:15',
                                            value: '1:10 to 1:15'
                                        },
                                        {
                                            label: 'Greater than 1:15',
                                            value: 'Greater than 1:15'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Nurse to patient Ratio (non ICU)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.nursePatientRatio ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.nursePatientRatio || (postData?.hospitalDetails?.nursePatientRatio || data?.hospitalDetails?.nursePatientRatio) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.nursePatientRatio} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, nursePatientRatio: e ?? data?.hospitalDetails?.nursePatientRatio ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: '1:10',
                                            value: '1:10'
                                        },
                                        {
                                            label: '1:10 to 1:12',
                                            value: '1:10 to 1:12'
                                        },
                                        {
                                            label: 'Greater than 1:12',
                                            value: 'Greater than 1:12'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Availability of in-house doctors MD/MS /MCh Doctors (full time only)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.doctorAvailability ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.doctorAvailability} placeholder="Enter Doctor Availability"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, doctorAvailability: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Total Staff Strength (Nos.)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.totalStaff ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.totalStaff} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Total Staff"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, totalStaff: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Duty Medical Officers (Nos.)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.medicalOfficers ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.medicalOfficers} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Duty Medical Officers"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalOfficers: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Nursing Staff (Qualified) (Nos.)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.nursingStaff ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.nursingStaff} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Nursing Staff"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, nursingStaff: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Paramedical Staff (Qualified) (Nos.)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.paramedicalStaff ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.paramedicalStaff} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Paramedical Staff"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, paramedicalStaff: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Medical specialties</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">General Medicine</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.generalMedicine ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.generalMedicine} placeholder="Enter General Medicine"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, generalMedicine: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">ENT</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.medicalENT ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.medicalENT} placeholder="Enter ENT"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalENT: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Gastroenterology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.gastroenterology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.gastroenterology} placeholder="Enter Gastroenterology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, gastroenterology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Obstetric & Gynaecology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.obstetricGynaecology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.obstetricGynaecology} placeholder="Enter Obstetric & Gynaecology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, obstetricGynaecology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Urology/Nephrology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.urology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.urology} placeholder="Enter Urology/Nephrology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, urology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Surgical specialties</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Cardiology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.cardiology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.cardiology} placeholder="Enter Cardiology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, cardiology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">ENT</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.surgicalENT ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.surgicalENT} placeholder="Enter ENT"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalENT: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Gastroenterology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.surgicalGastroenterology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.surgicalGastroenterology} placeholder="Enter Gastroenterology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalGastroenterology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">General Surgery</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.generalSurgery ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.generalSurgery} placeholder="Enter General Surgery"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, generalSurgery: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Neurosurgery</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.neurosurgery ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.neurosurgery} placeholder="Enter Neurosurgery"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, neurosurgery: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Obstetric & Gynaecology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.surgicalObstetricGynaecology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.surgicalObstetricGynaecology} placeholder="Enter Obstetric & Gynaecology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalObstetricGynaecology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Opthalmology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.opthalmology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.opthalmology} placeholder="Enter Opthalmology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, opthalmology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Orthopedics</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.orthopedics ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.orthopedics} placeholder="Enter Orthopedics"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, orthopedics: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Plastic Surgery</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.plasticSurgery ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.plasticSurgery} placeholder="Enter Plastic Surgery"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, plasticSurgery: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Urology/Nephrology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.surgicalUrology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.surgicalUrology} placeholder="Enter Urology/Nephrology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalUrology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Oncology</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.oncology ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.oncology} placeholder="Enter Oncology"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, oncology: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Paediatrics Surgery</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.paediatricsSurgery ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.paediatricsSurgery} placeholder="Enter Paediatrics Surgery"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, paediatricsSurgery: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Robotic Surgery</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.roboticSurgery ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.roboticSurgery} placeholder="Enter Robotic Surgery"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, roboticSurgery: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Laboratory/Pathology Services</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">In-house/Out sourced</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.inHouseLab ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.inHouseLab} placeholder="Enter Lab Details"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, inHouseLab: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Blood Bank</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bloodBank ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.bloodBank || (postData?.hospitalDetails?.bloodBank === data?.hospitalDetails?.bloodBank) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.bloodBank} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bloodBank: e ?? data?.hospitalDetails?.bloodBank ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'Yes',
                                            value: 'Yes'
                                        },
                                        {
                                            label: 'No',
                                            value: 'No'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Blood Bank should follow NACO guidelines,drug & cosmetic act</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bloodGuidelines ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.bloodGuidelines || (postData?.hospitalDetails?.bloodGuidelines === data?.hospitalDetails?.bloodGuidelines) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.bloodGuidelines} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bloodGuidelines: e ?? data?.hospitalDetails?.bloodGuidelines ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'Yes',
                                            value: 'Yes'
                                        },
                                        {
                                            label: 'No',
                                            value: 'No'
                                        },
                                    ]}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Radiology Services</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">X-Ray (X-Ray - AERB guide lines)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.xRay ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.xRay} placeholder="Enter X-Ray - AERB guide lines"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, xRay: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">2D Echo/ Colour Doppler</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.colorDoppler ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.colorDoppler} placeholder="Enter 2D Echo/ Colour Doppler"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, colorDoppler: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">MRI/PET CT</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.mri ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.mri} placeholder="Enter MRI/PET CT"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, mri: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">CT Scan</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.ctScan ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.ctScan} placeholder="Enter CT Scan"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ctScan: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Dialysis unit</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.dialysisUnit ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.dialysisUnit} placeholder="Enter Dialysis Unit"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, dialysisUnit: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">U.S.G.</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.usg ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.usg} placeholder="Enter U.S.G."
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, usg: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Pharmacy</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Pharmacy</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.pharmacy ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.pharmacy || (postData?.hospitalDetails?.pharmacy === data?.hospitalDetails?.pharmacy) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.pharmacy} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, pharmacy: e ?? data?.hospitalDetails?.pharmacy ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'In House',
                                            value: 'In House'
                                        },
                                        {
                                            label: 'Out Sourced',
                                            value: 'Out Sourced'
                                        },
                                    ]}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Non-Clinical Support Services</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Ambulance Services</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.ambulance ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.ambulance || (postData?.hospitalDetails?.ambulance === data?.hospitalDetails?.ambulance) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.ambulance} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ambulance: e ?? data?.hospitalDetails?.ambulance ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'Advance Life Support (ALS)',
                                            value: 'Advance Life Support (ALS)'
                                        },
                                        {
                                            label: 'Basic Life Support (BLS)',
                                            value: 'Basic Life Support (BLS)'
                                        },
                                        {
                                            label: 'NA/Out Sourced',
                                            value: 'NA/Out Sourced'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Dietary Services</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.dietary ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.dietary || (postData?.hospitalDetails?.dietary === data?.hospitalDetails?.dietary) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.dietary} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, dietary: e ?? data?.hospitalDetails?.dietary ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'In house with qualified dietician',
                                            value: 'In house with qualified dietician'
                                        },
                                        {
                                            label: 'Out Sourced',
                                            value: 'Out Sourced'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Linen & Laundry Services</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.laundry ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.laundry || (postData?.hospitalDetails?.laundry === data?.hospitalDetails?.laundry) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.laundry} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, laundry: e ?? data?.hospitalDetails?.laundry ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'In House',
                                            value: 'In House'
                                        },
                                        {
                                            label: 'Out Scored',
                                            value: 'Out Scored'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Biomedical Gases</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bioGases ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.bioGases || (postData?.hospitalDetails?.bioGases === data?.hospitalDetails?.bioGases) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.bioGases} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bioGases: e ?? data?.hospitalDetails?.bioGases ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'Local/Portable Cylinders',
                                            value: 'Local/Portable Cylinders'
                                        },
                                        {
                                            label: 'Piped Gases - Localized to specific department',
                                            value: 'Piped Gases - Localized to specific department'
                                        },
                                        {
                                            label: 'Piped Gases - Entire Hospital',
                                            value: 'Piped Gases - Entire Hospital'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Bio-Medical Waste Management</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bioWaste ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable size="xs" placeholder="Select" rightSection={!postData?.hospitalDetails?.bioWaste || (postData?.hospitalDetails?.bioWaste === data?.hospitalDetails?.bioWaste) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.bioWaste} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bioWaste: e ?? data?.hospitalDetails?.bioWaste ?? ""}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: 'No Specific Method Followed',
                                            value: 'No Specific Method Followed'
                                        },
                                        {
                                            label: 'Segregation at source & Disposal using Local Municipal Facilities',
                                            value: 'Segregation at source & Disposal using Local Municipal Facilities'
                                        },
                                        {
                                            label: 'Segregation at source & Disposal using System Inhouse',
                                            value: 'Segregation at source & Disposal using System Inhouse'
                                        },
                                    ]}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Medical Record Department</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Hospital Information system (Electronic)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.hosInfoSystem ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.hosInfoSystem} placeholder="Enter Hospital Information system (Electronic)"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, hosInfoSystem: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Fire safety certificate/ clearane availed</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.fireSafetyCerti ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.fireSafetyCerti} placeholder="Enter fire safety certificate/ clearane availed"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, fireSafetyCerti: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Recognised by Municipal council / State body (Name the body)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.municipalRecognistion ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.municipalRecognistion} placeholder="Enter Name of The Body"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, municipalRecognistion: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">General cleanliness / Housekeeping</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.housekeeping ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.housekeeping} placeholder="Enter General cleanliness / Housekeeping"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, housekeeping: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Parking space / Waiting rooms / Cafeteria / Patient information systems</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.parkingSpace ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.parkingSpace} placeholder="Enter Parking space / Waiting rooms / Cafeteria / Patient information systems"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, parkingSpace: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Bed Details</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Bed Capacity</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.bedCapacity ?? "-"}</p>}
                                {generalEditFlag && <Select withCheckIcon={false} clearable placeholder="Select" rightSection={!postData?.hospitalDetails?.bedDetails?.bedCapacity || (postData?.hospitalDetails?.bedDetails?.bedCapacity === data?.hospitalDetails?.bedDetails?.bedCapacity) && <ChevronDownIcon className="text-[#000]"/>}
                                    value={postData?.hospitalDetails?.bedDetails?.bedCapacity} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, bedCapacity: e ?? data?.hospitalDetails?.bedDetails?.bedCapacity ?? ""}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] mb-8",
                                    }}
                                    data={[
                                        {
                                            label: '0-30',
                                            value: '0-30'
                                        },
                                        {
                                            label: '31-100',
                                            value: '31-100'
                                        },
                                        {
                                            label: '101-500',
                                            value: '101-500'
                                        },
                                        {
                                            label: 'More than 500',
                                            value: 'More than 500'
                                        },
                                    ]}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">No. of Hospital Inpatient Beds</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.inPatientBeds ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.inPatientBeds} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter In-Patient Beds"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, inPatientBeds: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">No. of Day Care Beds</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.dayCareBeds ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.dayCareBeds} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Day Care Beds"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, dayCareBeds: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">ICU (MICU/SICU)/ICU (PICU/NICU) (% of total bed)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.icuNicu ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.icuNicu} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter ICU/NICU Beds"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, icuNicu: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Beds Distance</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.bedsDistance ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.bedsDistance} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Bed Distance"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, bedsDistance: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Single AC/Single non AC (% of total Bed)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.singleAc ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.singleAc} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Single A/C"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, singleAc: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Non bed area (Min 55% of the total Hospital area)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.nonBedArea ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.nonBedArea} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Non Bed Area"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, nonBedArea: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Total bed Strength</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.totalBed ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.totalBed} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Total Bed Strength"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, totalBed: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Floor Height (3.6 meter (min.))</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.floorHeight ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.floorHeight} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Floor Height"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, floorHeight: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">AC Sharing/Non AC sharing/General/Day care/Labor room/Dialysis beds (% of total Bed)</label>
                                {!generalEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.bedDetails?.sharingAC ?? "-"}</p>}
                                {generalEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.bedDetails?.sharingAC} type="number" onWheel={e => e.currentTarget.blur()} placeholder="Enter Sharing A/C"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, sharingAC: e.target.value}}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                        </Grid>
                    </div>
                </ScrollArea>
            </div>
            </>}

            {activePage==="account" && <>
            <div className="border-1 border-[#ACACAC] rounded-[0.5rem] overflow-hidden">
                <div className="bg-[#39B54A] p-1 sm:p-1.5 rounded-t-[0.5rem] flex items-center justify-between">
                    <h3 className="text-[0.7rem] md:text-[0.8rem] text-[#FFFFFF] font-semibold">Account Information</h3>
                    {!accountEditFlag && <EditIcon className="text-[#FFFFFF] cursor-pointer" width={16} height={16} onClick={()=>{setAccountEditFlag(true); setPostData(data)}}/>}
                    {accountEditFlag && <div className="flex items-center gap-2 mr-2">
                        <CheckIcon className="text-[#FFFFFF] cursor-pointer" width={20} height={20} onClick={()=>handleUpdateHospitalData()} />
                        <CloseIcon className="text-[#FFFFFF] cursor-pointer" width={10} height={10} onClick={()=>setAccountEditFlag(false)} />
                    </div>}
                </div>
                <ScrollArea h={"calc(100vh - 7.5rem - 46px - 1rem)"} className="!bg-[#FFFFFF]" scrollbarSize={6}>
                    <div className="p-2 sm:p-3 md:p-4">
                        <Grid grow>
                            <div className="flex items-center justify-between w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">Hospital Beneficiary Details</h4>
                            </div>
                            {data?.dpaAccount?.benificiaries && data?.dpaAccount?.benificiaries?.length > 0 && data?.dpaAccount?.benificiaries?.map(item => (
                                <>
                                    <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                        <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Beneficiary Name</label>
                                        <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{item.beneName ?? "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                        <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Beneficiary Mobile</label>
                                        <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{item.beneMobile ?? "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                        <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Beneficiary Email</label>
                                        <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{item.beneEmail ?? "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                        <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Beneficiary Code</label>
                                        <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{item.beneCode ?? "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                        <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Beneficiary IFSC</label>
                                        <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{item.beneIfsc ?? "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                        <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Beneficiary Account Number</label>
                                        <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{item.beneAccount ?? "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <div className="h-[1px] bg-[#D6D6D6]" />
                                    </Grid.Col>
                                </>
                            ))}

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max mt-8">Hospital DPA Account Details</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Bank Type</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.type ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Bank Name</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.bankName ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">A/C Number</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.accountNumber ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">IFSC Code</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.ifsc ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">A/C Holder Name</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.accountHolderName ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Cutomer ID</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.customerId ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Maker ID</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.makerId ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Checker ID</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.checkerId ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Mobile Number</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.mobileNumber ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Email</label>
                                <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dpaAccount?.email ?? "-"}</p>
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">Cancelled Cheque</label>
                                {data?.hospitalDetails?.profileDocuments?.cancelledCheque && <a className="block text-[#3E97FF] text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer">View</a>}
                                {!data?.hospitalDetails?.profileDocuments?.cancelledCheque && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                            </Grid.Col>

                            <div className="w-full">
                                <h4 className="bg-[#C6E6FF] px-1.5 py-0.5 text-[#2C2B2B] text-[0.6rem] md:text-[0.75rem] font-semibold my-4 w-max">PAN & GST Details</h4>
                            </div>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">PAN Number</label>
                                {!accountEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.panNumber ?? "-"}</p>}
                                {accountEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.panNumber} placeholder="Enter PAN Number"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, panNumber: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">PAN Holder Name</label>
                                {!accountEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.panHolderName ?? "-"}</p>}
                                {accountEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.panHolderName} placeholder="Enter PAN Holder Name"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, panHolderName: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">PAN Card</label>
                                {data?.hospitalDetails?.profileDocuments?.panCard && 
                                <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                    onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.panCard}`)}
                                >
                                    View
                                </span>}
                                {!data?.hospitalDetails?.profileDocuments?.panCard && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">GST Number</label>
                                {!accountEditFlag && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.hospitalDetails?.gstNumber ?? "-"}</p>}
                                {accountEditFlag && <TextInput size="xs" value={postData?.hospitalDetails?.gstNumber} placeholder="Enter GST Number"
                                    onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, gstNumber: e.target.value}})}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                    }}
                                />}
                            </Grid.Col>
                            <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                                <label className="text-[#7D7A7A] text-[0.6rem] md:text-[0.7rem] font-semibold">GST Certificate</label>
                                {data?.hospitalDetails?.profileDocuments?.gstCertificate && 
                                <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                    onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.gstCertificate}`)}
                                >
                                    View
                                </span>}
                                {!data?.hospitalDetails?.profileDocuments?.gstCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                            </Grid.Col>
                        </Grid>
                    </div>
                </ScrollArea>
            </div>
            </>}

            {activePage==="document" && <>
            <div className="border-1 border-[#ACACAC] rounded-[0.5rem] overflow-hidden">
                <div className="bg-[#39B54A] p-1 sm:p-1.5 rounded-t-[0.5rem] flex items-center justify-between">
                    <h3 className="text-[0.7rem] md:text-[0.8rem] text-[#FFFFFF] font-semibold">Documents</h3>
                    <Button size="compact-xs" leftSection={<CloseCircleIcon className="rotate-45" width={13} height={13} />} classNames={{
                        label: "!text-[#FFFFFF] !text-[0.6rem] md:!text-[0.75rem] !font-normal",
                        root: "!bg-transparent !rounded-none",
                    }} onClick={()=>setOpenDocModal(true)}>
                        Add More
                    </Button>
                </div>
                <ScrollArea h={"calc(100vh - 7.5rem - 46px - 1rem)"} className="!bg-[#FFFFFF]" scrollbarSize={6}>
                    {/* table layout for large screens */}
                    <div className="hidden md:block">
                        <Table verticalSpacing={10} horizontalSpacing={12} stickyHeaderOffset={0} stickyHeader>
                            <Table.Thead bg={"#D8F5FF"}>
                                <Table.Tr className="text-[#0F3D46] text-[0.75rem] font-semibold">
                                    <Table.Td className="text-center">S No.</Table.Td>
                                    <Table.Td className="min-w-[20rem]">Document Name</Table.Td>
                                    <Table.Td className="text-center min-w-[10rem]">Uploaded On</Table.Td>
                                    <Table.Td className="text-center">Type</Table.Td>
                                    <Table.Td className="text-center">View</Table.Td>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                    <Table.Td className="text-center">1.</Table.Td>
                                    <Table.Td>Hospital ROHINI</Table.Td>
                                    <Table.Td className="text-center">{data?.hospitalDetails?.profileDocuments?.rohiniCertificate ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.rohiniCertificate) : "-"}</Table.Td>
                                    <Table.Td className="text-center">PDF</Table.Td>
                                    <Table.Td className="text-center">
                                        {data?.hospitalDetails?.profileDocuments?.rohiniCertificate && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.rohiniCertificate}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.rohiniCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                    <Table.Td className="text-center">2.</Table.Td>
                                    <Table.Td>Hospital Registration Certificate</Table.Td>
                                    <Table.Td className="text-center">{data?.hospitalDetails?.profileDocuments?.registrationCertificate ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.registrationCertificate) : "-"}</Table.Td>
                                    <Table.Td className="text-center">PDF</Table.Td>
                                    <Table.Td className="text-center">
                                        {data?.hospitalDetails?.profileDocuments?.registrationCertificate && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.registrationCertificate}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.registrationCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                    <Table.Td className="text-center">3.</Table.Td>
                                    <Table.Td>Hospital Tariff List</Table.Td>
                                    <Table.Td className="text-center">{data?.hospitalDetails?.profileDocuments?.tarrifList ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.tarrifList) : "-"}</Table.Td>
                                    <Table.Td className="text-center">PDF</Table.Td>
                                    <Table.Td className="text-center">
                                        {data?.hospitalDetails?.profileDocuments?.tarrifList && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.tarrifList}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.tarrifList && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                    <Table.Td className="text-center">4.</Table.Td>
                                    <Table.Td>Hospital Cancelled Cheque</Table.Td>
                                    <Table.Td className="text-center">{data?.hospitalDetails?.profileDocuments?.cancelledCheque ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.cancelledCheque) : "-"}</Table.Td>
                                    <Table.Td className="text-center">PDF</Table.Td>
                                    <Table.Td className="text-center">
                                        {data?.hospitalDetails?.profileDocuments?.cancelledCheque && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.cancelledCheque}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.cancelledCheque && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                    <Table.Td className="text-center">5.</Table.Td>
                                    <Table.Td>Hospital PAN Card</Table.Td>
                                    <Table.Td className="text-center">{data?.hospitalDetails?.profileDocuments?.panCard ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.panCard) : "-"}</Table.Td>
                                    <Table.Td className="text-center">PDF</Table.Td>
                                    <Table.Td className="text-center">
                                        {data?.hospitalDetails?.profileDocuments?.panCard && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.panCard}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.panCard && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                    <Table.Td className="text-center">6.</Table.Td>
                                    <Table.Td>Hospital GST Certificate</Table.Td>
                                    <Table.Td className="text-center">{data?.hospitalDetails?.profileDocuments?.gstCertificate ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.gstCertificate) : "-"}</Table.Td>
                                    <Table.Td className="text-center">PDF</Table.Td>
                                    <Table.Td className="text-center">
                                        {data?.hospitalDetails?.profileDocuments?.gstCertificate && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.gstCertificate}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.gstCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </Table.Td>
                                </Table.Tr>
                                {data?.hospitalDetails?.profileDocuments?.otherDocuments && data?.hospitalDetails?.profileDocuments?.otherDocuments.length > 0 && data?.hospitalDetails?.profileDocuments?.otherDocuments.map((item, idx) => (
                                    <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium" key={item.docUrl + Math.random().toString()}>
                                        <Table.Td className="text-center">{idx + 7}.</Table.Td>
                                        <Table.Td>{item.name}</Table.Td>
                                        <Table.Td className="text-center">{item.date ? dayjs(item.date).format("DD-MMM-YYYY") : "-"}</Table.Td>
                                        <Table.Td className="text-center">PDF</Table.Td>
                                        <Table.Td className="text-center">
                                            {item.docUrl &&
                                            <div className="flex items-center justify-center gap-4">
                                                <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                                    onClick={()=>setDocumentUrl(`${item.docUrl}`)}
                                                >
                                                    View
                                                </span>
                                            </div>}
                                            {!item.docUrl && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </div>

                    {/* accordion layout for smaller screens */}
                    <div className="p-1 md:hidden">
                        <Accordion classNames={{
                            item: "!border-1 !border-[#CECECE] !rounded-[0.4rem] mb-[0.5rem] !bg-[#FFFFFF]",
                        }}>
                            <Accordion.Item value="hospital rohini">
                                <Accordion.Control>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">1.</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">Hospital RIOHINI</p>
                                    </div>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{data?.hospitalDetails?.profileDocuments?.rohiniCertificate ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.rohiniCertificate) : "-"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View</p>
                                        {data?.hospitalDetails?.profileDocuments?.rohiniCertificate && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.rohiniCertificate}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.rohiniCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </div>
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="hospital registration certificate">
                                <Accordion.Control>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">2.</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">Hospital Registration Certificate</p>
                                    </div>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{data?.hospitalDetails?.profileDocuments?.registrationCertificate ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.registrationCertificate) : "-"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View</p>
                                        {data?.hospitalDetails?.profileDocuments?.registrationCertificate && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.registrationCertificate}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.registrationCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </div>
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="hospital tariff">
                                <Accordion.Control>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">3.</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">Hospital Tariff List</p>
                                    </div>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{data?.hospitalDetails?.profileDocuments?.tarrifList ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.tarrifList) : "-"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View</p>
                                        {data?.hospitalDetails?.profileDocuments?.tarrifList && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.tarrifList}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.tarrifList && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </div>
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="hospital cancelled">
                                <Accordion.Control>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">4.</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">Hospital Cancelled Cheque</p>
                                    </div>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{data?.hospitalDetails?.profileDocuments?.cancelledCheque ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.cancelledCheque) : "-"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View</p>
                                        {data?.hospitalDetails?.profileDocuments?.cancelledCheque && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.cancelledCheque}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.cancelledCheque && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </div>
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="hospital pan card">
                                <Accordion.Control>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">5.</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">Hospital PAN Card</p>
                                    </div>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{data?.hospitalDetails?.profileDocuments?.panCard ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.panCard) : "-"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View</p>
                                        {data?.hospitalDetails?.profileDocuments?.panCard && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.panCard}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.panCard && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </div>
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="hospital gst certificate">
                                <Accordion.Control>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">6.</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">Hospital GST Certificate</p>
                                    </div>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{data?.hospitalDetails?.profileDocuments?.gstCertificate ? getDateFromUrl(data?.hospitalDetails?.profileDocuments?.gstCertificate) : "-"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View</p>
                                        {data?.hospitalDetails?.profileDocuments?.gstCertificate && 
                                        <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                            onClick={()=>setDocumentUrl(`${data?.hospitalDetails?.profileDocuments?.gstCertificate}`)}
                                        >
                                            View
                                        </span>}
                                        {!data?.hospitalDetails?.profileDocuments?.gstCertificate && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                    </div>
                                </Accordion.Panel>
                            </Accordion.Item>
                            {data?.hospitalDetails?.profileDocuments?.otherDocuments && data?.hospitalDetails?.profileDocuments?.otherDocuments.length > 0 && data?.hospitalDetails?.profileDocuments?.otherDocuments.map((item, idx) => (
                                <Accordion.Item value="hospital gst certificate" key={item.docUrl + Math.random().toString()}>
                                    <Accordion.Control>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{idx + 7}.</p>
                                            <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{item.name ?? "-"}</p>
                                        </div>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                            <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{item.date ? dayjs(item.date).format("DD-MMM-YYYY") : "-"}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                            <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                        </div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View</p>
                                            {item.docUrl && 
                                            <div className="flex items-center justify-center gap-4">
                                                <span className="text-[#3E97FF] block text-[0.7rem] md:text-[0.8rem] font-medium cursor-pointer"
                                                    onClick={()=>setDocumentUrl(`${item.docUrl}`)}
                                                    >
                                                    View
                                                </span>
                                            </div>}
                                            {!item.docUrl && <p className="text-[#2C2B2B] text-[0.7rem] md:text-[0.8rem] font-medium">-</p>}
                                        </div>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </div>
                </ScrollArea>
            </div>
            </>}
        </main>

        {/* view document modal */}
        {documentUrl && <ViewDocModal url={documentUrl} setUrl={setDocumentUrl} />}

        {/* add document modal */}
        <Modal opened={openDocModal} onClose={() => handleCloseDocModal()} size={"60vw"} fullScreen={window.innerWidth <= 768}
            title="Upload Hospital Documents" classNames={{
                content: "!rounded-none md:!rounded-[0.5rem]",
                header: "!bg-[#39B54A] !py-0 !min-h-[2rem]",
                title: "!text-[#FFFFFF] !text-[0.9rem] !font-semibold",
                close: "!text-[#FFFFFF] hover:!bg-transparent",
            }}
        >
            <Grid className="mt-4">
                <Grid.Col span={{base: 12, sm: 6, md: 6, lg: 6}}>
                    <FileInput label="ROHINI Certificate" placeholder="Upload ROHINI Certificate" clearable accept="application/pdf" 
                        rightSection={!profileDocuments.rohiniCertificate && <UploadIcon className="text-[#3E97FF]" />}
                        value={profileDocuments.rohiniCertificate} onChange={e => {
                            if(e) {
                                if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                    uploadRohiniCertificate(e)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                deleteRohiniCerti(hospitalDocuments.rohiniCertificate)
                            }
                        }}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 6, md: 6, lg: 6}}>
                    <FileInput label="Registration Certificate" placeholder="Upload Registration Certificate" clearable accept="application/pdf" 
                        rightSection={!profileDocuments.registrationCertificate && <UploadIcon className="text-[#3E97FF]" />}
                        value={profileDocuments.registrationCertificate} onChange={e => {
                            if(e) {
                                if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                    uploadRegistrationCertificate(e)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                deleteRegistrationCerti(hospitalDocuments.registrationCertificate)
                            }
                        }}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 6, md: 6, lg: 6}}>
                    <FileInput label="Tariff List" placeholder="Upload Tariff List" clearable accept="application/pdf" 
                        rightSection={!profileDocuments.tarrifList && <UploadIcon className="text-[#3E97FF]" />}
                        value={profileDocuments.tarrifList} onChange={e => {
                            if(e) {
                                if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                    uploadTariffList(e)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                deleteTariff(hospitalDocuments.tarrifList)
                            }
                        }}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 6, md: 6, lg: 6}}>
                    <FileInput label="Cancelled Cheque" placeholder="Upload Cancelled Cheque" clearable accept="application/pdf" 
                        rightSection={!profileDocuments.cancelledCheque && <UploadIcon className="text-[#3E97FF]" />}
                        value={profileDocuments.cancelledCheque} onChange={e => {
                            if(e) {
                                if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                    uploadCancelledCheque(e)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                deleteCancelledCheque(hospitalDocuments.cancelledCheque)
                            }
                        }}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 6, md: 6, lg: 6}}>
                    <FileInput label="PAN Card" placeholder="Upload PAN Card" clearable accept="application/pdf" 
                        rightSection={!profileDocuments.panCard && <UploadIcon className="text-[#3E97FF]" />}
                        value={profileDocuments.panCard} onChange={e => {
                            if(e) {
                                if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                    uploadPanCard(e)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                deletePanCard(hospitalDocuments.panCard)
                            }
                        }}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 6, md: 6, lg: 6}}>
                    <FileInput label="GST Certificate" placeholder="Upload GST Certificate" clearable accept="application/pdf" 
                        rightSection={!profileDocuments.gstCertificate && <UploadIcon className="text-[#3E97FF]" />}
                        value={profileDocuments.gstCertificate} onChange={e => {
                            if(e) {
                                if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                    uploadGstCertificate(e)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                deleteGstCerti(hospitalDocuments.gstCertificate)
                            }
                        }}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
            </Grid>

            {/* other docs */}
            <Grid className="mt-4" align="end">
                <Grid.Col span={{base:12, sm:6, md:7, lg:7}}>
                    <TextInput label="Document Name" placeholder="Write..."
                        value={profileDocuments.otherDocname} onChange={e => setProfileDocuments({...profileDocuments, otherDocname: e.target.value})}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:3, md:3, lg:3}}>
                    <FileInput label="Document" placeholder="Upload Document" clearable
                        rightSection={!profileDocuments.otherDoc && <UploadIcon className="text-[#3E97FF]" />}
                        accept="application/pdf" value={profileDocuments.otherDoc} onChange={e => {
                            if(e) {
                                if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                    setProfileDocuments({...profileDocuments, otherDoc: e})
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                setProfileDocuments({...profileDocuments, otherDoc: null})
                            }
                        }}
                        classNames={{
                            label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                            input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:3, md:2, lg:2}}>
                    <Button fullWidth size="compact-xs" h={"2.25rem"} classNames={{
                        label: "!text-[#FFFFFF] !text-[0.6rem] md:!text-[0.75rem] !font-medium",
                        root: "!bg-[#39B54A] !rounded-[0.25rem]",
                    }} onClick={()=>uploadOtherDoc()}>
                        Add
                    </Button>
                </Grid.Col>
                {hospitalDocuments.otherDocuments && hospitalDocuments.otherDocuments.length > 0 && hospitalDocuments.otherDocuments.map(doc => (
                    <>
                    <Grid.Col span={{base:12, sm:6, md:7, lg:7}}>
                        <TextInput label="Uploaded Document Name" value={doc.name} disabled
                            classNames={{
                                label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={{base:12, sm:3, md:3, lg:3}}>
                        <Button fullWidth size="compact-xs" h={"2.25rem"} classNames={{
                            label: "!text-[0.6rem] md:!text-[0.75rem] !text-[#39B54A] !font-medium",
                            root: "!bg-transparent !rounded-[0.25rem] !border-1 !border-[#39B54A]",
                        }} onClick={()=>setDocumentUrl(doc.docUrl)}>
                            View
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={{base:12, sm:3, md:2, lg:2}}>
                        <Button fullWidth size="compact-xs" h={"2.25rem"} classNames={{
                            label: "!text-[0.6rem] md:!text-[0.75rem] !text-[#EE443F] !font-medium",
                            root: "!bg-transparent !rounded-[0.25rem] !border-1 !border-[#EE443F]",
                        }} onClick={()=>deleteOtherDoc(doc.docUrl)}>
                            Remove
                        </Button>
                    </Grid.Col>
                    </>
                ))}
            </Grid>
            <div className="flex items-center justify-between mt-20">
                <Button size="sm" w={100} variant="default" className="!border-[#39B54A] !text-[#39B54A]" radius={6} onClick={()=>handleCloseDocModal()}>
                    Cancel
                </Button>
                <Button size="sm" w={100} bg={"#39B54A"} className="!text-[#FFFFFF]" radius={6} onClick={()=>handleUpdateHospitalDocuments()}>
                    Save
                </Button>
            </div>
        </Modal>
        </>
    )
}

export default HospitalDetails;