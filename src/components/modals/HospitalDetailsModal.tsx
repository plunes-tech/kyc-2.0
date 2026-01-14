import React, { useState } from "react";
import { Hospital, HospitalUpdate } from "../../features/hospital/types";
import { Accordion, Button, FileInput, Grid, Modal, ScrollArea, Select, Table, TextInput } from "@mantine/core";
import TermsAndCondition from "./TermsAndCondition";
import { notifications } from "@mantine/notifications";
import useUploads from "../../hooks/useUploads";
import useHospital from "../../hooks/useHospital";
import axios from "axios";
import { ChevronDownIcon, DeleteIcon, UploadIcon } from "../../assets/icons";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import ViewDocModal from "./ViewDocModal";
import { removeEmptyArr, removeEmptyObj, removeNulls } from "../../utils/utilits";
import { accountInfoSchema, generalInfoSchema } from "../../features/hospital/schema";

const getDateFromUrl = (url: string): string => {
    const parts = url.split("/")
    const endString = parts[parts.length - 1].split(".")
    let fileName = endString[0]
    let nameParts = fileName.split("-")
    let date = nameParts[nameParts.length - 1]
    if(isNaN(Number(date))) return ""
    return dayjs(Number(date)).format("DD-MMM-YYYY")
}

const HospitalDetailsModal: React.FC<{initialData?: HospitalUpdate}> = ({initialData}) => {

    const iniTialFormData: Hospital = {
        contactPerson: initialData?.contactPerson ?? "",
        contactPersonContact: initialData?.contactPersonContact ?? "",
        contactPersonEmail: initialData?.contactPersonEmail ?? "",
        email: initialData?.email ?? "",
        marketingTpaHead: initialData?.marketingTpaHead ?? "",
        mobileNumber: initialData?.mobileNumber ?? "",
        name: initialData?.name ?? "",
        platformSubscriptionFee: initialData?.platformSubscriptionFee ?? null,
        rohiniExpiryDate: initialData?.rohiniExpiryDate ?? "",
        rohiniId: initialData?.rohiniId ?? "",
        tpaHeadContact: initialData?.tpaHeadContact ?? "",
        tpaHeadDesignation: initialData?.tpaHeadDesignation ?? "",
        tpaHeadEmail: initialData?.tpaHeadEmail ?? "",
        alternateMobileNumber: initialData?.alternateMobileNumber ?? "",
        hospitalDetails: {
            accountsContactPerson: initialData?.hospitalDetails?.accountsContactPerson ?? "",
            accountsContactPersonEmail: initialData?.hospitalDetails?.accountsContactPersonEmail ?? "",
            address: initialData?.hospitalDetails?.address ?? "",
            ambulance: initialData?.hospitalDetails?.ambulance ?? "",
            bioGases: initialData?.hospitalDetails?.bioGases ?? "",
            bioWaste: initialData?.hospitalDetails?.bioWaste ?? "",
            bloodBank: initialData?.hospitalDetails?.bloodBank ?? "",
            bloodGuidelines: initialData?.hospitalDetails?.bloodGuidelines ?? "",
            buildingAge: initialData?.hospitalDetails?.buildingAge ?? "",
            cardiology: initialData?.hospitalDetails?.cardiology ?? "",
            careType: initialData?.hospitalDetails?.careType ?? "",
            city: initialData?.hospitalDetails?.city ?? "",
            colorDoppler: initialData?.hospitalDetails?.colorDoppler ?? "",
            ctScan: initialData?.hospitalDetails?.ctScan ?? "",
            dialysisUnit: initialData?.hospitalDetails?.dialysisUnit ?? "",
            dietary: initialData?.hospitalDetails?.dietary ?? "",
            docConsultant: initialData?.hospitalDetails?.docConsultant ?? "",
            doctorAvailability: initialData?.hospitalDetails?.doctorAvailability ?? "",
            doctorPatientRatio: initialData?.hospitalDetails?.doctorPatientRatio ?? "",
            doctorsTotal: initialData?.hospitalDetails?.doctorsTotal ?? "",
            earthquakeSafety: initialData?.hospitalDetails?.earthquakeSafety ?? "",
            fireSafety: initialData?.hospitalDetails?.fireSafety ?? "",
            fireSafetyCerti: initialData?.hospitalDetails?.fireSafetyCerti ?? "",
            floorHeight: initialData?.hospitalDetails?.floorHeight ?? "",
            gastroenterology: initialData?.hospitalDetails?.gastroenterology ?? "",
            generalInfo: initialData?.hospitalDetails?.generalInfo ?? "",
            generalMedicine: initialData?.hospitalDetails?.generalMedicine ?? "",
            generalSurgery: initialData?.hospitalDetails?.generalSurgery ?? "",
            hepaFilters: initialData?.hospitalDetails?.hepaFilters ?? "",
            hosInfoSystem: initialData?.hospitalDetails?.hosInfoSystem ?? "",
            hospitalTariff: initialData?.hospitalDetails?.hospitalTariff ?? "",
            housekeeping: initialData?.hospitalDetails?.housekeeping ?? "",
            inHouseLab: initialData?.hospitalDetails?.inHouseLab ?? "",
            laminarFlow: initialData?.hospitalDetails?.laminarFlow ?? "",
            laundry: initialData?.hospitalDetails?.laundry ?? "",
            majorNos: initialData?.hospitalDetails?.majorNos ?? "",
            medicalENT: initialData?.hospitalDetails?.medicalENT ?? "",
            medicalOfficers: initialData?.hospitalDetails?.medicalOfficers ?? "",
            medicalSuperintendent: initialData?.hospitalDetails?.medicalSuperintendent ?? "",
            medicalSuperintendentContact: initialData?.hospitalDetails?.medicalSuperintendentContact ?? "",
            medicalSuperintendentEmail: initialData?.hospitalDetails?.medicalSuperintendentEmail ?? "",
            minorNos: initialData?.hospitalDetails?.minorNos ?? "",
            monitoring: initialData?.hospitalDetails?.monitoring ?? "",
            mouSiginingAuthority: initialData?.hospitalDetails?.mouSiginingAuthority ?? "",
            mouSiginingDate: initialData?.hospitalDetails?.mouSiginingDate ?? "",
            mri: initialData?.hospitalDetails?.mri ?? "",
            municipalRecognistion: initialData?.hospitalDetails?.municipalRecognistion ?? "",
            neurology: initialData?.hospitalDetails?.neurology ?? "",
            neurosurgery: initialData?.hospitalDetails?.neurosurgery ?? "",
            nursePatientRatio: initialData?.hospitalDetails?.nursePatientRatio ?? "",
            nursingStaff: initialData?.hospitalDetails?.nursingStaff ?? "",
            obstetricGynaecology: initialData?.hospitalDetails?.obstetricGynaecology ?? "",
            oncology: initialData?.hospitalDetails?.oncology ?? "",
            opthalmology: initialData?.hospitalDetails?.opthalmology ?? "",
            orthopedics: initialData?.hospitalDetails?.orthopedics ?? "",
            otZones: initialData?.hospitalDetails?.otZones ?? "",
            ownership: initialData?.hospitalDetails?.ownership ?? "",
            paediatricsSurgery: initialData?.hospitalDetails?.paediatricsSurgery ?? "",
            paramedicalStaff: initialData?.hospitalDetails?.paramedicalStaff ?? "",
            parkingSpace: initialData?.hospitalDetails?.parkingSpace ?? "",
            pestManagement: initialData?.hospitalDetails?.pestManagement ?? "",
            pharmacy: initialData?.hospitalDetails?.pharmacy ?? "",
            pinCode: initialData?.hospitalDetails?.pinCode ?? "",
            plasticSurgery: initialData?.hospitalDetails?.plasticSurgery ?? "",
            ppnStatus: initialData?.hospitalDetails?.ppnStatus ?? "",
            preparationScrub: initialData?.hospitalDetails?.preparationScrub ?? "",
            registrationAuthority: initialData?.hospitalDetails?.registrationAuthority ?? "",
            registrationDate: initialData?.hospitalDetails?.registrationDate ?? "",
            registrationNumber: initialData?.hospitalDetails?.registrationNumber ?? "",
            representativeDesignation: initialData?.hospitalDetails?.representativeDesignation ?? "",
            representativeName: initialData?.hospitalDetails?.representativeName ?? "",
            roboticSurgery: initialData?.hospitalDetails?.roboticSurgery ?? "",
            specializedOT: initialData?.hospitalDetails?.specializedOT ?? "",
            state: initialData?.hospitalDetails?.state ?? "",
            surgicalCardiology: initialData?.hospitalDetails?.surgicalCardiology ?? "",
            surgicalENT: initialData?.hospitalDetails?.surgicalENT ?? "",
            surgicalGastroenterology: initialData?.hospitalDetails?.surgicalGastroenterology ?? "",
            surgicalObstetricGynaecology: initialData?.hospitalDetails?.surgicalObstetricGynaecology ?? "",
            surgicalUrology: initialData?.hospitalDetails?.surgicalUrology ?? "",
            totalArea: initialData?.hospitalDetails?.totalArea ?? "",
            totalStaff: initialData?.hospitalDetails?.totalStaff ?? "",
            typeOfHospital: initialData?.hospitalDetails?.typeOfHospital ?? "",
            urology: initialData?.hospitalDetails?.urology ?? "",
            usg: initialData?.hospitalDetails?.usg ?? "",
            xRay: initialData?.hospitalDetails?.xRay ?? "",
            accountsContactPersonContact: initialData?.alternateMobileNumber,
            panNumber: initialData?.hospitalDetails?.panNumber ?? "",
            panHolderName: initialData?.hospitalDetails?.panHolderName ?? "",
            gstNumber: initialData?.hospitalDetails?.gstNumber ?? "",
            bedDetails: {
                bedCapacity: initialData?.hospitalDetails?.bedDetails?.bedCapacity ?? "",
                bedsDistance: initialData?.hospitalDetails?.bedDetails?.bedsDistance ?? "",
                dayCareBeds: initialData?.hospitalDetails?.bedDetails?.dayCareBeds ?? "",
                icuNicu: initialData?.hospitalDetails?.bedDetails?.icuNicu ?? "",
                inPatientBeds: initialData?.hospitalDetails?.bedDetails?.inPatientBeds ?? "",
                nonBedArea: initialData?.hospitalDetails?.bedDetails?.nonBedArea ?? "",
                sharingAC: initialData?.hospitalDetails?.bedDetails?.sharingAC ?? "",
                singleAc: initialData?.hospitalDetails?.bedDetails?.singleAc ?? "",
                totalBed: initialData?.hospitalDetails?.bedDetails?.totalBed ?? "",
            },
            profileDocuments: {
                cancelledCheque: initialData?.hospitalDetails?.profileDocuments?.cancelledCheque ?? "",
                gstCertificate: initialData?.hospitalDetails?.profileDocuments?.gstCertificate ?? "",
                panCard: initialData?.hospitalDetails?.profileDocuments?.panCard ?? "",
                registrationCertificate: initialData?.hospitalDetails?.profileDocuments?.registrationCertificate ?? "",
                rohiniCertificate: initialData?.hospitalDetails?.profileDocuments?.rohiniCertificate ?? "",
                tarrifList: initialData?.hospitalDetails?.profileDocuments?.tarrifList ?? "",
                otherDocuments: initialData?.hospitalDetails?.profileDocuments?.otherDocuments ?? [],
            },
        },
    }

    const { addHospital } = useHospital()
    const { getPresignedUrl } = useUploads()

    const [openTermsCondition, setOpenTermsCondition] = useState(true)
    const [openDetailsModal, setOpenDetailsModal] = useState(false)
    const [postData, setPostData] = useState<Hospital>(iniTialFormData)

    const [tabName, setTabName] = useState("general")
    const [documentUrl, setDocumentUrl] = useState("")
    const [profileDocuments, setProfileDocuments] = useState({
        rohiniCertificate: null as File | null,
        registrationCertificate: null as File | null,
        tarrifList: null as File | null,
        cancelledCheque: null as File | null,
        panCard: null as File | null,
        gstCertifcate: null as File | null,
        otherDoc: null as File | null,
        otherDocname: "",
    })

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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            rohiniCertificate: filePath,
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            rohiniCertificate: "",
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            registrationCertificate: filePath,
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            registrationCertificate: "",
                        }
                    }
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const uploadTariffList = async (file: File | null) => {
        if(!file) return
        try {
            const fileName = file.type ==="application/pdf" ? `Hospital-tariff-list-${Date.now()}.pdf` : `Hospital-tariff-list-${Date.now()}.pdf` // add rohini id or hospital name in the filename later
            const filePath = `/${import.meta.env.VITE_AWS_HOSPITAL_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`

            const docUrl = await handleUploadFile(filePath, file)
            if(docUrl) {
                setProfileDocuments({
                    ...profileDocuments,
                    tarrifList: file
                })
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            tarrifList: filePath,
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            tarrifList: "",
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            cancelledCheque: filePath,
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            cancelledCheque: "",
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            panCard: filePath,
                        }
                    }
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
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            panCard: "",
                        }
                    }
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
                    gstCertifcate: file
                })
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            gstCertificate: filePath,
                        }
                    }
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
                    gstCertifcate: null,
                })
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            gstCertificate: "",
                        }
                    }
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
                message: "Please enter document name and select a file before adding",
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
                const newDocs = postData?.hospitalDetails?.profileDocuments?.otherDocuments ? [...postData?.hospitalDetails?.profileDocuments?.otherDocuments] : []
                newDocs.push({
                    name: profileDocuments.otherDocname,
                    docUrl: filePath,
                    date: new Date(Date.now()).toISOString(),
                })
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            otherDocuments: newDocs,
                        }
                    }
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
                let newDocs = postData?.hospitalDetails?.profileDocuments?.otherDocuments ? [...postData?.hospitalDetails?.profileDocuments?.otherDocuments] : []
                newDocs = newDocs.filter(doc => doc.docUrl !== filePath)
                setPostData({
                    ...postData,
                    hospitalDetails: {
                        ...postData?.hospitalDetails,
                        profileDocuments: {
                            ...postData?.hospitalDetails?.profileDocuments,
                            otherDocuments: newDocs,
                        }
                    }
                })
            }
        } catch (error) {
            // handle by redux
        }
    }

    const handleCreateHospitalProfile = async () => {
        if(!postData) return
        try {
            const result = await addHospital(postData)
            if(result.success) {
                setOpenDetailsModal(false)
            }
        } catch (error) {
            // handle by redux and zod
            console.log({error});
        }
    }

    const handleSetAccontPage = () => {
        let cleanedData = postData
        cleanedData = removeNulls(cleanedData)
        cleanedData = removeEmptyObj(cleanedData)
        cleanedData = removeEmptyArr(cleanedData)
        if(!generalInfoSchema.safeParse(cleanedData).success) {
            console.log(generalInfoSchema.safeParse(cleanedData));
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: generalInfoSchema.safeParse(cleanedData).error?.errors[0].message ?? "Please fill all mandatory details",
            })
        }
        setTabName("account")
    }

    const handleSetDocumentPage = () => {
        let cleanedData = postData
        cleanedData = removeNulls(cleanedData)
        cleanedData = removeEmptyObj(cleanedData)
        cleanedData = removeEmptyArr(cleanedData)
        if(!generalInfoSchema.safeParse(cleanedData).success) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: generalInfoSchema.safeParse(cleanedData).error?.errors[0].message ?? "Please fill all details",
            })
        }
        if(!accountInfoSchema.safeParse(cleanedData).success) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: accountInfoSchema.safeParse(cleanedData).error?.errors[0].message ?? "Please fill all details",
            })
        }
        setTabName("document")
    }

    const handleSubmit = () => {
        if(tabName === "general") {
            handleSetAccontPage()
        }
        if(tabName === "account") {
            handleSetDocumentPage()
        }
        if(tabName === "document") {
            handleCreateHospitalProfile()
        }
    }

    return (
        <>
        <Modal.Stack>
            {/* terms and condition modal */}
            <Modal
                opened={openTermsCondition} withCloseButton={false}
                onClose={() => {}}
                title={<div className="flex items-center justify-between">
                    <h3>Terms & Conditions</h3>
                    <Button size="compact-xs" bg={"#FFFFFF"} w={80} h={24} 
                        classNames={{
                            root: "!border-1 !border-[#E0063A]",
                            label: "!text-[#E0063A] !font-medium"
                        }}
                    >
                        Log out
                    </Button>
                </div>}
                size={innerWidth >= 820 ? "80%" : '90%'}
                fullScreen={innerWidth <= 768}
                classNames={{
                    content: "!rounded-none",
                    header: "!bg-[#3E97FF] !rounded-none !py-2 !px-3 !min-h-0",
                    title: "!text-[#FFFFFF] !font-medium !text-[0.9rem] !w-full",
                }}
            >
                <TermsAndCondition 
                    postData={postData} 
                    setPostData={setPostData} 
                    setOpenDetailsModal={setOpenDetailsModal}
                    setOpenTermsCondition={setOpenTermsCondition}
                />
            </Modal>

            {/* details modal */}
            <Modal
                opened={openDetailsModal} withCloseButton={false}
                onClose={() => {}}
                title={<div className="flex items-center justify-between">
                    <h3>Hospital Details</h3>
                    <Button size="compact-xs" bg={"#FFFFFF"} w={80} h={24} 
                        classNames={{
                            root: "!border-1 !border-[#E0063A]",
                            label: "!text-[#E0063A] !font-medium"
                        }}
                    >
                        Log out
                    </Button>
                </div>}
                size={innerWidth >= 820 ? "80%" : '90%'}
                fullScreen={innerWidth <= 768}
                classNames={{
                    content: "!rounded-none md:!rounded-[0.5rem]",
                    header: "!bg-[#43B75D] !py-2 !px-3 !min-h-0 !rounded-none",
                    title: "!text-[#FFFFFF] !font-medium !text-[0.9rem] !w-full",
                    body: "!p-0",
                }}
            >
                <div className="flex items-center gap-x-10 gap-y-4 flex-wrap mb-8 mt-4 px-2 sm:px-3 md:px-4">
                    <p className={`cursor-pointer font-semibold text-[0.8rem] sm:text-[0.9rem] xl:text-[1rem] hover:text-[#43B75D] ${tabName==="general" ? "text-[#43B75D] underline underline-offset-6" : "text-[#B3B3B3]"} transition-all duration-150`}
                        onClick={()=>{
                            setTabName("general")
                        }}
                    >
                        General Details
                    </p>
                    <p className={`cursor-pointer font-semibold text-[0.8rem] sm:text-[0.9rem] xl:text-[1rem] hover:text-[#43B75D] ${tabName==="account" ? "text-[#43B75D] underline underline-offset-6" : "text-[#B3B3B3]"} transition-all duration-150`}
                        onClick={()=>handleSetAccontPage()}
                    >
                        Account Details
                    </p>
                    <p className={`cursor-pointer font-semibold text-[0.8rem] sm:text-[0.9rem] xl:text-[1rem] hover:text-[#43B75D] ${tabName==="document" ? "text-[#43B75D] underline underline-offset-6" : "text-[#B3B3B3]"} transition-all duration-150`}
                        onClick={()=>handleSetDocumentPage()}
                    >
                        Document
                    </p>
                </div>

                {/* general details */}
                {tabName==="general" && <>
                <div className="p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, md:6, lg:6}}>
                            <TextInput withAsterisk label="ROHINI Code" placeholder="Enter ROHINI Code" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.rohiniId} onChange={e => setPostData({...postData, rohiniId: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, md:6, lg:6}}>
                            <div className="flex items-center gap-2">
                                <FileInput label="ROHINI Certificate" withAsterisk clearable rightSection={<UploadIcon className="text-[#3E97FF]" />}
                                    placeholder={`${postData?.hospitalDetails?.profileDocuments?.rohiniCertificate ? "Update" : "Upload"} ROHINI Certificate`}
                                    accept="application/pdf" value={profileDocuments.rohiniCertificate} onChange={e => {
                                        if(e && e?.size / 1024 / 1024 <= 5 && e?.type==="application/pdf") {
                                            uploadRohiniCertificate(e)
                                        } else {
                                            return notifications.show({
                                                color: "#E0063A",
                                                title: "Error",
                                                message: "Please upload PDF with size upto 5MB only.",
                                            })
                                        }
                                    }}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                    }}
                                />
                                {postData?.hospitalDetails?.profileDocuments?.rohiniCertificate && <Button size="compact-xs" h={"2.5rem"} w={100}
                                    onClick={()=>setDocumentUrl(postData?.hospitalDetails?.profileDocuments?.rohiniCertificate)}
                                    className="!bg-transparent !border-1 !border-[#3E97FF] !text-[#3E97FF]"
                                >
                                    View
                                </Button>}
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base:12, md:6, lg:6}}>
                            <TextInput withAsterisk label="Hospital Name" placeholder="Enter Hospital Name" disabled
                                value={postData?.name} onChange={(e) => {
                                    const inputValue = e.target.value
                                    const filteredValue = inputValue.replace(/[0-9]/g, '')
                                    setPostData({ ...postData, name: filteredValue })
                                }}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:6, md:2, lg:2}}>
                            <TextInput withAsterisk label="State" placeholder="Select State"
                                value={postData?.hospitalDetails?.state} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, state: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:6, md:2, lg:2}}>
                            <TextInput withAsterisk label="City" placeholder="Select City"
                                value={postData?.hospitalDetails?.city} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, city: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, md:2, lg:2}}>
                            <TextInput withAsterisk label="Pin Code" placeholder="000000" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.pinCode} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, pinCode: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Mobile No." placeholder="000-0000-000" disabled type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.mobileNumber} onChange={e => setPostData({...postData, mobileNumber: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput label="Alternate No." placeholder="000-0000-000" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.alternateMobileNumber} onChange={e => setPostData({...postData, alternateMobileNumber: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Email" placeholder="example@gmail.com" type="mail" disabled
                                value={postData?.email} onChange={e => setPostData({...postData, email: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Point Of Contact</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Contact Person" placeholder="Enter Contact Person Name"
                                value={postData?.contactPerson} onChange={e => setPostData({...postData, contactPerson: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Mobile No." placeholder="000-0000-000" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.contactPersonContact} onChange={e => setPostData({...postData, contactPersonContact: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Email" placeholder="example@gmail.com"
                                value={postData?.contactPersonEmail} onChange={e => setPostData({...postData, contactPersonEmail: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Other Related Details</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Type Of Hospital" placeholder="Select Hospital Type" 
                                rightSection={!postData?.hospitalDetails?.typeOfHospital && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.typeOfHospital} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, typeOfHospital: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                                data={[
                                    {label:"Multi Speciality", value:"Multi Speciality"},
                                    {label:"Single Speciality", value:"Single Speciality"},
                                ]}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Type Of Care" placeholder="Select Care Type" 
                                rightSection={!postData?.hospitalDetails?.careType && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.careType} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, careType: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                                data={[
                                    {label:"Primary Care", value:"Primary Care"},
                                    {label:"Secondary Care", value:"Secondary Care"},
                                    {label:"Tertiary Care", value:"Tertiary Care"},
                                ]}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="PPN Status" placeholder="Select PPN Status" 
                                rightSection={!postData?.hospitalDetails?.ppnStatus && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.ppnStatus} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ppnStatus: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                                data={[
                                    {label:"PPN", value:"PPN"},
                                    {label:"Non PPN", value:"Non PPN"},
                                ]}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Platform Subscription Fee (%)" placeholder="Enter Fee" type="number" onWheel={(e) => e.currentTarget.blur()} disabled
                                value={postData?.platformSubscriptionFee ?? undefined} onChange={e => setPostData({...postData, platformSubscriptionFee: e.target.value ? Number(e.target.value) : null})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Representative Name" placeholder="Enter Name"
                                value={postData?.hospitalDetails?.representativeName} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, representativeName: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Representative Designation" placeholder="Enter Designation"
                                value={postData?.hospitalDetails?.representativeDesignation} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, representativeDesignation: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Registration Number" placeholder="Enter Registration Number"
                                value={postData?.hospitalDetails?.registrationNumber} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, registrationNumber: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <DatePickerInput clearable size="xs" label="Registration Date" placeholder="Select Registration Date"
                                value={postData?.hospitalDetails?.registrationDate} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, registrationDate: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Registration Authority" placeholder="Enter Registration Authority"
                                value={postData?.hospitalDetails?.registrationAuthority} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, registrationAuthority: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <div className="flex items-center gap-2">
                                <FileInput label="Registration Certificate" clearable rightSection={<UploadIcon className="text-[#3E97FF]" />}
                                    placeholder={`${postData?.hospitalDetails?.profileDocuments?.registrationCertificate ? "Update" : "Upload"} Registration Certificate`}
                                    accept="application/pdf" value={profileDocuments.registrationCertificate} onChange={e => {
                                        if(e && e?.size / 1024 / 1024 <= 5 && e?.type==="application/pdf") {
                                            uploadRegistrationCertificate(e)
                                        } else {
                                            return notifications.show({
                                                color: "#E0063A",
                                                title: "Error",
                                                message: "Please upload PDF with size upto 5MB only.",
                                            })
                                        }
                                    }}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                    }}
                                />
                                {postData?.hospitalDetails?.profileDocuments?.registrationCertificate && <Button size="compact-xs" h={"2.5rem"} w={100}
                                    onClick={()=>setDocumentUrl(postData?.hospitalDetails?.profileDocuments?.registrationCertificate)}
                                    className="!bg-transparent !border-1 !border-[#3E97FF] !text-[#3E97FF]"
                                >
                                    View
                                </Button>}
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Medical Superintendent Name" placeholder="Enter Name"
                                value={postData?.hospitalDetails?.medicalSuperintendent} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalSuperintendent: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Medical Superintendent Contact" placeholder="000-0000-000" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.medicalSuperintendentContact} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalSuperintendentContact: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Medical Superintendent Email" placeholder="example@email.com"
                                value={postData?.hospitalDetails?.medicalSuperintendentEmail} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalSuperintendentEmail: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>

                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="TPA Head Name" placeholder="Enter Name"
                                value={postData?.marketingTpaHead} onChange={e => setPostData({...postData, marketingTpaHead: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="TPA Head Contact" placeholder="000-0000-000" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.tpaHeadContact} onChange={e => setPostData({...postData, tpaHeadContact: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="TPA Head Email" placeholder="example@email.com"
                                value={postData?.tpaHeadEmail} onChange={e => setPostData({...postData, tpaHeadEmail: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="TPA Head Designation" placeholder="Enter Designation"
                                value={postData?.tpaHeadDesignation} onChange={e => setPostData({...postData, tpaHeadDesignation: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <DatePickerInput clearable size="xs" label="MOU signing Date" placeholder="Select Date"
                                value={postData?.hospitalDetails?.mouSiginingDate} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, mouSiginingDate: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="MOU signing Authority" placeholder="Enter Name"
                                value={postData?.hospitalDetails?.mouSiginingAuthority} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, mouSiginingAuthority: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Hospital Tariff" placeholder="Enter Tariff"
                                value={postData?.hospitalDetails?.hospitalTariff} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, hospitalTariff: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <div className="flex items-center gap-2">
                                <FileInput label="Upload Tariff" rightSection={<UploadIcon className="text-[#3E97FF]" />}
                                    placeholder={`${postData?.hospitalDetails?.profileDocuments?.tarrifList ? "Update" : "Upload"} Hospital Tariff`}
                                    accept="application/pdf" value={profileDocuments.tarrifList} onChange={e => {
                                        if(e && e?.size / 1024 / 1024 <= 5 && e?.type==="application/pdf") {
                                            uploadTariffList(e)
                                        } else {
                                            return notifications.show({
                                                color: "#E0063A",
                                                title: "Error",
                                                message: "Please upload PDF with size upto 5MB only.",
                                            })
                                        }
                                    }}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                    }}
                                />
                                {postData?.hospitalDetails?.profileDocuments?.tarrifList && <Button size="compact-xs" h={"2.5rem"} w={100}
                                    onClick={()=>setDocumentUrl(postData?.hospitalDetails?.profileDocuments?.tarrifList)}
                                    className="!bg-transparent !border-1 !border-[#3E97FF] !text-[#3E97FF]"
                                >
                                    View
                                </Button>}
                            </div>
                        </Grid.Col>

                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="General Info" placeholder="General Info" 
                                rightSection={!postData?.hospitalDetails?.generalInfo && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.generalInfo} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, generalInfo: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Total Area (in Sq. Ft)" placeholder="Enter Total Area" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.totalArea} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, totalArea: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Ownership" placeholder="Select Ownership" 
                                rightSection={!postData?.hospitalDetails?.ownership && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.ownership} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ownership: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Age Of The Building" placeholder="Select Building Age" 
                                rightSection={!postData?.hospitalDetails?.buildingAge && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.buildingAge} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, buildingAge: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Operation Theaters</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Major/Nos" placeholder="Enter Major" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.majorNos} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, majorNos: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Minor/Nos" placeholder="Enter Minor" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.minorNos} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, mouSiginingAuthority: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Specialized OT's (Specify)" placeholder="Enter Specialized OT's (Specify)"
                                value={postData?.hospitalDetails?.specializedOT} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, specializedOT: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="OT Zones" placeholder="Enter OT Zones"
                                value={postData?.hospitalDetails?.otZones} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, otZones: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">OT Rooms</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Preparation, Pre & Post-Operative, Scrub" placeholder="Enter Preparation, Pre & Post-Operative, Scrub"
                                value={postData?.hospitalDetails?.preparationScrub} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, preparationScrub: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Laminar Flow" placeholder="Enter Laminar Flow"
                                value={postData?.hospitalDetails?.laminarFlow} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, laminarFlow: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Infection Control</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Periodical checks for pest management" placeholder="Enter Pest Management"
                                value={postData?.hospitalDetails?.pestManagement} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, pestManagement: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Periodical monitoring and audits for Hospital acquired infections" placeholder="Enter Infection Monitoring"
                                value={postData?.hospitalDetails?.monitoring} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, monitoring: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Patient safety</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Earthquake safety - Building parameters" placeholder="Enter Earthquake Safety - Building Parameters"
                                value={postData?.hospitalDetails?.earthquakeSafety} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, earthquakeSafety: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Fire safety drills" placeholder="Enter Fire Safety Drills"
                                value={postData?.hospitalDetails?.fireSafety} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, fireSafety: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Medical/Paramedical staff details</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Duty Doctor to patient Ratio" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.doctorPatientRatio && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.doctorPatientRatio} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, doctorPatientRatio: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Nurse to patient Ratio (non ICU)" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.nursePatientRatio && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.nursePatientRatio} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, nursePatientRatio: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Availability of in-house doctors MD/MS /MCh Doctors (full time only)" placeholder="Enter Doctor Availability"
                                value={postData?.hospitalDetails?.doctorAvailability} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, doctorAvailability: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Total Staff Strength (Nos.)" placeholder="Enter Total Staff" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.totalStaff} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, totalStaff: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Doctors/Consultants (Nos.)" placeholder="Enter Doctors/Consultants" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.docConsultant} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, docConsultant: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Duty Medical Officers (Nos.)" placeholder="Enter Duty Medical Officers" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.medicalOfficers} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalOfficers: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Nursing Staff (Qualified) (Nos.)" placeholder="Enter Nursing Staff (Qualified)" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.nursingStaff} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, nursingStaff: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Paramedical Staff (Qualified) (Nos.)" placeholder="Enter Paramedical Staff (Qualified)" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.paramedicalStaff} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, paramedicalStaff: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Medical specialties</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="ENT" placeholder="Enter ENT"
                                value={postData?.hospitalDetails?.medicalENT} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, medicalENT: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="General Medicine" placeholder="Enter General Medicine"
                                value={postData?.hospitalDetails?.generalMedicine} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, generalMedicine: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Gastroenterology" placeholder="Enter Gastroenterology"
                                value={postData?.hospitalDetails?.gastroenterology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, gastroenterology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Obstetric & Gynaecology" placeholder="Enter Obstetric & Gynaecology"
                                value={postData?.hospitalDetails?.obstetricGynaecology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, obstetricGynaecology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Urology/Nephrology" placeholder="Enter Urology/Nephrology"
                                value={postData?.hospitalDetails?.urology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, urology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Surgical specialties</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Cardiology" placeholder="Enter Cardiology"
                                value={postData?.hospitalDetails?.cardiology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, cardiology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="ENT" placeholder="Enter ENT"
                                value={postData?.hospitalDetails?.surgicalENT} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalENT: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Gastroenterology" placeholder="Enter Gastroenterology"
                                value={postData?.hospitalDetails?.surgicalGastroenterology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalGastroenterology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="General Surgery" placeholder="Enter General Surgery"
                                value={postData?.hospitalDetails?.generalSurgery} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, generalSurgery: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Neurosurgery" placeholder="Enter Neurosurgery"
                                value={postData?.hospitalDetails?.neurology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, neurology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Obstetric & Gynaecology" placeholder="Enter Obstetric & Gynaecology"
                                value={postData?.hospitalDetails?.surgicalObstetricGynaecology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalObstetricGynaecology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Opthalmology" placeholder="Enter Opthalmology"
                                value={postData?.hospitalDetails?.opthalmology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, opthalmology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Orthopedics" placeholder="Enter Orthopedics"
                                value={postData?.hospitalDetails?.orthopedics} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, orthopedics: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Plastic Surgery" placeholder="Enter Plastic Surgery"
                                value={postData?.hospitalDetails?.plasticSurgery} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, plasticSurgery: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Urology/Nephrology" placeholder="Enter Urology/Nephrology"
                                value={postData?.hospitalDetails?.surgicalUrology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, surgicalUrology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Oncology" placeholder="Enter Oncology"
                                value={postData?.hospitalDetails?.oncology} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, oncology: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Paediatrics Surgery" placeholder="Enter Paediatrics Surgery"
                                value={postData?.hospitalDetails?.paediatricsSurgery} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, paediatricsSurgery: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Robotic Surgery" placeholder="Enter Robotic Surgery"
                                value={postData?.hospitalDetails?.roboticSurgery} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, roboticSurgery: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Laboratory/Pathology Services</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="In-house/Out sourced" placeholder="Enter In-house/Out sourced"
                                value={postData?.hospitalDetails?.inHouseLab} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, inHouseLab: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Blood Bank" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.bloodBank && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.bloodBank} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bloodBank: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Blood Bank should follow NACO guidelines,drug & cosmetic act" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.bloodGuidelines && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.bloodGuidelines} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bloodGuidelines: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Radiology Services</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="X-Ray (X-Ray - AERB guide lines)" placeholder="Enter (X-Ray - AERB guide lines)"
                                value={postData?.hospitalDetails?.xRay} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, xRay: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="2D Echo/ Colour Doppler" placeholder="Enter 2D Echo/ Colour Doppler"
                                value={postData?.hospitalDetails?.colorDoppler} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, colorDoppler: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="MRI/PET CT" placeholder="Enter MRI/PET CT"
                                value={postData?.hospitalDetails?.mri} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, mri: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="CT Scan" placeholder="Enter CT Scan"
                                value={postData?.hospitalDetails?.ctScan} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ctScan: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Dialysis unit" placeholder="Enter Dialysis unit"
                                value={postData?.hospitalDetails?.dialysisUnit} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, dialysisUnit: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="U.S.G." placeholder="Enter U.S.G."
                                value={postData?.hospitalDetails?.usg} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, usg: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Pharmacy</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Pharmacy" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.pharmacy && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.pharmacy} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, pharmacy: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Non-Clinical Support Services</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Ambulance Services" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.ambulance && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.ambulance} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, ambulance: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Dietary Services" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.dietary && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.dietary} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, dietary: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Linen & Laundry Services" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.laundry && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.laundry} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, laundry: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Biomedical Gases" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.bioGases && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.bioGases} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bioGases: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Bio-Medical Waste Management" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.bioWaste && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.bioWaste} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bioWaste: e ?? ""}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Medical Record Department</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Hospital Information system (Electronic)" placeholder="Enter Hospital Information system"
                                value={postData?.hospitalDetails?.hosInfoSystem} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, hosInfoSystem: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Fire safety certificate/ clearane availed" placeholder="Enter Fire safety certificate"
                                value={postData?.hospitalDetails?.fireSafetyCerti} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, fireSafetyCerti: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Recognised by Municipal council / State body (Name the body)" placeholder="Enter Municipal Recognition"
                                value={postData?.hospitalDetails?.municipalRecognistion} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, municipalRecognistion: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="General cleanliness / Housekeeping" placeholder="Enter Housekeeping"
                                value={postData?.hospitalDetails?.housekeeping} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, housekeeping: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Parking space / Waiting rooms / Cafeteria / Patient information systems" placeholder="Enter Parking space"
                                value={postData?.hospitalDetails?.parkingSpace} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, parkingSpace: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">Beds Details</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <Select withAsterisk clearable withCheckIcon={false} label="Bed Capacity" placeholder="Select" 
                                rightSection={!postData?.hospitalDetails?.bedDetails?.bedCapacity && <ChevronDownIcon className="text-[#000]" />}
                                value={postData?.hospitalDetails?.bedDetails?.bedCapacity} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, bedCapacity: e ?? ""}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
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
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="No. of Hospital Inpatient Beds" placeholder="Enter Inpatient Beds" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.bedCapacity} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, bedCapacity: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="No. of Day Care Beds" placeholder="Enter Day Care Beds" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.dayCareBeds} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, dayCareBeds: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="ICU (MICU/SICU)/ICU (PICU/NICU) (% of total bed)" placeholder="Enter ICU (MICU/SICU)/ICU (PICU/NICU)" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.icuNicu} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, icuNicu: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Beds Distance" placeholder="Enter Beds Distance" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.bedsDistance} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, bedsDistance: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Single AC/Single non AC (% of total Bed)" placeholder="Enter Single AC" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.singleAc} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, singleAc: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Non bed area (Min 55% of the total Hospital area)" placeholder="Enter Non Bed Area" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.nonBedArea} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, nonBedArea: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Total bed strength" placeholder="Enter Total Bed Strength" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.totalBed} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, totalBed: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="Floor Height (3.6 meter (min.))" placeholder="Enter Floor Height" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.floorHeight} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, floorHeight: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="AC Sharing/Non AC sharing/General/Day care/Labor room/Dialysis beds (% of total Bed)" placeholder="Enter Sharing AC" type="number" onWheel={(e) => e.currentTarget.blur()}
                                value={postData?.hospitalDetails?.bedDetails?.sharingAC} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, bedDetails: {...postData?.hospitalDetails?.bedDetails, sharingAC: e.target.value}}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                    </Grid>
                </div>
                </>}

                {/* account details */}
                {tabName==="account" && <>
                <h4 className="bg-[#E6F4FF] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[#43B75D] text-[0.9rem] md:text-[1rem] font-semibold mb-4">PAN & GST Details</h4>
                <div className="mt-4 p-2 sm:p-3 md:p-4">
                    <Grid align="end" grow>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="PAN Number" placeholder="Enter PAN Number"
                                value={postData?.hospitalDetails?.panNumber} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, panNumber: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="PAN Holder Name" placeholder="Enter PAN Holder Name"
                                value={postData?.hospitalDetails?.panHolderName} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, panHolderName: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <div className="flex items-center gap-2">
                                <FileInput withAsterisk label="PAN Card" clearable rightSection={<UploadIcon className="text-[#3E97FF]" />}
                                    placeholder={`${postData?.hospitalDetails?.profileDocuments?.panCard ? "Update" : "Upload"} PAN Card`}
                                    accept="application/pdf" value={profileDocuments.panCard} onChange={e => {
                                        if(e && e?.size / 1024 / 1024 <= 5 && e?.type==="application/pdf") {
                                            uploadPanCard(e)
                                        } else {
                                            return notifications.show({
                                                color: "#E0063A",
                                                title: "Error",
                                                message: "Please upload PDF with size upto 5MB only.",
                                            })
                                        }
                                    }}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                    }}
                                />
                                {postData?.hospitalDetails?.profileDocuments?.panCard && <Button size="compact-xs" h={"2.5rem"} w={100}
                                    onClick={()=>setDocumentUrl(postData?.hospitalDetails?.profileDocuments?.panCard)}
                                    className="!bg-transparent !border-1 !border-[#3E97FF] !text-[#3E97FF]"
                                >
                                    View
                                </Button>}
                            </div>
                            
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <TextInput withAsterisk label="GST Number" placeholder="Enter GST Number"
                                value={postData?.hospitalDetails?.gstNumber} onChange={e => setPostData({...postData, hospitalDetails: {...postData?.hospitalDetails, gstNumber: e.target.value}})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <div className="flex items-center gap-2">
                                <FileInput withAsterisk label="GST Certificate" clearable rightSection={<UploadIcon className="text-[#3E97FF]" />}
                                    placeholder={`${postData?.hospitalDetails?.profileDocuments?.gstCertificate ? "Update" : "Upload"} GST Certificate`}
                                    accept="application/pdf" value={profileDocuments.gstCertifcate} onChange={e => {
                                        if(e && e?.size / 1024 / 1024 <= 5 && e?.type==="application/pdf") {
                                            uploadGstCertificate(e)
                                        } else {
                                            return notifications.show({
                                                color: "#E0063A",
                                                title: "Error",
                                                message: "Please upload PDF with size upto 5MB only.",
                                            })
                                        }
                                    }}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                    }}
                                />
                                {postData?.hospitalDetails?.profileDocuments?.gstCertificate && <Button size="compact-xs" h={"2.5rem"} w={100}
                                    onClick={()=>setDocumentUrl(postData?.hospitalDetails?.profileDocuments?.gstCertificate)}
                                    className="!bg-transparent !border-1 !border-[#3E97FF] !text-[#3E97FF]"
                                >
                                    View
                                </Button>}
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                            <div>
                                <FileInput withAsterisk label="Cancelled Cheque" clearable rightSection={<UploadIcon className="text-[#3E97FF]" />}
                                    placeholder={`${postData?.hospitalDetails?.profileDocuments?.cancelledCheque ? "Update" : "Upload"} Cancelled Cheque`}
                                    accept="application/pdf" value={profileDocuments.cancelledCheque} onChange={e => {
                                        if(e && e?.size / 1024 / 1024 <= 5 && e?.type==="application/pdf") {
                                            uploadCancelledCheque(e)
                                        } else {
                                            return notifications.show({
                                                color: "#E0063A",
                                                title: "Error",
                                                message: "Please upload PDF with size upto 5MB only.",
                                            })
                                        }
                                    }}
                                    classNames={{
                                        label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] xl:!text-[0.9rem] mb-1",
                                        input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem] xl:!h-[2.5rem] mb-8",
                                    }}
                                />
                                {postData?.hospitalDetails?.profileDocuments?.cancelledCheque && <Button size="compact-xs" h={"2.5rem"} w={100}
                                    onClick={()=>setDocumentUrl(postData?.hospitalDetails?.profileDocuments?.cancelledCheque)}
                                    className="!bg-transparent !border-1 !border-[#3E97FF] !text-[#3E97FF]"
                                >
                                    View
                                </Button>}
                            </div>
                        </Grid.Col>
                    </Grid>
                </div>
                </>}

                {/* documents details */}
                {tabName==="document" && <>
                <div className="p-2 sm:p-3 md:p-4">
                    <div className="border-1 border-[#ACACAC] rounded-[0.5rem]">
                        <div className="bg-[#43B75D] p-1 sm:p-1.5 rounded-t-[0.5rem] flex items-center justify-between">
                            <h3 className="text-[0.7rem] md:text-[0.8rem] text-[#FFFFFF] font-semibold ml-2">Uploaded Documents</h3>
                        </div>
                        <ScrollArea h={240} scrollbarSize={4}>
                            {/* table layout for large screens */}
                            <div className="hidden md:block">
                                <Table verticalSpacing={8} horizontalSpacing={10} stickyHeaderOffset={0} stickyHeader>
                                    <Table.Thead bg={"#D8F5FF"}>
                                        <Table.Tr className="text-[#43B75D] text-[0.75rem] font-semibold">
                                            <Table.Td className="text-center min-w-[4rem]">S No.</Table.Td>
                                            <Table.Td className="min-w-[15rem]">Document Name</Table.Td>
                                            <Table.Td className="text-center min-w-[6.5rem]">Uploaded On</Table.Td>
                                            <Table.Td className="text-center">Type</Table.Td>
                                            <Table.Td className="text-center">View</Table.Td>
                                            <Table.Td className="text-center">Delete</Table.Td>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                            <Table.Td className="text-center">1.</Table.Td>
                                            <Table.Td>Hospital ROHINI</Table.Td>
                                            <Table.Td className="text-center">{postData?.hospitalDetails?.profileDocuments?.rohiniCertificate ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.rohiniCertificate) : "-"}</Table.Td>
                                            <Table.Td className="text-center">PDF</Table.Td>
                                            <Table.Td className="text-center">
                                                {postData?.hospitalDetails?.profileDocuments?.rohiniCertificate && <span className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.rohiniCertificate}`)}
                                                >
                                                    View
                                                </span>}
                                                {!postData?.hospitalDetails?.profileDocuments?.rohiniCertificate && <span>-</span>}
                                            </Table.Td>
                                            <Table.Td className="grid place-content-center">
                                                <DeleteIcon className={`text-[#EE443F] mx-auto ${postData?.hospitalDetails?.profileDocuments?.rohiniCertificate ? "cursor-pointer" : "cursor-not-allowed"}`} width={12} height={16}
                                                    onClick={()=>{
                                                        if(postData?.hospitalDetails?.profileDocuments?.rohiniCertificate) {
                                                            deleteRohiniCerti(postData?.hospitalDetails?.profileDocuments?.rohiniCertificate)
                                                        }
                                                    }} 
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                        <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                            <Table.Td className="text-center">2.</Table.Td>
                                            <Table.Td>Hospital Registration Certificate</Table.Td>
                                            <Table.Td className="text-center">{postData?.hospitalDetails?.profileDocuments?.registrationCertificate ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.registrationCertificate) : "-"}</Table.Td>
                                            <Table.Td className="text-center">PDF</Table.Td>
                                            <Table.Td className="text-center">
                                                {postData?.hospitalDetails?.profileDocuments?.registrationCertificate && <span className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.registrationCertificate}`)}
                                                >
                                                    View
                                                </span>}
                                                {!postData?.hospitalDetails?.profileDocuments?.registrationCertificate && <span>-</span>}
                                            </Table.Td>
                                            <Table.Td className="grid place-content-center">
                                                <DeleteIcon className={`text-[#EE443F] mx-auto ${postData?.hospitalDetails?.profileDocuments?.registrationCertificate ? "cursor-pointer" : "cursor-not-allowed"}`} width={12} height={16}
                                                    onClick={()=>{
                                                        if(postData?.hospitalDetails?.profileDocuments?.registrationCertificate) {
                                                            deleteRegistrationCerti(postData?.hospitalDetails?.profileDocuments?.registrationCertificate)
                                                        }
                                                    }} 
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                        <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                            <Table.Td className="text-center">3.</Table.Td>
                                            <Table.Td>Hospital Tariff List</Table.Td>
                                            <Table.Td className="text-center">{postData?.hospitalDetails?.profileDocuments?.tarrifList ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.tarrifList) : "-"}</Table.Td>
                                            <Table.Td className="text-center">PDF</Table.Td>
                                            <Table.Td className="text-center">
                                                {postData?.hospitalDetails?.profileDocuments?.tarrifList && <span className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.tarrifList}`)}
                                                >
                                                    View
                                                </span>}
                                                {!postData?.hospitalDetails?.profileDocuments?.tarrifList && <span>-</span>}
                                            </Table.Td>
                                            <Table.Td className="grid place-content-center">
                                                <DeleteIcon className={`text-[#EE443F] mx-auto ${postData?.hospitalDetails?.profileDocuments?.tarrifList ? "cursor-pointer" : "cursor-not-allowed"}`} width={12} height={16}
                                                    onClick={()=>{
                                                        if(postData?.hospitalDetails?.profileDocuments?.tarrifList) {
                                                            deleteTariff(postData?.hospitalDetails?.profileDocuments?.tarrifList)
                                                        }
                                                    }} 
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                        <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                            <Table.Td className="text-center">4.</Table.Td>
                                            <Table.Td>Hospital Cancelled Cheque</Table.Td>
                                            <Table.Td className="text-center">{postData?.hospitalDetails?.profileDocuments?.cancelledCheque ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.cancelledCheque) : "-"}</Table.Td>
                                            <Table.Td className="text-center">PDF</Table.Td>
                                            <Table.Td className="text-center">
                                                {postData?.hospitalDetails?.profileDocuments?.cancelledCheque && <span className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.cancelledCheque}`)}
                                                >
                                                    View
                                                </span>}
                                                {!postData?.hospitalDetails?.profileDocuments?.cancelledCheque && <span>-</span>}
                                            </Table.Td>
                                            <Table.Td className="grid place-content-center">
                                                <DeleteIcon className={`text-[#EE443F] mx-auto ${postData?.hospitalDetails?.profileDocuments?.cancelledCheque ? "cursor-pointer" : "cursor-not-allowed"}`} width={12} height={16}
                                                    onClick={()=>{
                                                        if(postData?.hospitalDetails?.profileDocuments?.cancelledCheque) {
                                                            deleteCancelledCheque(postData?.hospitalDetails?.profileDocuments?.cancelledCheque)
                                                        }
                                                    }} 
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                        <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                            <Table.Td className="text-center">5.</Table.Td>
                                            <Table.Td>Hospital PAN Card</Table.Td>
                                            <Table.Td className="text-center">{postData?.hospitalDetails?.profileDocuments?.panCard ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.panCard) : "-"}</Table.Td>
                                            <Table.Td className="text-center">PDF</Table.Td>
                                            <Table.Td className="text-center">
                                                {postData?.hospitalDetails?.profileDocuments?.panCard && <span className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.panCard}`)}
                                                >
                                                    View
                                                </span>}
                                                {!postData?.hospitalDetails?.profileDocuments?.panCard && <span>-</span>}
                                            </Table.Td>
                                            <Table.Td className="grid place-content-center">
                                                <DeleteIcon className={`text-[#EE443F] mx-auto ${postData?.hospitalDetails?.profileDocuments?.panCard ? "cursor-pointer" : "cursor-not-allowed"}`} width={12} height={16}
                                                    onClick={()=>{
                                                        if(postData?.hospitalDetails?.profileDocuments?.panCard) {
                                                            deletePanCard(postData?.hospitalDetails?.profileDocuments?.panCard)
                                                        }
                                                    }} 
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                        <Table.Tr className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                            <Table.Td className="text-center">6.</Table.Td>
                                            <Table.Td>Hospital GST Certificate</Table.Td>
                                            <Table.Td className="text-center">{postData?.hospitalDetails?.profileDocuments?.gstCertificate ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.gstCertificate) : "-"}</Table.Td>
                                            <Table.Td className="text-center">PDF</Table.Td>
                                            <Table.Td className="text-center">
                                                {postData?.hospitalDetails?.profileDocuments?.gstCertificate && <span className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.gstCertificate}`)}
                                                >
                                                    View
                                                </span>}
                                                {!postData?.hospitalDetails?.profileDocuments?.gstCertificate && <span>-</span>}
                                            </Table.Td>
                                            <Table.Td className="grid place-content-center">
                                                <DeleteIcon className={`text-[#EE443F] mx-auto ${postData?.hospitalDetails?.profileDocuments?.gstCertificate ? "cursor-pointer" : "cursor-not-allowed"}`} width={12} height={16}
                                                    onClick={()=>{
                                                        if(postData?.hospitalDetails?.profileDocuments?.gstCertificate) {
                                                            deleteGstCerti(postData?.hospitalDetails?.profileDocuments?.gstCertificate)
                                                        }
                                                    }} 
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                        {postData?.hospitalDetails?.profileDocuments?.otherDocuments && postData?.hospitalDetails?.profileDocuments?.otherDocuments.length > 0 && postData.hospitalDetails.profileDocuments.otherDocuments.map((doc, idx) => (
                                            <Table.Tr key={doc.docUrl} className="text-[#2C2B2B] text-[0.7rem] font-medium">
                                                <Table.Td className="text-center">{idx + 7}.</Table.Td>
                                                <Table.Td>{doc.name}</Table.Td>
                                                <Table.Td className="text-center">{doc.date ? dayjs(doc.date).format("DD-MMM-YYYY") : "-"}</Table.Td>
                                                <Table.Td className="text-center">PDF</Table.Td>
                                                <Table.Td className="text-center">
                                                    <span className="cursor-pointer text-[#3E97FF] underline underline-offset-4" 
                                                        onClick={()=>setDocumentUrl(`${doc.docUrl}`)}
                                                    >
                                                        View
                                                    </span>
                                                </Table.Td>
                                                <Table.Td className="grid place-content-center">
                                                    <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} onClick={()=>deleteOtherDoc(doc.docUrl)} />
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
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{postData?.hospitalDetails?.profileDocuments?.rohiniCertificate ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.rohiniCertificate) : "-"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View:</p>
                                                {postData?.hospitalDetails?.profileDocuments?.rohiniCertificate && <p className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.rohiniCertificate}`)}
                                                >
                                                    View
                                                </p>}
                                                {!postData?.hospitalDetails?.profileDocuments?.rohiniCertificate && <p>-</p>}
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Delete:</p>
                                                <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} 
                                                    onClick={()=>deleteRohiniCerti(postData?.hospitalDetails?.profileDocuments?.rohiniCertificate)} 
                                                />
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
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{postData?.hospitalDetails?.profileDocuments?.registrationCertificate ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.registrationCertificate) : "-"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View:</p>
                                                {postData?.hospitalDetails?.profileDocuments?.registrationCertificate && <p className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.registrationCertificate}`)}
                                                >
                                                    View
                                                </p>}
                                                {!postData?.hospitalDetails?.profileDocuments?.registrationCertificate && <p>-</p>}
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Delete:</p>
                                                <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} 
                                                    onClick={()=>deleteRohiniCerti(postData?.hospitalDetails?.profileDocuments?.registrationCertificate)} 
                                                />
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
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{postData?.hospitalDetails?.profileDocuments?.tarrifList ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.tarrifList) : "-"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View:</p>
                                                {postData?.hospitalDetails?.profileDocuments?.tarrifList && <p className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.tarrifList}`)}
                                                >
                                                    View
                                                </p>}
                                                {!postData?.hospitalDetails?.profileDocuments?.tarrifList && <p>-</p>}
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Delete:</p>
                                                <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} 
                                                    onClick={()=>deleteRohiniCerti(postData?.hospitalDetails?.profileDocuments?.tarrifList)} 
                                                />
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
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{postData?.hospitalDetails?.profileDocuments?.cancelledCheque ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.cancelledCheque) : "-"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View:</p>
                                                {postData?.hospitalDetails?.profileDocuments?.cancelledCheque && <p className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.cancelledCheque}`)}
                                                >
                                                    View
                                                </p>}
                                                {!postData?.hospitalDetails?.profileDocuments?.cancelledCheque && <p>-</p>}
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Delete:</p>
                                                <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} 
                                                    onClick={()=>deleteRohiniCerti(postData?.hospitalDetails?.profileDocuments?.cancelledCheque)} 
                                                />
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
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{postData?.hospitalDetails?.profileDocuments?.panCard ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.panCard) : "-"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View:</p>
                                                {postData?.hospitalDetails?.profileDocuments?.panCard && <p className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.panCard}`)}
                                                >
                                                    View
                                                </p>}
                                                {!postData?.hospitalDetails?.profileDocuments?.panCard && <p>-</p>}
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Delete:</p>
                                                <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} 
                                                    onClick={()=>deleteRohiniCerti(postData?.hospitalDetails?.profileDocuments?.panCard)} 
                                                />
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
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{postData?.hospitalDetails?.profileDocuments?.gstCertificate ? getDateFromUrl(postData?.hospitalDetails?.profileDocuments?.gstCertificate) : "-"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View:</p>
                                                {postData?.hospitalDetails?.profileDocuments?.gstCertificate && <p className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                    onClick={()=>setDocumentUrl(`${postData?.hospitalDetails?.profileDocuments?.gstCertificate}`)}
                                                >
                                                    View
                                                </p>}
                                                {!postData?.hospitalDetails?.profileDocuments?.gstCertificate && <p>-</p>}
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Delete:</p>
                                                <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} 
                                                    onClick={()=>deleteRohiniCerti(postData?.hospitalDetails?.profileDocuments?.gstCertificate)} 
                                                />
                                            </div>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                    {postData?.hospitalDetails?.profileDocuments?.otherDocuments && postData?.hospitalDetails?.profileDocuments?.otherDocuments.length > 0 && postData.hospitalDetails.profileDocuments.otherDocuments.map((doc, idx) => (
                                        <Accordion.Item value={doc.docUrl}>
                                            <Accordion.Control>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{idx + 7}.</p>
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{doc.name}</p>
                                                </div>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Uploaded On:</p>
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-medium">{doc.date ? dayjs(doc.date).format("DD-MMM-YYYY") : "-"}</p>
                                                </div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Type:</p>
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-medium">PDF</p>
                                                </div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">View:</p>
                                                    <p className="cursor-pointer text-[#3E97FF] underline underline-offset-4"
                                                        onClick={()=>setDocumentUrl(`${doc.docUrl}`)}
                                                    >
                                                        View
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="text-[#2C2B2B] text-[0.7rem] font-semibold">Delete:</p>
                                                    <DeleteIcon className="text-[#EE443F] cursor-pointer mx-auto" width={12} height={16} 
                                                        onClick={()=>deleteOtherDoc(doc.docUrl)} 
                                                    />
                                                </div>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            </div>
                        </ScrollArea>

                    </div>
                    {/* buttons to add additional documents */}
                    <Grid align="end" className="mt-8">
                        <Grid.Col span={{base:12, sm:6, md:7, lg:7}}>
                            <TextInput label="Document Name" placeholder="Enter Gastroenterology"
                                value={profileDocuments.otherDocname} onChange={e => setProfileDocuments({...profileDocuments, otherDocname: e.target.value})}
                                classNames={{
                                    label: "!text-[#0C0C0C] !font-medium !text-[0.8rem] mb-1",
                                    input: "!border-[#E0E0E0] !rounded-[0.25rem] !h-[2.25rem]",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:3, md:3, lg:3}}>
                            <FileInput label="Document" placeholder="Upload Document" clearable rightSection={!profileDocuments.otherDoc && <UploadIcon className="text-[#3E97FF]" width={15} height={15} />}
                                accept="application/pdf" value={profileDocuments.otherDoc} onChange={e => {
                                    if(e && e?.size / 1024 / 1024 <= 5 && e?.type==="application/pdf") {
                                        setProfileDocuments({...profileDocuments, otherDoc: e})
                                    } else {
                                        return notifications.show({
                                            color: "#E0063A",
                                            title: "Error",
                                            message: "Please upload PDF with size upto 5MB only.",
                                        })
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
                                root: "!bg-[#43B75D] !rounded-[0.25rem]",
                            }} onClick={()=>uploadOtherDoc()}>
                                Add
                            </Button>
                        </Grid.Col>
                    </Grid>
                </div>
                </>}

                <div className="flex items-center justify-end mt-10 p-2 sm:p-3 md:p-4">
                    <Button bg={"#43B75D"} size="sm" onClick={()=>handleSubmit()}>
                        {tabName==="document" ? "Save" : "Next"}
                    </Button>
                </div>
            </Modal>

            {documentUrl && <ViewDocModal url={documentUrl} setUrl={setDocumentUrl} />}
        </Modal.Stack>
        </>
    )
}

export default HospitalDetailsModal