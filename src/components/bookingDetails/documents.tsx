import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Accordion, Box, Button, FileInput, Grid, Modal, ScrollArea, Table, TextInput } from "@mantine/core";
import { EmptyDocIcon, UploadIcon } from "../../assets/icons";
import dayjs from "dayjs";
import axios from "axios";
import { asyncForEach } from "../../utils/utilits";
import { notifications } from "@mantine/notifications";
import useBooking from "../../hooks/useBooking";
import useUploads from "../../hooks/useUploads";
import GlobalLoader from "../GlobalLoader";
import ViewDocModal from "../modals/ViewDocModal";

const getDateFromUrl = (url: string): string => {
    const parts = url.split("/")
    const endString = parts[parts.length - 1].split(".")
    let fileName = endString[0]
    let nameParts = fileName.split("-")
    let date = nameParts[nameParts.length - 1]
    if(isNaN(Number(date))) return ""
    return dayjs(Number(date)).format("DD-MMM-YYYY")
}

const BookingDocuments: React.FC = () => {

    const { updateBookingById } = useBooking()
    const { isLoading, error, getPresignedUrl } = useUploads()

    const data = useSelector((state: RootState) => state.booking.booking)

    const [openModal, setOpenModal] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [docName, setDocName] = useState("")
    const [documents, setDocuments] = useState<{fileName: string, filePath: string}[]>([])

    const [docUrl, setDocUrl] = useState("")

    const handleUploadFile = async () => {
        if(!file || !docName) {
            return notifications.show({
                color: "#E0063A",
                title: "Error",
                message: "Please enter document name and select a file before adding"
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
                const docs = documents ? [...documents] : []
                docs.push({
                    fileName: docName,
                    filePath: `/${import.meta.env.VITE_AWS_BOOKING_PATH}/${import.meta.env.VITE_AWS_DOCUMENTS_PATH}/${fileName}`
                })
                setDocuments(docs)
                setDocName("")
                setFile(null)
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
    
    const handleRemoveFile = async (doc: {fileName: string, filePath: string}) => {
        try {
            const result = await getPresignedUrl({
                filePath: doc.filePath,
                method: "DELETE",
            })
            const response = await axios.delete(result.url)
            if(response.status === 204) {
                let newDocs = documents ? [...documents] : []
                newDocs = newDocs.filter(item => item.filePath !== doc.filePath)
                setDocuments(newDocs)
            }
        } catch (error) {
            //  handle by redux
        }
    }
    
    const handleCloseModal = async () => {
        try {
            if(!documents.length) {
                setDocName("")
                setFile(null)
                setOpenModal(false)
                return
            }
            
            await asyncForEach(documents, async ({ filePath }) => {
                const result = await getPresignedUrl({
                    filePath: filePath,
                    method: "DELETE"
                })
                await axios.delete(result.url)
            })

            setOpenModal(false)

        } catch (error) {
            // handle by redux
        }
    }

    const handleUpdateDocuments = async () => {
        try {
            if(!data?.id) return
            if(documents.length === 0) {
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: "Please add at least one document before saving"
                })
            }
            if(docName || file) {
                return notifications.show({
                    color: "#E0063A",
                    title: "Error",
                    message: "It seems you are trying to add a document, please remove or add before saving"
                })
            }
            const response = await updateBookingById(data?.id, {
                bookingDocs: documents
            })
            if(response.success) {
                setDocName("")
                setFile(null)
                setDocuments([])
                setOpenModal(false)
            }
        } catch (error) {
            // handle by redux
        }
    }

    if(error) {
        if(error.message?.toLowerCase() === "validation error" && Array.isArray(error.errors) && error.errors[0]?.message) {
            notifications.show({
                color: "#E0063A",
                title: "Error",
                message: error.errors[0]?.message
            })
        }
        if(error.message?.toLowerCase() !== "validation error") {
            notifications.show({
                color: "#E0063A",
                title: "Error",
                message: error.message
            })
        }
    }

    return (
        <>
            {isLoading && <GlobalLoader/>}
            <div className="overflow-hidden border-1 border-[#ACACAC] rounded-[0.5rem]">
                <div className="bg-[#39B54A] py-1 px-3 flex items-center justify-between">
                    <h3 className="text-[#FFFFFF] text-[0.8rem] md:text-[0.9rem] font-semibold">All Uploaded Documents</h3>
                    <Button size="xs" rightSection={<UploadIcon className="text-[#FFFFFF]" width={15} height={15} />}
                        onClick={()=>setOpenModal(true)}
                        classNames={{
                            root: "!bg-transparent",
                        }}
                    >
                        Upload
                    </Button>
                </div>
                {data && data?.bookingDocs?.length ? 
                <>
                {/* table for larger screens */}
                <div className="hidden sm:block w-full">
                    <ScrollArea h={"calc(100vh - 80px - 2rem - 8rem)"} scrollbarSize={4}>
                    <Table verticalSpacing="sm" horizontalSpacing="lg" stickyHeader stickyHeaderOffset={0}>
                        <Table.Thead className="!bg-[#F0F0F0]">
                            <Table.Tr>
                                <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] md:text-[0.8rem] font-semibold text-center">S.No.</Table.Td>
                                <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] md:text-[0.8rem] font-semibold">Document Name</Table.Td>
                                <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] md:text-[0.8rem] font-semibold text-center">Uploaded On</Table.Td>
                                <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] md:text-[0.8rem] font-semibold text-center">Type</Table.Td>
                                <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] md:text-[0.8rem] font-semibold text-center">View/Delete</Table.Td>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data?.bookingDocs?.map((doc, idx) => (
                                <Table.Tr>
                                    <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.65rem] md:text-[0.7rem] text-center font-medium">{idx + 1}.</Table.Td>
                                    <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.65rem] md:text-[0.7rem] font-medium">{doc.fileName}</Table.Td>
                                    <Table.Td className="text-center text-[rgba(3,2,41,0.7)] text-[0.65rem] md:text-[0.7rem] font-medium">{doc.createdAt ? dayjs(doc.createdAt).format("DD-MMM-YYYY") : getDateFromUrl(doc.filePath) ?? '-'}</Table.Td>
                                    <Table.Td className="text-center text-[rgba(3,2,41,0.7)] text-[0.65rem] md:text-[0.7rem] font-medium">PDF</Table.Td>
                                    <Table.Td className="text-center text-[rgba(3,2,41,0.7)] text-[0.65rem] md:text-[0.7rem] font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="light" size="xs"
                                                classNames={{
                                                    root: '!h-[1.5rem] !px-3 !bg-[#E6F4FF] !rounded-[0.5rem] !p-0',
                                                    label: '!text-[#3E97FF] font-medium !p-0'
                                                }}
                                                // onClick={()=>setDocUrl(`${doc.filePath}`)}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    </ScrollArea>
                </div>

                {/* accordion for smaller screens */}
                <Accordion classNames={{
                    item: "!border-1 !border-[#CECECE] !rounded-[0.4rem] mb-[0.5rem] !bg-[#FFFFFF]",
                    root: 'p-2 block sm:hidden'
                }}>
                    {data?.bookingDocs?.map((doc, idx) => (
                        <Accordion.Item value={doc.createdAt + Math.random().toString()}>
                            <Accordion.Control className="!px-2">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <h5 className="font-semibold text-[rgba(3,2,41,0.7)] text-[0.8rem] sm:text-[0.9rem]">{idx + 1}.</h5>
                                    <p className="font-semibold text-[rgba(3,2,41,0.7)] text-[0.8rem] sm:text-[0.9rem]">{doc.fileName.slice(0, 100) + "..."}</p>
                                </div>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <p className="text-[0.8rem] sm:text-[0.9rem] text-[#2C2B2B] mb-3"><strong>Document Name: </strong>{doc.fileName}</p>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <p className="text-[0.8rem] sm:text-[0.9rem] text-[#2C2B2B]"><strong>Uploaded On: </strong>{doc.createdAt ? dayjs(doc.createdAt).format("DD-MMM-YYYY") : getDateFromUrl(doc.filePath) ?? '-'}</p>
                                    <p className="text-[0.8rem] sm:text-[0.9rem] text-[#2C2B2B] w-full"><strong>Type: </strong>PDF</p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="light" size="xs"
                                            classNames={{
                                                root: '!h-[1.5rem] !px-3 !bg-[#E6F4FF] !rounded-[0.5rem] !p-0',
                                                label: '!text-[#3E97FF] font-medium !p-0'
                                            }}
                                            // onClick={()=>setDocUrl(`${doc.filePath}`)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
                </>:
                <Box className="flex flex-col items-center p-10">
                    <EmptyDocIcon className="mb-4 text-[#DCDCDC]" width={70} height={72}/>
                    <h4 className="font-medium text-[#898989] text-[1rem] mb-2">No Uploaded document yet</h4>
                    <p className="font-medium text-[#A6AEAE] text-[1rem]">Click on “upload” to add document</p>
                </Box>}
            </div>

            {docUrl && <ViewDocModal url={docUrl} setUrl={setDocUrl} />}

            <Modal opened={openModal} onClose={()=>handleCloseModal()} size={"60vw"} fullScreen={window.innerWidth <= 768}
                title={"Upload Booking Documents"} classNames={{
                    content: "!rounded-none md:!rounded-[0.5rem]",
                    header: "!bg-[#39B54A] !py-0 !min-h-[2rem]",
                    title: "!text-[#FFFFFF] !text-[0.9rem] !font-semibold",
                    close: "!text-[#FFFFFF] hover:!bg-transparent",
                }}
            >
                <Grid className="mt-4" align="end">
                    <Grid.Col span={{base: 12, md: 7, lg: 7}}>
                        <TextInput size="xs" radius={4} label="Document Name" placeholder="Enter Document Name"
                            value={docName} onChange={e => setDocName(e.target.value)}
                            classNames={{
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={{base: 8, md: 3, lg: 3}}>
                        <FileInput size="xs" radius={4} label="Document" placeholder="Browse Document" clearable
                            rightSection={!file && <UploadIcon className="text-[#3E97FF]" width={20} height={15} />}
                            accept="application/pdf" value={file} onChange={e => {
                                if(e) {
                                    if(e?.size / 1024 / 1024 <= 5 && e?.type === "application/pdf") {
                                        setFile(e)
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
                                input: "!border-1 !border-[#CFCECE] !text-[0.7rem] sm:!text-[0.8rem]",
                                label: "!text-[#3B3B3B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={{base: 4, md: 2, lg: 2}}>
                        <Button size="xs" bg={"#39B54A"} fullWidth radius={4} onClick={()=>handleUploadFile()}>
                            Add
                        </Button>
                    </Grid.Col>
                </Grid>

                {documents.length > 0 && <Grid grow className="mt-4">
                    {documents.map(doc => (
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
                                <Button size="compact-xs" fullWidth h={32} bg={"#FFFFFF"} className="!border-1 !border-[#39B54A] !text-[#39B54A]"
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

                <div className="flex items-center justify-between mt-10">
                    <Button size="xs" w={100} variant="default" className="!border-[#39B54A] !text-[#39B54A]" radius={5} onClick={()=>handleCloseModal()}>
                        Cancel
                    </Button>
                    <Button size="xs" w={100} bg={"#39B54A"} radius={5} onClick={()=>handleUpdateDocuments()}>
                        Save
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default BookingDocuments;