import { Button, Grid, Modal, Select, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { DownArrowIcon } from "../../assets/icons";
import { BookingData } from "../../features/booking/types";
import AddBookingModal from "../modals/AddBookingModal";

const FillPatientDetails: React.FC = () => {

    const [openBookingModal, setOpenBookingModal] = useState(false)
    const [formData, setFormData] = useState<BookingData>({
        patient: {
            name: "",
            patientAge: undefined,
            mobileNumber: "",
            patientSex: "",
            email: "",
        },
        treatmentType: "",
    })

    return (
        <>
        <div className="p-3">
            <h3 className="text-[#111111] text-[0.8rem] font-semibold mb-2">Fill Patient Details</h3>
            <Grid>
                <Grid.Col span={{base: 12, md: 6, lg: 4}}>
                    <TextInput size="xs" placeholder="Enter Patient Name" radius={4} label="Full Name"
                        value={formData.patient?.name} onChange={(e)=>setFormData({...formData, patient: {...formData.patient, name: e.target.value}})}
                        classNames={{
                            label: "text-[#0C0C0C] !text-[0.7rem] mb-1",
                            input: `!border-[#43B75D] !h-[2rem]`,
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6, lg: 4}}>
                    <TextInput size="xs" placeholder="00 yrs" type="number" onWheel={e => e.currentTarget.blur()} radius={4} label="Age"
                        value={formData.patient?.patientAge} onChange={(e)=>setFormData({...formData, patient: {...formData.patient, patientAge: e.target.value ? parseInt(e.target.value) : undefined}})}
                        classNames={{
                            label: "text-[#0C0C0C] !text-[0.7rem] mb-1",
                            input: `!border-[#43B75D] !h-[2rem]`,
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6, lg: 4}}>
                    <Select label="Gender" radius={4}
                        value={formData.patient?.patientSex} placeholder="Select Gender"
                        onChange={(e) => setFormData({...formData, patient: {...formData.patient, patientSex: e ? e : ""}})}
                        rightSection={<DownArrowIcon className="text-[#111111]" />}
                        data={[
                            {label: 'Male', value: 'M'},
                            {label: 'Female', value: 'F'},
                            {label: 'Others', value: 'O'},
                        ]}
                        classNames={{
                            input: '!border-[#43B75D] !h-[2rem]',
                            label: "text-[#0C0C0C] !text-[0.7rem] mb-1",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6, lg: 4}}>
                    <TextInput size="xs" placeholder="+91 0000000000" radius={4} label="Enter Patient Mobile" type="number"
                        value={formData.patient?.mobileNumber} onChange={(e)=>setFormData({...formData, patient: {...formData.patient, mobileNumber: e.target.value}})}
                        classNames={{
                            label: "text-[#0C0C0C] !text-[0.7rem] mb-1",
                            input: `!border-[#43B75D] !h-[2rem]`,
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6, lg: 4}}>
                    <TextInput size="xs" placeholder="example@gmail.com" radius={4} label="Enter Patient Email"
                        value={formData.patient?.email} onChange={(e)=>setFormData({...formData, patient: {...formData.patient, email: e.target.value}})}
                        classNames={{
                            label: "text-[#0C0C0C] !text-[0.7rem] mb-1",
                            input: `!border-[#43B75D] !h-[2rem]`,
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 6, lg: 4}}>
                    <Select label="Treatment Type" radius={4}
                        value={formData.treatmentType} placeholder="Select Treatment Type"
                        onChange={(e) => setFormData({...formData, treatmentType: e ? e : ""})}
                        rightSection={<DownArrowIcon className="text-[#111111]" />}
                        data={[
                            {label: 'Medical Management', value: 'Medical Management'},
                            {label: 'Surgical Management', value: 'Surgical Management'},
                        ]}
                        classNames={{
                            input: '!border-[#43B75D] !h-[2rem]',
                            label: "text-[#0C0C0C] !text-[0.7rem] mb-1",
                        }}
                    />
                </Grid.Col>
            </Grid>
            <div className="flex justify-center mt-4">
                <Button variant="light"
                    classNames={{
                        root: "!border-b-1 !border-b-[#43B75D] !rounded-none !bg-transparent !p-0 !h-[max-content] mt-2",
                        label: "!text-[#43B75D] !text-[0.8rem] mb-1"
                    }}
                    onClick={()=>setOpenBookingModal(true)}
                >
                    Submit Patient Details
                </Button>
            </div>
        </div>
        {/* add booking modal */}
        <Modal opened={openBookingModal} onClose={()=>setOpenBookingModal(false)} size={"75vw"} fullScreen={window.innerWidth <= 768}
            title="Add Intimation Details" classNames={{
                content: "!rounded-none md:!rounded-[0.5rem]",
                header: `!bg-[#43B75D] !min-h-[2.25rem] !py-0`,
                title: "!text-[#FFFFFF] !text-[0.9rem] sm:!text-[1rem] !font-medium",
                close: "!text-[#FFFFFF] hover:!bg-transparent",
                body: "!p-0",
            }}
        >
            <AddBookingModal setOpenModal={setOpenBookingModal} initialData={formData}/>
        </Modal>
        </>
    )
}

export default FillPatientDetails;