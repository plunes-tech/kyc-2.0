import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import useUploads from "../../hooks/useUploads";
import useBooking from "../../hooks/useBooking";
import { BookingData } from "../../features/booking/types";
import { notifications } from "@mantine/notifications";
import { deepCompare, removeNulls } from "../../utils/utilits";
import { BookingUpdateSchema } from "../../features/booking/schema";
import axios from "axios";
import { CalenderClockIcon, CalenderIcon, EditIcon, EmptyBillClosureIcon, UploadIcon } from "../../assets/icons";
import { Box, Button, CloseIcon, Grid, Modal, Radio, ScrollArea, TextInput } from "@mantine/core";
import dayjs from "dayjs";
import { DatePickerInput } from "@mantine/dates";
import ViewDocModal from "../modals/ViewDocModal";

const Enhancement:React.FC = () => {

    const data = useSelector((state: RootState) => state.booking.booking)
    const hospital = useSelector((state: RootState) => state.auth.user)

    const { getPresignedUrl } = useUploads()
    const { mergeAndUploadDocs, updateBookingById } = useBooking()

    const [toggleDetails, setToggleDetails] = useState(false)
    const [docUrl, setDocUrl] = useState("")
    const [openModal, setOpenModal] = useState(false)
    const [formData, setFormData] = useState<BookingData | null>(null)
    const [allFiles, setAllFiles] = useState<{fileName: string, filePath: string}[]>([])

    useEffect(() => {
        if(data) {
            setFormData(data)
        }
    }, [data])

    useEffect(() => {
        if((formData?.paymentDetails?.totalBill || formData?.paymentDetails?.totalBill == 0)) {
            setFormData({
                ...formData,
                paymentDetails: {
                    ...formData?.paymentDetails,
                    finalBill: (formData?.paymentDetails?.totalBill || 0) - (formData?.paymentDetails?.discount || 0)
                }
            })
        }
    }, [formData?.paymentDetails?.totalBill, formData?.paymentDetails?.discount])

    const handleUploadFile = async () => {
        try {
            // Create file input element
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/pdf';
            // Single file selection
            
            // Promise to handle file selection
            const fileSelectionPromise = new Promise<FileList | null>((resolve) => {
                input.onchange = (event) => {
                    const target = event.target as HTMLInputElement;
                    resolve(target.files);
                };
                
                // Handle cancel/escape
                input.oncancel = () => resolve(null);
            });
            
            // Trigger file dialog
            input.click();
            
            // Wait for file selection
            const selectedFiles = await fileSelectionPromise;
            
            if (!selectedFiles || selectedFiles.length === 0) {
                return; // User cancelled or no file selected
            }
            
            const file = selectedFiles[0]; // Get the single selected file
            
            // Validate the file
            const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
            
            // Check if file is PDF
            if (file.type !== 'application/pdf') {
                // You can show a toast/notification here
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: "Please upload PDFs only"
                })
            }
            
            // Check file size
            if (file.size > maxSizeInBytes) {
                // You can show a toast/notification here
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: "Please upload PDFs with size upto 5 MB"
                })
            }

            // add upload logic here
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
                const docs = formData?.documentPaths ? [...formData?.documentPaths] : []
                docs.push(`/${import.meta.env.VITE_AWS_BOOKING_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`)
                setFormData({...formData, documentPaths: docs})
                const documents = allFiles ? [...allFiles] : []
                documents.push({
                    fileName: file.name,
                    filePath: `/${import.meta.env.VITE_AWS_BOOKING_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`
                })
                setAllFiles(documents)

                return notifications.show({
                    color: "#28A745",
                    title: "Success",
                    message: "File uploaded successfully"
                })
            }
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Couldn't upload file. Please try again later"
            })
        } catch (error) {
            // handle by redux
        }
    }

    const handleRemoveFile = async (filePath: string) => {
        try {
            const result = await getPresignedUrl({
                filePath: filePath,
                method: "DELETE"
            })
            
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                let newDocument = formData?.documentPaths ? [...formData.documentPaths] : []
                newDocument = newDocument.filter(doc => doc !== filePath)
                setFormData({...formData, documentPaths: newDocument})
                const newDoc = allFiles.filter(doc => doc.filePath !== filePath)
                setAllFiles(newDoc)
            }
        } catch (error) {
            // handle by redux
        }
    }

    const handleSaveBillClosure = async () => {
        if(!formData || !data?.id) return 
        if(!formData.documentPaths || !formData.billClosureDocType) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Please select bill closure type and upload documents before saving"
            })
        }
        if(!formData.paymentDetails?.totalBill) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Total bill cannot be empty or 0"
            })
        }
        if(!formData.paymentDetails?.finalBill) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Final bill cannot be empty or 0"
            })
        }
        try {
            let updatedData = deepCompare(data, formData)
            updatedData = removeNulls(updatedData)
            if(!BookingUpdateSchema.safeParse(updatedData).success) {
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: BookingUpdateSchema.safeParse(updatedData).error?.errors[0].message ?? "Unable to save bill closure. Please try again later"
                })
            }
            const response = await mergeAndUploadDocs(data.id, updatedData.documentPaths ?? [])
            if(response.success) {
                // uncomment after whitelisting IP
                // if(updatedData.billClosureDocType === "DISCHARGE") {
                //     await caseStartviaIAssist(response.billClosurePath, "PDF", data.id)
                // }
                delete updatedData["documentPaths"]
                await updateBookingById(data?.id, updatedData)
                setOpenModal(false)
                setFormData(data)
                return
            }
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Unable to save bill closure. Please try again later"
            })
        } catch (error) {
            // handle by redux
            const errMsg = error as any
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: errMsg?.message ?? "Unable to save bill closure. Please try again later"
            })
        }
    }

    return (
        <>
            <div>
                {data && data?.billClosurePath && <>
                <div className="border-1 border-[#ACACAC] rounded-[0.5rem] mb-4 overflow-hidden">
                    <div className={`${data?.billClosureDocType==="DISCHARGE" ? "bg-[#ECF8EF]" : "bg-[#FDECEC]"} text-[#39B54A] flex items-center justify-between px-2 py-1 sm:px-4 sm:py-2`}>
                        <h4 className="text-[0.8rem] sm:text-[0.9rem] font-medium">Added Bill Closure with {data?.billClosureDocType==="DISCHARGE" ? "Discharge Document" : "Enhancement Letter"}</h4>
                        <EditIcon width={18} height={18} className="cursor-pointer" onClick={()=>{setFormData(data); setOpenModal(true)}} />
                    </div>
                    <ScrollArea h={toggleDetails ? "calc(100vh - 80px - 2rem - 5rem)" : 175} scrollbarSize={6}>
                        <div className="px-2 py-1 sm:px-4 sm:py-2">
                            <Grid grow>
                                <Grid.Col span={{base: 6, md: 3, lg: 3}}>
                                    <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Al Number</label>
                                    <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.alNumber ? data?.paymentDetails?.alNumber : "-"}</p>
                                </Grid.Col>
                                <Grid.Col span={{base: 6, md: 3, lg: 3}}>
                                    <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">{data?.billClosureDocType==="DISCHARGE" ? "DOD" : "DOA"}</label>
                                    <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.billClosureDocType==="DISCHARGE" ? (data?.dod ? dayjs(data?.dod).format("DD-MMM-YYYY") : "-") : (data?.doa ? dayjs(data?.doa).format("DD-MMM-YYYY") : "-")}</p>
                                </Grid.Col>
                                <Grid.Col span={{base: 12, md: 6, lg: 6}}>
                                    <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Name</label>
                                    <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.patient?.name ?? "-"}</p>
                                </Grid.Col>
                                <Grid.Col span={{base: 12, md: 12, lg: 12}}>
                                    <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Hospital Name</label>
                                    <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{hospital?.name ?? "-"}</p>
                                </Grid.Col>
                            </Grid>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <CalenderClockIcon className="text-[#424141]" width={16} height={16} />
                                    <p className="text-[#424141] text-[0.6rem] font-medium sm:text-[0.7rem]">{data?.createdAt ? dayjs(data?.createdAt).format("DD-MMM-YYYY, hh:mm a") : "-"}</p>
                                </div>
                                <Button
                                    classNames={{
                                        root: "!bg-transparent !p-0",
                                        label: "!text-[0.6rem] !text-[#0095FF] sm:!text-[0.7rem]"
                                    }}
                                    onClick={() => setToggleDetails(prev => !prev)}
                                >
                                    {toggleDetails ? "View Less" : "View Details"}
                                </Button>
                            </div>
                            {toggleDetails && (
                                <>
                                <Grid grow className="my-4">
                                    <Grid.Col span={12}>
                                        <div className="flex items-center justify-between border-1 border-[#D1D1D1] rounded-[0.5rem] py-1 px-2 w-[calc(320px-2rem)]">
                                            <label className="text-[#424141] text-[0.6rem] font-medium sm:text-[0.7rem]">{data?.billClosureDocType === "DISCHARGE" ? "Discharge Document" : "Enhancement Letter"}</label>
                                            <Button variant="light"
                                                classNames={{
                                                    root: '!h-[1.5rem] !px-3 !bg-[#E6F4FF] !rounded-[0.25rem] !p-0',
                                                    label: '!text-[#3E97FF] !text-[0.7rem] font-medium !p-0'
                                                }}
                                                onClick={()=>setDocUrl(`${data?.billClosurePath}`)}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </Grid.Col>
                                </Grid>
                                <div className="h-0.25 w-full bg-[#DBDADA] my-4"/>
                                <h4 className="text-[0.8rem] sm:text-[0.9rem] font-semibold text-[#39B54A] mb-2">Expense List</h4>
                                <Grid>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Package</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.packageCharges ? `₹ ${data?.paymentDetails?.packageCharges.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Consultation</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.cvc ? `₹ ${data?.paymentDetails?.cvc.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Room Rent & Nursing</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.totalRoomRent ? `₹ ${data?.paymentDetails?.totalRoomRent.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">OT Charges</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.otCharges ? `₹ ${data?.paymentDetails?.otCharges.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Pharmacy</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.pharmacyCharges ? `₹ ${data?.paymentDetails?.pharmacyCharges.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Surgeon Fee</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.surgeonFee ? `₹ ${data?.paymentDetails?.surgeonFee.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Others</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.otherCharges ? `₹ ${data?.paymentDetails?.otherCharges.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">TDS Deductions</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.deductions ? `₹ ${data?.paymentDetails?.deductions.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                </Grid>
                                <div className="h-0.25 w-full bg-[#DBDADA] my-4"/>
                                <Grid grow className="mb-4">
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Total Bill</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.totalBill ? `₹ ${data?.paymentDetails?.totalBill.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Discount</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.discount ? `₹ ${data?.paymentDetails?.discount.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Final Bill</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.finalBill ? `₹ ${data?.paymentDetails?.finalBill.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                    <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                                        <label className="text-[#767474] text-[0.6rem] font-medium sm:text-[0.7rem]">Final Approval</label>
                                        <p className="text-[#424141] text-[0.7rem] font-medium sm:text-[0.8rem]">{data?.paymentDetails?.finalApprovedCost ? `₹ ${data?.paymentDetails?.finalApprovedCost.toLocaleString('en-IN')}` : "-"}</p>
                                    </Grid.Col>
                                </Grid>
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                </>}
                {data && !data?.billClosurePath && <Box w={"15rem"} className="flex flex-col items-center justify-center mx-auto mt-10 md:mt-24">
                    <EmptyBillClosureIcon className="mb-4"/>
                    <h4 className="text-[#898989] text-[1rem] mb-2 font-medium text-center">No bills added yet</h4>
                    <p className="text-[#A6AEAE] text-[0.9rem] text-center mb-4">Start by creating a new bill to keep track of your records</p>
                    <Button size="sm" onClick={()=>setOpenModal(true)}
                        classNames={{
                            root: "!bg-[#39B54A] !rounded-[0.3rem]"
                        }}
                    >
                        + Bill Closure
                    </Button>
                </Box>}
            </div>

            <Modal opened={openModal} onClose={()=>setOpenModal(false)} size={"75vw"} fullScreen={window.innerWidth <= 768}
                title={`${data?.billClosureDocType ? "Update" : "+Add"} Bill Closure`} classNames={{
                    content: "!rounded-none md:!rounded-[0.5rem]",
                    header: "!bg-[#39B54A] !py-0 !min-h-[2rem]",
                    title: "!text-[#FFFFFF] !text-[0.9rem] !font-semibold",
                    close: "!text-[#FFFFFF] hover:!bg-transparent",
                    body: "!p-0"
                }}
            >
                <Radio.Group size="xs" label="Bill Closure Type" withAsterisk value={formData?.billClosureDocType} onChange={e => setFormData({...formData, billClosureDocType: e})} classNames={{
                    label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium mb-2",
                    root: "p-4",
                }}>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                        <Radio color="#39B54A" size="xs" value={"DISCHARGE"} label="With Discharge Documents" />
                        <Radio color="#39B54A" size="xs" value={"ENHANCEMENT"} label="With Enhancement Letters" />
                    </div>
                </Radio.Group>
                <h3 className="px-4 py-1 bg-[#D8F0FF] text-[0.8rem] sm:text-[0.9rem] font-medium w-full mt-2">Patient Information</h3>
                <Grid className="p-4" align="end">
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Al Number" placeholder="Enter Al No." value={formData?.paymentDetails?.alNumber}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, alNumber: e.target.value}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Name" placeholder="Enter Name" disabled value={data?.patient?.name}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Hospital Name" placeholder="Enter Hospital Name" disabled
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <DatePickerInput placeholder="DD-MMM-YYYY" label="Date of Admission (DOA)" size="xs" value={formData?.dod ? dayjs(formData?.dod).toDate() : undefined}
                            rightSection={<CalenderIcon className="text-[#3E97FF]" width={20} height={20} />}
                            onChange={e => setFormData({...formData, doa: e ? dayjs(e).format("DD-MMM-YYYY") : undefined})}
                            maxDate={formData?.dod ? dayjs(formData.dod).toDate() : undefined}
                            classNames={{
                                label: "!text-[#3B3B3B] !font-medium !text-[0.6rem] sm:!text-[0.7rem]",
                                input: "!text-[0.7rem] sm:!text-[0.8rem] !px-2 !h-[2rem]",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <label className="text-[#3B3B3B] font-medium text-[0.6rem] sm:text-[0.7rem]">Upload Doc(s)<span className="text-red-600 text-[0.8rem] ml-1">*</span></label>
                        <Button size="compact-xs" h={"2rem"} fullWidth radius={4} justify="space-between" classNames={{
                                root: "!border-1 !border-[#CFCECE] !bg-transparent !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                            rightSection={<UploadIcon className="text-[#3E97FF]" width={20} height={15} />}
                            onClick={()=>handleUploadFile()}
                        >
                            Browse Document
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        {allFiles.length > 0 && <div className="flex flex-wrap items-center gap-y-4 gap-x-2 p-2 md:p-4 border-1 border-[#D9D9D9] rounded-[0.25rem]">
                            {allFiles.map(doc => (
                                <div key={doc.filePath} className="flex items-center gap-2 bg-[#F2F2F2] rounded-[0.25rem] px-2 py-0.5">
                                    <p className="text-[0.6rem] sm:text-[0.7rem] text-[#696666]">{doc.fileName}</p>
                                    <CloseIcon className="text-[#E0063A] cursor-pointer" width={12} height={12} onClick={()=>handleRemoveFile(doc.filePath)} />
                                </div>
                            ))}
                        </div>}
                    </Grid.Col>
                </Grid>

                <h3 className="px-4 py-1 bg-[#D8F0FF] text-[0.8rem] sm:text-[0.9rem] font-medium w-full mt-2">Expense List</h3>
                <Grid className="p-4">
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Package" placeholder="₹ 00.00" value={formData?.paymentDetails?.packageCharges?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, packageCharges: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Consultation" placeholder="₹ 00.00" value={formData?.paymentDetails?.cvc?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, cvc: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Total Room Rent" placeholder="₹ 00.00" value={formData?.paymentDetails?.totalRoomRent?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, totalRoomRent: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="OT Charges" placeholder="₹ 00.00" value={formData?.paymentDetails?.otCharges?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, otCharges: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Surgeon & Anesthetist" placeholder="₹ 00.00" value={formData?.paymentDetails?.surgeonFee?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, surgeonFee: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Medicine & Consumables" placeholder="₹ 00.00" value={formData?.paymentDetails?.pharmacyCharges?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, pharmacyCharges: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Other Hospital Expenses" placeholder="₹ 00.00" value={formData?.paymentDetails?.otherCharges?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, otherCharges: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="TDS Deductions" placeholder="₹ 00.00" value={formData?.paymentDetails?.deductions?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, deductions: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                </Grid>

                <div className="w-full h-[1px] bg-[#CECECE] mt-4 mb-2" />
                <Grid className="p-4">
                    <Grid.Col span={4}>
                        <TextInput size="xs" withAsterisk radius={4} label="Total Amount" placeholder="₹ 00.00" value={formData?.paymentDetails?.totalBill?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, totalBill: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Discount" placeholder="₹ 00.00" value={formData?.paymentDetails?.discount?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, discount: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" withAsterisk radius={4} label="Final Bill" disabled placeholder="₹ 00.00" value={formData?.paymentDetails?.finalBill?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, finalBill: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput size="xs" radius={4} label="Final Bill Approval" placeholder="₹ 00.00" value={formData?.paymentDetails?.finalApprovedCost?.toString()} type="number" onWheel={e => e.currentTarget.blur()}
                            onChange={e => setFormData({...formData, paymentDetails: {...formData?.paymentDetails, finalApprovedCost: e.target.value ? parseFloat(e.target.value) : undefined}})}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                </Grid>
                <div className="flex items-center justify-between mt-10 p-4">
                    <Button size="xs" w={100} variant="default" className="!border-[#39B54A] !text-[#39B54A]" radius={5} onClick={()=>setOpenModal(false)}>
                        Cancel
                    </Button>
                    <Button size="xs" w={100} bg={"#39B54A"} radius={5} onClick={()=>handleSaveBillClosure()}>
                        Save
                    </Button>
                </div>
            </Modal>
            {docUrl && <ViewDocModal url={docUrl} setUrl={setDocUrl} />}
        </>
    )
}

export default Enhancement;