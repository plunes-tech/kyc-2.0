import React, { useEffect, useState } from "react";
import { Button, FileInput, Grid, Select, Textarea, TextInput } from "@mantine/core";
import { ChevronDownIcon, UploadIcon } from "../../assets/icons";
import { DatePickerInput } from "@mantine/dates";
import { Booking, BookingData } from "../../features/booking/types";
import dayjs from "dayjs";
import useBooking from "../../hooks/useBooking";
import { OptionProps } from "../../utils/types";
import axios from "axios";
import { removeNulls } from "../../utils/utilits";
import { notifications } from "@mantine/notifications";
import ViewDocModal from "./ViewDocModal";
import { AddBookingSchema } from "../../features/booking/schema";
import useUploads from "../../hooks/useUploads";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import GlobalLoader from "../GlobalLoader";
import Notifications from "../Notifications";

const AddBookingModal:React.FC<{setOpenModal: React.Dispatch<React.SetStateAction<boolean>>, initialData?: BookingData}> = ({setOpenModal, initialData}) => {

    const { createBooking, getAllInsurance } = useBooking()
    const { isLoading: uploadLoading, error: uploadError, getPresignedUrl } = useUploads()
    const allInsurance = useSelector((state: RootState) => state.booking.allInsurance)

    const initialFormData: Booking = {
        patientDetails: {
            mobileNumber: initialData?.patient?.mobileNumber ?? "",
            email: initialData?.patient?.email ?? "",
            name: initialData?.patient?.name ?? "",
            alternateNumber: undefined,
            address: "",
            patientDob: "",
            patientAge: (initialData?.patient?.patientAge || initialData?.patient?.patientAge == 0) ? initialData?.patient?.patientAge : null,
            patientSex: initialData?.patient?.patientSex ?? "",
            contactPerson: {
                age: null,
                email: "",
                gender: "",
                mobileNumber: "",
                name: "",
                relation: "",
            },
        },
        doctorDetails: {
            name: "",
            certificateNumber: "",
            number: "",
        },
        treatmentType: initialData?.treatmentType ?? "",
        treatmentName: "",
        treatmentDetails: "",
        doa: "",
        insuranceId: "",
        insuranceCompanyName: "",
        policyType: "",
        policyName: "",
        policyNumber: "",
        dod: "",
        uhid: "",
        roomCategory: "",
        roomCategorySpecify: undefined,
        paymentDetails: {
            roomRentPerDay: null,
            // otCharges: null,
            cvc: null,
            costEstimation: null,
            pharmacyCharges: null,
            totalRoomRent: null,
            treatmentCost: null,
        },
        bookingDocs: undefined,
    }

    const [insuranceList, setInsuranceList] = useState<OptionProps[] | null>(null)
    const [formData, setFormData] = useState<Booking>(initialFormData)

    const [preAuth, setPreAuth] = useState("")
    const [preAuthFile, setPreAuthFile] = useState<File | null>(null)

    const [docName, setDocName] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [docUrl, setDocUrl] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getAllInsurance()
            } catch (error) {
                // handle by redux
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if(allInsurance) {
            const formattedInsuranceList: OptionProps[] = allInsurance.map((insurance) => ({
                label: insurance.name ?? "",
                value: insurance.id ?? "",
            }));

            // Update state
            setInsuranceList(formattedInsuranceList);
        }
    }, [allInsurance])

    // auto calculate age
    useEffect(() => {
        if(formData.patientDetails.patientDob) {
            const inputDate = dayjs(formData.patientDetails.patientDob, 'DD-MMM-YYYY', true);
            if (!inputDate.isValid()) {
                return
            }

            // Get today's date
            const today = dayjs();

            // Calculate difference in years
            const yearsDiff = today.diff(inputDate, 'year');

            setFormData({
                ...formData,
                patientDetails: {
                    ...formData.patientDetails,
                    patientAge: yearsDiff,
                }
            })
        }
    }, [formData.patientDetails.patientDob])

    // auto calculate total room rent
    useEffect(() => {
        if(formData.doa && formData.dod && (formData.paymentDetails.roomRentPerDay || formData.paymentDetails.roomRentPerDay == 0)) {
            const admissionDate = dayjs(formData.doa, 'DD-MMM-YYYY', true)
            const dischargeDate = dayjs(formData.dod, 'DD-MMM-YYYY', true)

            if (admissionDate.isAfter(dischargeDate)) {
                return
            }
            const daysDiff = dischargeDate.diff(admissionDate, 'day')
            const totalRent = daysDiff * formData.paymentDetails.roomRentPerDay
            setFormData({
                ...formData,
                paymentDetails: {
                    ...formData.paymentDetails,
                    totalRoomRent: totalRent
                }
            })
        } else {
            setFormData({
                ...formData,
                paymentDetails: {
                    ...formData.paymentDetails,
                    totalRoomRent: null,
                }
            })
        }
    }, [formData.doa, formData.dod, formData.paymentDetails.roomRentPerDay])

    // cost estimation calculations
    useEffect(() => {
        let totalCost = 0
        totalCost += formData?.paymentDetails?.totalRoomRent || 0
        totalCost += formData?.paymentDetails?.cvc || 0
        totalCost += formData?.paymentDetails?.pharmacyCharges || 0
        totalCost += formData?.paymentDetails?.investigationCharges || 0
        totalCost += formData?.paymentDetails?.otherCharges || 0
        totalCost -= formData?.paymentDetails?.discount || 0

        setFormData({
            ...formData,
            paymentDetails: {
                ...formData?.paymentDetails,
                costEstimation: totalCost
            }
        })

    }, [
        formData?.paymentDetails?.totalRoomRent, formData?.paymentDetails?.cvc, formData?.paymentDetails?.pharmacyCharges,
        formData?.paymentDetails?.investigationCharges, formData?.paymentDetails?.otherCharges, formData?.paymentDetails?.discount,
    ])

    const handleUploadFile = async () => {
        if(!file || !docName) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Please enter document name and select a file before adding.",
            })
        }
        try {
            const fileName = `Booking-Docs-${Date.now()}.pdf`
            const filePath = `/${import.meta.env.VITE_AWS_BOOKING_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "PUT",
            })
            const response = await axios.put(result.url, file, {
                headers: {"Content-Type": "application/pdf"},
            })
            if(response.status === 200) {
                const docs = formData?.bookingDocs ? [...formData?.bookingDocs] : []
                docs.push({
                    fileName: docName,
                    filePath: `/${import.meta.env.VITE_AWS_BOOKING_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`
                })
                setFormData({
                    ...formData,
                    bookingDocs: docs
                })
                setDocName("")
                setFile(null)
            }
        } catch (error) {
            // handle by redux
        }
    }

    const handleRemoveFile = async (doc: {fileName: string, filePath: string}) => {
        try {
            const result = await getPresignedUrl({
                filePath: doc.filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                let newDocs = formData?.bookingDocs ? [...formData?.bookingDocs] : []
                newDocs = newDocs.filter(item => item.filePath !== doc.filePath)
                setFormData({
                    ...formData,
                    bookingDocs: newDocs
                })
            }
        } catch (error) {
            //  handle by redux
        }
    }

    const handleUploadPreAuth = async (file: File | null) => {
        try {
            const fileName = `Booking-Docs-${Date.now()}.pdf`
            const filePath = `/${import.meta.env.VITE_AWS_BOOKING_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "PUT",
            })
            const response = await axios.put(result.url, file, {
                headers: {"Content-Type": "application/pdf"},
            })
            if(response.status === 200) {
                setPreAuth(`/${import.meta.env.VITE_AWS_BOOKING_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`)
                setPreAuthFile(file)
            }
        } catch (error) {
            // handle by redux
        }
    }

    const handleRemovePreAuth = async (filePath: string) => {
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                setPreAuth(``)
                setPreAuthFile(null)
            }
        } catch (error) {
            // handle by redux
        }
    }

    const handleCreateBooking = async () => {
        if(!formData) return
        if(docName || file) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "It seems you are trying to add a document, please add or remove it before saving",
            })
        }
        const cleanedPayload = removeNulls(formData)
        const validateData = AddBookingSchema.safeParse(cleanedPayload)
        if(!validateData.success) {
            // console.log(validateData.error.errors);
            notifications.show({
                color: "#E0063A",
                title: "Error",
                message: validateData.error.errors[0].message ?? "Something went wrong",
            })
            return
        }
        if(!preAuth) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Please upload Pre-Auth Document",
            })
        }
        let finalDocuments = cleanedPayload.bookingDocs?.length ? [...cleanedPayload.bookingDocs , {fileName: "Pre-Auth Document", filePath: preAuth}] : [{fileName: "Pre-Auth Document", filePath: preAuth}]
        let requestPayload = {...cleanedPayload, bookingDocs: finalDocuments}
        const result = await createBooking(requestPayload)
        if(result.success) {
            setOpenModal(false)
            return true
        }
        return
    }

    return (
        <>
        {uploadLoading && <GlobalLoader/>}
        {uploadError && uploadError.message && uploadError.message.toLocaleLowerCase() !== "validation error" && <Notifications type="error" title="Error" message={uploadError.message} />}
        {uploadError && uploadError.message && uploadError.message.toLocaleLowerCase() === "validation error" && Array.isArray(uploadError.errors) && uploadError.errors[0]?.message && <Notifications type="error" title="Error" message={uploadError.errors[0].message} />}
        <h3 className="px-4 py-1 bg-[#D8F0FF] text-[0.8rem] sm:text-[0.9rem] font-medium w-full">Basic Patient Details</h3>
        <div className="p-4">
            <Grid grow>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="patient-full-name" label="Full Name" placeholder="Enter full name" size="compact-xs" value={formData.patientDetails.name} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData.patientDetails, name: e.target.value}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <Select data-testid="patient-gender" withCheckIcon={false} clearable label="Gender" placeholder="-Select-" size="xs" value={formData?.patientDetails?.patientSex} withAsterisk
                        rightSection={!formData?.patientDetails?.patientSex && <ChevronDownIcon className="text-[#3B3B3B] mr-2" width={10} height={8}/>}
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, patientSex: e ? e : ""}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        data={[
                            {label: "Male", value: "M"},
                            {label: "Female", value: "F"},
                            {label: "Others", value: "O"},
                        ]}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <DatePickerInput data-testid="patient-dob" label="DOB" placeholder="DD-MMM-YYYY" size="xs" withAsterisk clearable value={formData?.patientDetails?.patientDob ? dayjs(formData?.patientDetails?.patientDob).toDate() : null}
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, patientDob: e ? dayjs(e).format("DD-MMM-YYYY") : ""}})}
                        maxDate={dayjs().toDate()}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <Textarea data-testid="patient-address" rows={2} label="Address" placeholder="Enter address" size="compact-xs" value={formData?.patientDetails?.address} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, address: e.target.value}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !py-1",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="patient-age" label="Age" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="00 yrs" size="compact-xs" value={(formData?.patientDetails?.patientAge || formData?.patientDetails?.patientAge == 0) ? formData?.patientDetails?.patientAge : undefined} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, patientAge: e.target.value ? parseFloat(e.target.value) : null}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        disabled={formData?.patientDetails?.patientDob ? true : false}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="patient-mobile" label="Mobile" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="000-0000-000" size="compact-xs" value={formData?.patientDetails?.mobileNumber} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, mobileNumber: e.target.value}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="patient-email" label="Email" placeholder="example@email.com" size="compact-xs" value={formData?.patientDetails?.email} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, email: e.target.value}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
            </Grid>
            <div className="h-[1px] bg-[#C0C0C0] my-8"/>
            <Grid grow>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="contact-person-name" label="Contact Person Name" placeholder="Enter full name" size="compact-xs" value={formData?.patientDetails?.contactPerson?.name} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, contactPerson: {...formData.patientDetails.contactPerson, name: e.target.value}}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="contact-person-age" label="Age" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="00 yrs" size="compact-xs" value={(formData?.patientDetails?.contactPerson?.age || formData?.patientDetails?.contactPerson?.age == 0) ? formData?.patientDetails?.contactPerson?.age : undefined} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, contactPerson: {...formData.patientDetails.contactPerson, age: e.target.value ? parseFloat(e.target.value) : null}}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <Select data-testid="contact-person-gender" withCheckIcon={false} label="Gender" clearable placeholder="-Select-" size="xs" value={formData?.patientDetails?.contactPerson?.gender} withAsterisk
                        rightSection={!formData?.patientDetails?.contactPerson?.gender && <ChevronDownIcon className="text-[#3B3B3B] mr-2" width={10} height={8}/>}
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, contactPerson: {...formData.patientDetails.contactPerson, gender: e ? e : ""}}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        data={[
                            {label: "Male", value: "M"},
                            {label: "Female", value: "F"},
                            {label: "Others", value: "O"},
                        ]}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="contact-person-mobile" label="Mobile" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="000-0000-000" size="compact-xs" value={formData?.patientDetails?.contactPerson?.mobileNumber} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, contactPerson: {...formData.patientDetails.contactPerson, mobileNumber: e.target.value}}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="contact-person-email" label="Email" placeholder="Enter email" size="compact-xs" value={formData?.patientDetails?.contactPerson?.email} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, contactPerson: {...formData.patientDetails.contactPerson, email: e.target.value}}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="contact-person-relation" label="Relationship With Patient" placeholder="Enter Relation" size="compact-xs" value={formData?.patientDetails?.contactPerson?.relation} withAsterisk
                        onChange={e => setFormData({...formData, patientDetails: {...formData?.patientDetails, contactPerson: {...formData.patientDetails.contactPerson, relation: e.target.value}}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
            </Grid>
        </div>

        <h3 className="px-4 py-1 bg-[#D8F0FF] text-[0.8rem] sm:text-[0.9rem] font-medium w-full mt-2">Treatment Details</h3>
        <div className="p-4">
            <Grid grow>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <Select data-testid="treatment-type" withCheckIcon={false} label="Treatment Type" placeholder="-Select-" size="compact-xs" value={formData?.treatmentType} withAsterisk 
                        rightSection={<ChevronDownIcon className="text-[#3B3B3B] mr-2" width={10} height={8}/>}
                        onChange={e => setFormData({...formData, treatmentType: e ? e : ""})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        data={[
                            {label: "Medical Management", value: "Medical Management"},
                            {label: "Surgical Management", value: "Surgical Management"},
                        ]}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="treatment-name" label="Treatment Name" placeholder="Enter treatment name" size="compact-xs" value={formData?.treatmentName} withAsterisk
                        onChange={e => setFormData({...formData, treatmentName: e.target.value})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="treatment-cost" label="Treatment Cost" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="Enter treatment cost" size="compact-xs" value={(formData?.paymentDetails?.treatmentCost || formData?.paymentDetails?.treatmentCost == 0) ? formData?.paymentDetails?.treatmentCost : undefined} withAsterisk
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, treatmentCost: e.target.value ? parseFloat(e.target.value) : null}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <Textarea data-testid="treatment-details" rows={2} label="Treatment Details" placeholder="Enter treatment details" size="compact-xs" value={formData?.treatmentDetails} withAsterisk
                        onChange={e => setFormData({...formData, treatmentDetails: e.target.value})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !py-1",
                        }}
                    />
                </Grid.Col>
            </Grid>
        </div>

        <h3 className="px-4 py-1 bg-[#D8F0FF] text-[0.8rem] sm:text-[0.9rem] font-medium w-full mt-2">Policy Details</h3>
        <div className="p-4">
            <Grid grow>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <Select data-testid="insurance-provider" withCheckIcon={false} label="Insurance Provider" placeholder="-Select-" size="compact-xs" value={formData?.insuranceId} withAsterisk
                        rightSection={<ChevronDownIcon className="text-[#3B3B3B] mr-2" width={10} height={8}/>}
                        onChange={e => setFormData({...formData, insuranceId: e ? e : ""})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        data={insuranceList ? insuranceList : []}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <Select data-testid="insurance-company-name" withCheckIcon={false} label="Insurance Company Name" placeholder="-Select-" size="compact-xs" value={formData?.insuranceCompanyName} withAsterisk
                        rightSection={<ChevronDownIcon className="text-[#3B3B3B] mr-2" width={10} height={8}/>}
                        onChange={e => setFormData({...formData, insuranceCompanyName: e ? e : ""})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        data={[
                            {label: "N/A", value: "NA"},
                            {label: "Bajaj Allianz General Insurance Co. Ltd", value: "Bajaj Allianz General Insurance Co. Ltd"},
                            {label: "Cholamandalam MS General Insurance Co. Ltd", value: "Cholamandalam MS General Insurance Co. Ltd"},
                            {label: "Navi General Insurance Ltd.", value: "Navi General Insurance Ltd."},
                            {label: "Future Generali India Insurance Co. Ltd.", value: "Future Generali India Insurance Co. Ltd."},
                            {label: "HDFC ERGO General Insurance Co. Ltd", value: "HDFC ERGO General Insurance Co. Ltd"},
                            {label: "IFFCO-TOKIO General Insurance Co. Ltd.", value: "IFFCO-TOKIO General Insurance Co. Ltd."},
                            {label: "ICICI Lombard General Insurance Co. Ltd.", value: "ICICI Lombard General Insurance Co. Ltd."},
                            {label: "Kotak Mahindra General insurance co. Ltd.", value: "Kotak Mahindra General insurance co. Ltd."},
                            {label: "Liberty  General Insurance Co. Ltd.", value: "Liberty  General Insurance Co. Ltd."},
                            {label: "Magma HDI General Insurance Co. Ltd.", value: "Magma HDI General Insurance Co. Ltd."},
                            {label: "National Insurance Co. Ltd.", value: "National Insurance Co. Ltd."},
                            {label: "Raheja QBE General Insurance Co. Ltd.", value: "Raheja QBE General Insurance Co. Ltd."},
                            {label: "Reliance General Insurance Co. Ltd.", value: "Reliance General Insurance Co. Ltd."},
                            {label: "Royal Sundaram General Insurance Co. Ltd", value: "Royal Sundaram General Insurance Co. Ltd"},
                            {label: "SBI General Insurance Co. Ltd.", value: "SBI General Insurance Co. Ltd."},
                            {label: "Shriram General Insurance Co. Ltd.", value: "Shriram General Insurance Co. Ltd."},
                            {label: "Tata-AIG General Insurance Co. Ltd.", value: "Tata-AIG General Insurance Co. Ltd."},
                            {label: "The New India Assurance Co. Ltd.", value: "The New India Assurance Co. Ltd."},
                            {label: "The Oriental Insurance Co. Ltd.", value: "The Oriental Insurance Co. Ltd."},
                            {label: "Universal Sompo General Insurance Co. Ltd.", value: "Universal Sompo General Insurance Co. Ltd."},
                            {label: "United India Insurance Co. Ltd.", value: "United India Insurance Co. Ltd."},
                            {label: "Acko General Insurance Ltd.", value: "Acko General Insurance Ltd."},
                            {label: "Edelweiss General Insurance Company Limited ", value: "Edelweiss General Insurance Company Limited "},
                            {label: "Go Digit General Insurance Limited", value: "Go Digit General Insurance Limited"},
                            {label: "Aditya Birla Health insurance Co Ltd.", value: "Aditya Birla Health insurance Co Ltd."},
                            {label: "Manipal Cigna Health Insurance Company Limited", value: "Manipal Cigna Health Insurance Company Limited"},
                            {label: "Niva bupa health insurance company limited", value: "Niva bupa health insurance company limited"},
                            {label: "Care Health Insurance Ltd", value: "Care Health Insurance Ltd"},
                            {label: "Star Health & Allied Insurance Co. Ltd", value: "Star Health & Allied Insurance Co. Ltd"},
                        ]}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <Select data-testid="policy-type" withCheckIcon={false} label="Type of Policy" placeholder="-Select-" size="compact-xs" value={formData?.policyType} withAsterisk
                        rightSection={<ChevronDownIcon className="text-[#3B3B3B] mr-2" width={10} height={8}/>}
                        onChange={e => setFormData({...formData, policyType: e ? e : ""})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        data={[
                            {label: "Retail Policy", value: "Retail Policy"},
                            {label: "Corporate Policy", value: "Corporate Policy"},
                        ]}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="policy-name" label="Policy Name" placeholder="Enter policy name" size="compact-xs" value={formData?.policyName} withAsterisk
                        onChange={e => setFormData({...formData, policyName: e.target.value})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="policy-number" label="Policy Number" placeholder="Enter policy number" size="compact-xs" value={formData?.policyNumber} withAsterisk
                        onChange={e => setFormData({...formData, policyNumber: e.target.value})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="uhid" label="Member ID/UHID" placeholder="Enter member ID" size="compact-xs" value={formData?.uhid} withAsterisk
                        onChange={e => setFormData({...formData, uhid: e.target.value})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <DatePickerInput data-testid="doa" label="Date of Admission (DOA)" placeholder="DD-MMM-YYYY" size="xs" value={formData?.doa ? dayjs(formData?.doa).toDate() : null}
                        withAsterisk
                        onChange={e => setFormData({...formData, doa: e ? dayjs(e).toISOString() : ""})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        clearable maxDate={formData?.dod ? dayjs(formData.dod).toDate() : undefined}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <DatePickerInput data-testid="dod" label="Date of Discharge (DOD)" placeholder="DD-MMM-YYYY" size="xs" value={formData?.dod ? dayjs(formData?.dod).toDate() : null}
                        withAsterisk
                        onChange={e => setFormData({...formData, dod: e ? dayjs(e).toISOString() : ""})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        clearable minDate={formData?.doa ? dayjs(formData.doa).toDate() : undefined}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <Select data-testid="room-category" withCheckIcon={false} clearable label="Room Category" placeholder="-Select-" size="xs" value={formData?.roomCategory}
                        withAsterisk 
                        rightSection={!formData?.roomCategory && <ChevronDownIcon className="text-[#3B3B3B] mr-2" width={10} height={8}/>}
                        onChange={e => {
                            if(e) {
                                setFormData({...formData, roomCategory: e})
                            } else {
                                setFormData({...formData, roomCategory: "", roomCategorySpecify: ""})
                            }
                        }}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                        data={[
                            { label: 'General', value: 'GENERAL' },
                            { label: 'Private', value: 'PRIVATE' },
                            { label: 'Private AC', value: 'PRIVATE AC' },
                            { label: 'Twin Category', value: 'TWIN CATEGORY' },
                            { label: 'Deluxe', value: 'DELUXE' },
                            { label: 'Super Deluxe', value: 'SUPER DELUXE' },
                            { label: 'NICU', value: 'NICU' },
                            { label: 'ICU', value: 'ICU' },
                            { label: 'Others', value: 'OTHERS' },
                        ]}
                    />
                </Grid.Col>
                {formData.roomCategory === "OTHERS" && <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="other-room-category" label="Please Specify" placeholder="Enter room category" size="compact-xs" value={formData?.roomCategorySpecify}
                        withAsterisk={formData.roomCategory === "OTHERS"}
                        onChange={e => setFormData({...formData, roomCategorySpecify: e.target.value})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>}
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="room-rent-day" label="Room Rent/Day" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="Enter room rent/day" size="compact-xs" value={(formData?.paymentDetails?.roomRentPerDay || formData?.paymentDetails?.roomRentPerDay == 0) ? formData?.paymentDetails?.roomRentPerDay : undefined}
                        withAsterisk
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, roomRentPerDay: e.target.value ? parseFloat(e.target.value) : null}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="total-room-rent" label="Total Room Rent" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="Total room rent" size="compact-xs" 
                        value={(formData?.paymentDetails?.totalRoomRent || formData?.paymentDetails?.totalRoomRent == 0) ? formData?.paymentDetails?.totalRoomRent : undefined}
                        withAsterisk disabled
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="doctor-name" label="Consulting Doctor Name" placeholder="Enter doctor name" size="compact-xs" value={formData?.doctorDetails?.name}
                        withAsterisk
                        onChange={e => setFormData({...formData, doctorDetails: {...formData.doctorDetails, name: e.target.value}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="medical-number" label="Medical Certificate Number" placeholder="Enter certificate number" size="compact-xs" value={formData?.doctorDetails?.certificateNumber}
                        withAsterisk
                        onChange={e => setFormData({...formData, doctorDetails: {...formData.doctorDetails, certificateNumber: e.target.value}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="doctor-number" label="Doctor Contact Number" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="000-0000-000" size="compact-xs" value={formData?.doctorDetails?.number}
                        withAsterisk
                        onChange={e => setFormData({...formData, doctorDetails: {...formData.doctorDetails, number: e.target.value}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="doctor-charge" label="Doctor Consultation/Visiting Charges" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="₹ 00" size="compact-xs" value={(formData?.paymentDetails?.cvc || formData?.paymentDetails?.cvc == 0) ? formData?.paymentDetails?.cvc : undefined}
                        withAsterisk
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, cvc: e.target.value ? parseFloat(e.target.value) : null}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="pharmacy-charge" label="Pharmacy Charges" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="₹ 00" size="compact-xs" value={(formData?.paymentDetails?.pharmacyCharges || formData?.paymentDetails?.pharmacyCharges == 0) ? formData?.paymentDetails?.pharmacyCharges : undefined}
                        withAsterisk
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, pharmacyCharges: e.target.value ? parseFloat(e.target.value) : null}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="investigation-charge" label="Investigation Charges" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="₹ 00" size="compact-xs" value={(formData?.paymentDetails?.investigationCharges || formData?.paymentDetails?.investigationCharges == 0) ? formData?.paymentDetails?.investigationCharges : undefined}
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, investigationCharges: e.target.value ? parseFloat(e.target.value) : undefined}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="other-charge" label="Others Charges" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="₹ 00" size="compact-xs" value={(formData?.paymentDetails?.otherCharges || formData?.paymentDetails?.otherCharges == 0) ? formData?.paymentDetails?.otherCharges : undefined}
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, otherCharges: e.target.value ? parseFloat(e.target.value) : undefined}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="discount" label="Discount" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="₹ 00" size="compact-xs" value={(formData?.paymentDetails?.discount || formData?.paymentDetails?.discount == 0) ? formData?.paymentDetails?.discount : undefined}
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, discount: e.target.value ? parseFloat(e.target.value) : undefined}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:4, lg:4}}>
                    <TextInput data-testid="cost-estimation" label="Total Cost Estimation" type="number" onWheel={(e) => e.currentTarget.blur()} placeholder="₹ 00" size="compact-xs" withAsterisk value={(formData?.paymentDetails?.costEstimation || formData?.paymentDetails?.costEstimation == 0) ? formData?.paymentDetails?.costEstimation : undefined}
                        onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, costEstimation: e.target.value ? parseFloat(e.target.value) : null}})}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
            </Grid>
        </div>

        <h3 className="px-4 py-1 bg-[#43B75D] text-[#FFFFFF] text-[0.8rem] sm:text-[0.9rem] font-medium w-full mt-2">Upload Documents</h3>
        <div className="p-4">
            {/* pre auth documents */}
            <Grid>
                <Grid.Col span={{base:12, sm:8, md:7, lg:7}}>
                    <TextInput withAsterisk label="Document Name" placeholder="Enter document name" size="compact-xs"
                        value={"Pre-Auth Document"} disabled
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:4, md:5, lg:5}}>
                    <FileInput withAsterisk label="Upload Pre-Auth" placeholder="Browse File" size="xs" clearable
                        rightSection={!preAuthFile && <UploadIcon className="text-[#3E97FF]" />}
                        accept="application/pdf" value={preAuthFile} onChange={file => {
                            if(file) {
                                if(file?.size / 1024 / 1024 <= 5 && file?.type === "application/pdf") {
                                    handleUploadPreAuth(file)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                handleRemovePreAuth(preAuth)
                            }
                        }}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem] !overflow-hidden !text-ellipsis !whitespace-nowrap",
                        }}
                    />
                </Grid.Col>
            </Grid>
            {/* additional documents */}
            <Grid>
                <Grid.Col span={{base:12, sm:12, md:7, lg:7}}>
                    <TextInput label="Document Name" placeholder="Enter document name" size="compact-xs"
                        value={docName} onChange={e => setDocName(e.target.value)}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:3, lg:3}}>
                    <FileInput label="Upload Document" placeholder="Browse File" size="xs" clearable
                        rightSection={!file && <UploadIcon className="text-[#3E97FF]" />}
                        accept="application/pdf" value={file} onChange={file => {
                            if(file) {
                                if(file?.size / 1024 / 1024 <= 5 && file?.type === "application/pdf") {
                                    setFile(file)
                                } else {
                                    return notifications.show({
                                        color: "#E0063A",
                                        title: "Error",
                                        message: "Please upload PDF with size upto 5MB only"
                                    })
                                }
                            } else {
                                setFile(null)
                            }
                        }}
                        classNames={{
                            label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                            input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem] !overflow-hidden !text-ellipsis !whitespace-nowrap",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base:12, sm:6, md:2, lg:2}}>
                    <Button size="compact-xs" fullWidth h={32} bg={"#43B75D"} className="mt-6"
                        onClick={()=>handleUploadFile()}
                    >
                        Add
                    </Button>
                </Grid.Col>
            </Grid>
            {formData?.bookingDocs && formData?.bookingDocs.length > 0 && <Grid grow className="mt-4">
                {formData.bookingDocs.map(doc => (
                    <>
                        <Grid.Col span={{base:12, sm:12, md:7, lg:7}}>
                            <TextInput placeholder="Enter document name" size="compact-xs" disabled value={doc.fileName}
                                classNames={{
                                    label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                                    input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:3, lg:3}}>
                            <Button size="compact-xs" fullWidth h={32} bg={"#FFFFFF"} className="!border-1 !border-[#43B75D] !text-[#43B75D]"
                                onClick={()=>setDocUrl(`${doc.filePath}`)}
                            >
                                View
                            </Button>
                        </Grid.Col>
                        <Grid.Col span={{base:12, sm:6, md:2, lg:2}}>
                            <Button size="compact-xs" fullWidth h={32} bg={"#FFFFFF"} className="!border-1 !border-[#EE443F] !text-[#EE443F]" onClick={()=>handleRemoveFile(doc)}>
                                Remove
                            </Button>
                        </Grid.Col>
                    </>
                ))}
            </Grid>}
        </div>

        <div className="flex items-center justify-between mt-10 p-4">
            <Button size="xs" w={100} variant="default" className="!border-[#43B75D] !text-[#43B75D]" radius={5} onClick={()=>setOpenModal(false)}>
                Cancel
            </Button>
            <Button size="xs" w={100} bg={"#43B75D"} radius={5} onClick={()=>handleCreateBooking()}>
                Save
            </Button>
        </div>

        {/* doc modal */}
        {docUrl && <ViewDocModal url={docUrl} setUrl={setDocUrl} />}
        </>
    )
}

export default AddBookingModal