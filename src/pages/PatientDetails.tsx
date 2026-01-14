import React, { useEffect, useState } from "react";
import { Accordion, Button, Grid, Modal, Pagination, Popover, ScrollArea, Select, Stack, Table } from "@mantine/core";
import { DatesRangeValue } from "@mantine/dates";
import dayjs from "dayjs"
import { CalendarClockIcon, CalendarIcon, DownChevronIcon, EmptyIcon, FilterIcon, InsuranceIcon, PatientDetailsIcon, RegisterIcon, VeiwDetailsIcon } from "../assets/icons";
import Filter from "../components/Filters";
import { FilterConfig, OptionProps } from "../utils/types";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import useBooking from "../hooks/useBooking";
import GlobalLoader from "../components/GlobalLoader";
import { fromatText } from "../utils/utilits";
import Notifications from "../components/Notifications";
import AddBookingModal from "../components/modals/AddBookingModal";

const PatientDetails: React.FC<{openModal?: boolean}> = ({openModal}) => {

    const data = useSelector((state: RootState) => state.booking.allBookings)
    const total = useSelector((state: RootState) => state.booking.allBookingCount)
    const allInsurance = useSelector((state: RootState) => state.booking.allInsurance)

    const { isLoading, error, getTableBookings, updateTableBookings, getAllInsurance } = useBooking()

    const [openBookingModal, setOpenBookingModal] = useState(openModal ? openModal : false)
    const [openFilter, setOpenFilter] = useState(false)
    const [reloadTable, setReloadTable] = useState(false)
    const [insuranceList, setInsuranceList] = useState<OptionProps[]>([])
    const [tableParams, setTableParams] = useState({
        page: 1,
        limit: "10",
        plNumber: "",
        date: [null, null] as DatesRangeValue,
        mobilenumber: "",
        patientName: "",
        insuranceProvider: "",
        claimStatus: "",
    })

    const tableFilterConfig: FilterConfig[] = [
        { name: "date", label: "Date", type: "date", placeholder: "Select Date Range" },
        { name: "patientName", label: "Patient Name", type: "input", placeholder: "Enter Name" },
        { name: "plNumber", label: "PL Number", type: "input", placeholder: "Enter PL Number" },
        { name: "mobileNumber", label: "Mobile Number", type: "input", placeholder: "Enter Mobile Number" },
        { 
            name: "insuranceProvider", label: "Insurance", type: "select", 
            placeholder: "Select Insurance Name" , options: insuranceList,
        },
    ]

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getTableBookings({
                    page: tableParams.page,
                    limit: Number(tableParams.limit),
                    ...(tableParams.plNumber && {plNumber: tableParams.plNumber}),
                    ...(tableParams.insuranceProvider && {insuranceId: tableParams.insuranceProvider}),
                    ...(tableParams.patientName && {patientName: tableParams.patientName}),
                    ...(tableParams.mobilenumber && {mobileNumber: tableParams.mobilenumber}),
                    ...(Array.isArray(tableParams.date) && tableParams.date[0] && tableParams.date[1] && {
                            date: `${dayjs(tableParams.date[0]).format("YYYY-MM-DD")},${dayjs(tableParams.date[1]).format("YYYY-MM-DD")}`,
                        }),
                })
            } catch (error) {
                // handle by redux and zod
            }
        }
        fetchData()
    }, [reloadTable])

    // update table
    const handleUpdateTableData = async (bookingId?: string, key?: string, value?: string | number | boolean | null) => {
        if(!bookingId) return
        try {
            if(key && value) {
                await updateTableBookings(bookingId, { [key]: value })
            }
        } catch (error) {
            // handle by redux
        }
    }

    // Handle page change
    const handleChangePage = (page: number) => {
        setTableParams({
            ...tableParams,
            page: page,
        })
        setReloadTable(prev => !prev)
    }

    // handle row per page change
    const handleRowsPerPageChange = (value: string | null) => {
        if(!value) return
        setTableParams({
            ...tableParams,
            page: 1,
            limit: value,
        })
        setReloadTable(prev => !prev)
    }

    // apply filters
    const handleApplyFilters = (filters: Record<string, any>) => {
        setTableParams(prev => ({
            ...prev,
            ...filters,
            page: 1,
        }))
        setReloadTable(prev => !prev)
    }

    return (
        <>
        {isLoading && <GlobalLoader/>}
        {error && error.message && error.message.toLocaleLowerCase() !== "validation error" && <Notifications type="error" title="Error" message={error.message} />}
        {error && error.message && error.message.toLocaleLowerCase() === "validation error" && Array.isArray(error.errors) && error.errors[0]?.message && <Notifications type="error" title="Error" message={error.errors[0].message} />}
        {openFilter && <Filter setOpenFilter={setOpenFilter} onApply={(filters) => handleApplyFilters(filters)} config={tableFilterConfig} initialFilters={tableParams} />}
        <main className="bg-[#F2F5FA] w-[100vw] md:w-[calc(100vw-50px)] mt-[3.5rem] md:ml-[50px]">
        <ScrollArea h={"calc(100vh - 3.5rem)"} className="p-4" scrollbarSize={4}>
            <div className="mb-8 flex items-center justify-between max-md:!justify-end">
                <p className="bg-[#ECF8EF] text-[0.7rem] sm:text-[0.8rem] font-semibold p-1.5 rounded-[0.3rem] max-md:hidden">All created Intimations details & updates</p>
                <div className="flex items-center gap-3">
                    <Button 
                        leftSection={<FilterIcon className="text-[#484A47]"/>} size="xs"
                        variant="default" bg={"#FFFFFF"} color="#484A47" radius={6}
                        className="!border-[#DADADA]" onClick={()=>setOpenFilter(true)}
                    >
                        Filter
                    </Button>
                    <Button size="xs" bg={"#39B54A"} color="#FFFFFF" radius={6} onClick={()=>setOpenBookingModal(true)}>
                        + Add New
                    </Button>
                </div>
            </div>

            {/* Table */}
            <ScrollArea h={"calc(100vh - 3.5rem - 12rem)"} w={"calc(100vw - 50px - 2rem)"} scrollbarSize={6} className="!rounded-[0.5rem] border-1 border-[#BBBBBB] max-sm:hidden">
                <Table verticalSpacing="xs" horizontalSpacing="xxs" stickyHeader stickyHeaderOffset={0}>
                    <Table.Thead className="!bg-[#39B54A]">
                        <Table.Tr>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[8rem]">PL Number</Table.Td>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[10rem]">Name</Table.Td>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[2rem] !text-center">Details</Table.Td>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[7rem] !text-center">Case Details</Table.Td>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[8rem] !text-center">Final Bill</Table.Td>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[8rem] !text-center">Patient Status</Table.Td>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[1rem] !text-center">Claim Status</Table.Td>
                            <Table.Td className="!text-[0.8rem] !text-[#FFFFFF] !font-semibold min-w-[8rem] !text-center">Payment Status</Table.Td>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody className="bg-white">
                        {(!data || !data.length) && <Table.Tr>
                            <Table.Td>
                                <div className="absolute top-[40%] left-[50%] flex items-center justify-center flex-col gap-2 text-[#D9D9D9] text-[0.8rem] font-semibold">
                                    <EmptyIcon width={40} height={40} />
                                    No Data
                                </div>
                            </Table.Td>
                        </Table.Tr>}
                        {data && data?.map((item) => (
                            <Table.Tr key={item.id + Math.random().toString()}>
                                <Table.Td>
                                    <div className="flex items-center gap-2">
                                        <PatientDetailsIcon width={15} height={13} />
                                        <p className="text-[0.7rem]">{item.plNumber}</p>
                                    </div>
                                </Table.Td>
                                <Table.Td className="!text-[0.7rem]">{item.patient?.name ?? "-"}</Table.Td>
                                <Table.Td className="!text-center grid place-content-center">
                                    <Popover position="right-start" classNames={{
                                        dropdown: "!border-[#BEBEBE] !rounded-[0.5rem] !shadow-[0_.3rem_0.3rem_#00000040]"
                                    }}>
                                        <Popover.Target>
                                            <div className="border-1 border-[#3E97FF] rounded-[0.25rem] grid place-content-center p-2 cursor-pointer w-[max-content]">
                                                <VeiwDetailsIcon className="text-[#3E97FF]" />
                                            </div>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <div className="w-[100%]">
                                                <div className="flex gap-2 items-center mb-2">
                                                    <InsuranceIcon className="text-[#43B75D]" />
                                                    <p className="text-[0.7rem] w-[max-content] font-medium">{item.insuranceCompany?.name ?? "-"}</p>
                                                </div>
                                                <div className="flex gap-3 items-center mb-2">
                                                    <p className="w-[max-content] text-[0.7rem] bg-[#EDEDED] p-1.5 rounded-[0.25rem]">
                                                        <span className="text-[#43B75D] font-bold">DOA: </span> {item.doa ? dayjs(item.doa).format("DD-MMM-YYYY") : "-"}
                                                    </p>
                                                    <p className="w-[max-content] text-[0.7rem] bg-[#EDEDED] p-1.5 rounded-[0.25rem]">
                                                        <span className="text-[#43B75D] font-bold">DOD: </span> {item.dod ? dayjs(item.dod).format("DD-MMM-YYYY") : "-"}
                                                    </p>
                                                </div>
                                                <div className="h-[1px] bg-[#E6E6E6] w-[100%] mb-2"/>
                                                <div className="flex gap-2 items-center mb-2">
                                                    <RegisterIcon className="text-[#43B75D] text-[0.7rem]" />
                                                    <p className="w-[max-content] text-[0.7rem]">Register on:</p>
                                                </div>
                                                <div className="flex gap-3 items-center">
                                                    <CalendarClockIcon />
                                                    <p className="w-[max-content] text-[0.7rem]">{dayjs(item.createdAt).format('DD-MMM-YYYY')}</p>
                                                    <p className="w-[max-content] text-[0.7rem]">{dayjs(item.createdAt).format('HH:MM A')}</p>
                                                </div>
                                            </div>
                                        </Popover.Dropdown>
                                    </Popover>
                                </Table.Td>
                                <Table.Td className="!text-center ">
                                    <a className="cursor-pointer text-[#0095FF] font-semibold text-[0.7rem]" href={`/patient-details/booking-details?id=${item.id}`}>View</a>
                                </Table.Td>
                                <Table.Td className="!text-center font-semibold text-[0.7rem]">
                                    {(item.paymentDetails?.finalBill || item.paymentDetails?.finalBill == 0) ? "₹ " + item.paymentDetails?.finalBill?.toLocaleString('en-IN') : "-"}
                                </Table.Td>
                                <Table.Td className="!text-center">
                                    <Select size="xs" radius={4} withCheckIcon={false} rightSection={<DownChevronIcon/>}
                                        value={item.patientStatus} onChange={(e)=>handleUpdateTableData(item.id, "patientStatus", e)}
                                        data={[
                                            {value: 'PENDING', label: 'Pending', disabled: item.patientStatus === "PENDING"},
                                            {value: 'ADMITTED', label: 'Admitted', disabled: item.patientStatus === "ADMITTED"},
                                            {value: 'DISCHARGED', label: 'Discharged', disabled: item.patientStatus === "DISCHARGED"},
                                        ]}
                                        classNames={{
                                            input: `${item.patientStatus === 'Admitted' ? '!border-[#008ABB] !text-[#008ABB]' : item.patientStatus === 'Discharged' ? '!border-[#43B75D] !text-[#43B75D]' : '!border-[#CECECE] !text-[#6A6A6A]'}`,
                                            root: '!w-[10rem] mx-auto',
                                        }}
                                    />
                                </Table.Td>
                                <Table.Td className="!text-center text-[0.7rem]">{item.claimStatus ? fromatText(item.claimStatus) : "-"}</Table.Td>
                                <Table.Td className="!text-center text-[0.7rem]">{item.closureStatus ?? "-"}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            {/* Accordian for smaaler screens */}
            <ScrollArea h={"calc(100vh - 80px - 18rem)"} className="hidden max-sm:block">
                <Accordion multiple={false} classNames={{
                    item: "!border-1 !border-[#CECECE] !rounded-[0.4rem] mb-[0.5rem] !bg-[#FFFFFF]"
                }}>
                    {data && data?.map((item) => (
                        <Accordion.Item key={item.id + Math.random().toString()} value={item.plNumber + Math.random().toString()} >
                            <Accordion.Control icon={
                                <div className="flex items-center gap-1">
                                    <PatientDetailsIcon  />
                                    <p className="text-[0.75rem] text-[#000000] font-medium">{item.plNumber}</p>
                                </div>
                            }>
                                <div className={`flex items-center ${innerWidth > 480 ? 'justify-between' : 'justify-end'}`}>
                                    {innerWidth > 480 && <p className="text-[#2C2B2B] font-medium text-[0.75rem]">{item.patient?.name ?? "-"}</p>}
                                    <div className="flex items-center gap-3 mr-3" onClick={(e) => e.stopPropagation()}>
                                        <Popover width={250} position="bottom" classNames={{
                                            dropdown: "!border-[#BEBEBE] !rounded-[0.5rem] !shadow-[0_.3rem_0.3rem_#00000040]"
                                        }}>
                                            <Popover.Target>
                                                <div className="border-1 border-[#3E97FF] rounded-[0.25rem] grid place-content-center p-[0.3rem] cursor-pointer w-[max-content]">
                                                    <VeiwDetailsIcon className="text-[#3E97FF]" />
                                                </div>
                                            </Popover.Target>
                                            <Popover.Dropdown>
                                                <div className="w-[100%]">
                                                    <div className="flex gap-2 items-center mb-[1rem]">
                                                        <InsuranceIcon className="text-[#43B75D]" />
                                                        <p className="w-[max-content] font-medium text-[0.9rem]">{item.insuranceCompany?.name ?? "-"}</p>
                                                    </div>
                                                    <div className="flex gap-3 items-start flex-col mb-[1rem]">
                                                        <p className="w-[max-content] bg-[#EDEDED] p-1 rounded-[0.25rem] text-[0.9rem]">
                                                            <span className="text-[#43B75D] font-bold text-[0.9rem]">DOA: </span> {item.doa ? dayjs(item.doa).format("DD-MMM-YYYY") : "-"}
                                                        </p>
                                                        <p className="w-[max-content] bg-[#EDEDED] p-1 rounded-[0.25rem] text-[0.9rem]">
                                                            <span className="text-[#43B75D] font-bold text-[0.9rem]">DOD: </span> {item.dod ? dayjs(item.dod).format("DD-MMM-YYYY") : "-"}
                                                        </p>
                                                    </div>
                                                    <div className="h-[1px] bg-[#E6E6E6] w-[100%] mb-[1rem]"/>
                                                    <div className="flex gap-2 items-center mb-[1rem]">
                                                        <RegisterIcon className="text-[#43B75D]" />
                                                        <p className="w-[max-content] text-[0.9rem]">Register on:</p>
                                                    </div>
                                                    <div className="flex gap-3 items-center">
                                                        <CalendarIcon/>
                                                        <p className="w-[max-content] text-[0.9rem]">{dayjs(item.createdAt).format('DD-MMM-YYYY')}</p>
                                                        <p className="w-[max-content] text-[0.9rem]">{dayjs(item.createdAt).format('HH:MM A')}</p>
                                                    </div>
                                                </div>
                                            </Popover.Dropdown>
                                        </Popover>
                                        <a href={`/patient-details/booking-details?id=${item.id}`} className="text-[#0095FF] text-[0.9rem]">View</a>
                                    </div>
                                </div>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Grid className="!mb-[0.5rem]">
                                    <Grid.Col span={6}>
                                        <label className="text-[#212121] font-semibold text-[0.9rem]">Final Bill:</label>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <p className="font-medium text-[0.9rem] sm:text-[1rem]">
                                            {(item.paymentDetails?.finalBill || item.paymentDetails?.finalBill == 0) ? "₹ " + item.paymentDetails?.finalBill?.toLocaleString('en-IN') : "-"}
                                        </p>
                                    </Grid.Col>
                                </Grid>
                                <Grid className="!mb-[0.5rem]">
                                    <Grid.Col span={6}>
                                        <label className="text-[#212121] font-semibold text-[0.9rem]">Patient Status:</label>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Select rightSection={<DownChevronIcon/>}
                                            value={item.patientStatus} onChange={(e)=>handleUpdateTableData(item.id, "patientStatus", e)}
                                            data={[
                                                {value: 'PENDING', label: 'Pending', disabled: item.patientStatus === "PENDING"},
                                                {value: 'ADMITTED', label: 'Admitted', disabled: item.patientStatus === "ADMITTED"},
                                                {value: 'DISCHARGED', label: 'Discharged', disabled: item.patientStatus === "DISCHARGED"},
                                            ]}
                                            classNames={{
                                                root: '!w-[8rem]',
                                                input: `${item.patientStatus === 'Admitted' ? '!border-[#008ABB] !text-[#008ABB]' : item.patientStatus === 'Discharged' ? '!border-[#43B75D] !text-[#43B75D]' : '!border-[#CECECE] !text-[#6A6A6A]'} !rounded-[0.5rem]`
                                            }}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid className="!mb-[0.5rem]">
                                    <Grid.Col span={6}>
                                        <label className="text-[#212121] font-semibold text-[0.9rem]">Claim Status:</label>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <p className="font-medium text-[0.9rem] sm:text-[1rem]">{item.claimStatus ? fromatText(item.claimStatus) : "-"}</p>
                                    </Grid.Col>
                                </Grid>
                                <Grid>
                                    <Grid.Col span={6}>
                                        <label className="text-[#212121] font-semibold text-[0.9rem]">Payment Status:</label>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <p className="font-medium text-[0.9rem] sm:text-[1rem]">{item.closureStatus ?? "-"}</p>
                                    </Grid.Col>
                                </Grid>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </ScrollArea>

            {/* pagination for table here */}
            <Stack className="flex-row items-center justify-between my-6">
                <div className="flex flex-wrap items-center justify-end gap-5 max-sm:flex-col max-sm:items-end">
                    <span className="text-[0.7rem] sm:text-[0.8rem]">Total: {0}</span>
                    <Pagination value={tableParams.page} onChange={e => handleChangePage(e)} 
                        total={total ? (Math.ceil(total/Number(tableParams.limit))) : 0} color="#5F8FD7"
                        classNames={{
                            control: "!rounded-[100%]"
                        }}
                    />
                    <Select size="xs" value={tableParams.limit} onChange={(e)=>handleRowsPerPageChange(e)}
                        data={[
                            { value: '10', label: '10 / Page' },
                            { value: '20', label: '20 / Page' },
                            { value: '50', label: '50 / Page' },
                            { value: '100', label: '100 / Page' }
                        ]}
                        classNames={{
                            input: "!rounded-[0.5rem] !w-[7rem]",
                        }}
                    />
                </div>
            </Stack>
        </ScrollArea>
        </main>

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
            <AddBookingModal setOpenModal={setOpenBookingModal}/>
        </Modal>
        </>
    )
}


export default PatientDetails