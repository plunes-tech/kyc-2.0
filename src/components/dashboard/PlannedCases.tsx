import React, { useEffect, useState } from "react";
import { Accordion, Pagination, Radio, ScrollArea, Select, Stack, Table } from "@mantine/core";
import { DateProps, dateValue } from "../../features/dashboard/types";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import useDashboard from "../../hooks/useDashboard";
import { EmptyIcon } from "../../assets/icons";
import dayjs from "dayjs";
import { fromatText } from "../../utils/utilits";

const PlannedCases: React.FC<DateProps> = ({date, dateString}) => {

    const [plannedValue, setPlannedValue] = useState("ADMISSION")
    const { plannedCases } = useDashboard()
    const data = useSelector((state: RootState) => state.dashboard.plannedCasesData)

    const [reloadTable, setReloadTable] = useState(false)
    const [admitTableParams, setAdmitTableParams] = useState({
        page: 1,
        limit: '10',
    })
    const [dischargeTableParams, setDischargeTableParams] = useState({
        page: 1,
        limit: '10',
    })

    useEffect(() => {
    
        const fetchData = async (date: dateValue, dateString?: string, from?: string, to?: string) => {
            try {
                await plannedCases({
                    page: plannedValue === "ADMISSION" ? admitTableParams.page : dischargeTableParams.page,
                    limit: plannedValue === "ADMISSION" ? Number(admitTableParams.limit) : Number(dischargeTableParams.limit),
                    filterType: date, 
                    ...(dateString && {filterValue: dateString}), 
                    ...(from && {from: from}), 
                    ...(to && {to: to}),
                })
            } catch (error) {
                // error handled by redux
            }
        }

        if(date) {
            if(date !== "month" && date !== "year" && date !== "customRange") {
                fetchData(date)
            } else {
                if(dateString && date==="customRange") {
                    fetchData(date, dateString, dateString.split(",")[0], dateString.split(",")[1])
                }
                if (dateString) {
                    fetchData(date, dateString)
                }
            }
        }
    }, [date, dateString, reloadTable, plannedValue])

    // Handle page change
    const handleChangePage = (page: number) => {
        if(plannedValue === "ADMISSION") {
            setAdmitTableParams({
                ...admitTableParams,
                page: page,
            })
        } else {
            setDischargeTableParams({
                ...dischargeTableParams,
                page: page,
            })
        }
        setReloadTable(prev => !prev)
    }

    // handle row per page change
    const handleRowsPerPageChange = (value: string | null) => {
        if(!value) return
        if(plannedValue === "ADMISSION") {
            setAdmitTableParams({
                ...admitTableParams,
                limit: value,
            })
        } else {
            setDischargeTableParams({
                ...dischargeTableParams,
                limit: value,
            })
        }
        setReloadTable(prev => !prev)
    }

    return (
        <>
            <div className="flex flex-col items-start gap-4 sm:items-center sm:flex-row sm:gap-12 p-3">
                <h3 className="text-[#111111] text-[0.8rem] font-semibold">Patient Profile List</h3>
                <Radio.Group value={plannedValue} onChange={e => setPlannedValue(e)}>
                    <div className="flex items-start gap-3 flex-wrap sm:items-center sm:flex-row sm:gap-8">
                        <Radio size="xs" value="ADMISSION" label="Admitted Cases" 
                            classNames={{
                                label: `${plannedValue === "ADMISSION" ? '!text-[#4D4D4D]' : '!text-[#958F8F]'} text-[0.7rem] font-semibold`,
                                radio: "!cursor-pointer",
                            }}
                        />
                        <Radio size="xs" value="DISCHARGE" label="Discharged Cases" 
                            classNames={{
                                label: `${plannedValue === "DISCHARGE" ? '!text-[#4D4D4D]' : '!text-[#958F8F]'} text-[0.7rem] font-semibold`,
                                radio: "!cursor-pointer",
                            }}
                        />
                    </div>
                </Radio.Group>
            </div>

            {/* table for large screens */}
            <ScrollArea w={"calc(100vw - 75px - 4.25rem)"} h={350} className="hidden md:block" scrollbars="y" type="auto">
                <Table verticalSpacing="xs" horizontalSpacing="xxs" stickyHeader stickyHeaderOffset={0}>
                    <Table.Thead className="!bg-[#F2F5FA]">
                        <Table.Tr>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold">Pl No.</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold">Patient Name</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold text-center">Age</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold text-center">{plannedValue === "ADMISSION" ? "DOA" : "DOD"}</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold text-center">Insurance Provider</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold text-center">Treatment</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold text-center">Contact</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold text-center">Bill Amount</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.8rem] font-semibold text-center">Claim Status</Table.Td>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {(!data?.data || !data?.data?.length) && <Table.Tr>
                            <Table.Td>
                                <div className="absolute top-[40%] left-[50%] flex items-center justify-center flex-col gap-2 text-[#D9D9D9] text-[0.8rem] font-semibold">
                                    <EmptyIcon width={40} height={40} />
                                    No Data
                                </div>
                            </Table.Td>
                        </Table.Tr>}
                        {data && data?.data && data?.data?.map((item) => (
                            <Table.Tr key={item.id + Math.random().toString()}>
                                <Table.Td className="text-[0.7rem] text-[#2C2B2B] font-medium">{item.plNumber ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.7rem] text-[#2C2B2B] font-medium">{item.patient?.name ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.7rem] text-center text-[rgba(3,2,41,0.7)]">{item.patient?.patientAge ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.7rem] text-center text-[rgba(3,2,41,0.7)]">{
                                    plannedValue === "ADMISSION" ?
                                    item.doa ? dayjs(item.doa).format("DD-MMM-YYYY") : '-'
                                    : item.dod ? dayjs(item.dod).format("DD-MMM-YYYY") : '-'
                                }</Table.Td>
                                <Table.Td className="text-[0.7rem] text-center text-[rgba(3,2,41,0.7)]">{item.insuranceCompany?.name ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.7rem] text-center text-[rgba(3,2,41,0.7)]">{item.treatmentType ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.7rem] text-center text-[rgba(3,2,41,0.7)]">{item.patient?.mobileNumber ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.7rem] text-center text-[rgba(3,2,41,0.7)]">{item.paymentDetails?.finalBill ? "₹ " + item.paymentDetails?.finalBill.toLocaleString('en-IN') : "-"}</Table.Td>
                                <Table.Td className="text-[0.7rem] text-center text-[rgba(3,2,41,0.7)]">{item.claimStatus ? fromatText(item.claimStatus) : "-"}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            {/* accordion for smaller screens */}
            <ScrollArea h={400} className="block md:hidden" scrollbars="y">
                <Accordion classNames={{
                    item: "!border-1 !border-[#CECECE] !rounded-[0.4rem] mb-[0.5rem] !bg-[#FFFFFF]",
                    root: 'p-2'
                }}>
                    {data && data?.data && data?.data?.map(item => (
                        <Accordion.Item key={item.id + Math.random().toString()} value={item.plNumber + Math.random().toString()}>
                            <Accordion.Control className="!px-2">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <h5 className="font-semibold text-[rgba(3,2,41,0.7)] text-[0.8rem] sm:text-[0.9rem]">{item.plNumber ?? "-"}</h5>
                                    <p className="font-semibold text-[rgba(3,2,41,0.7)] text-[0.8rem] sm:text-[0.9rem]">{item.patient?.name ?? "-" }</p>
                                    <p className="hidden sm:block font-semibold text-[rgba(3,2,41,0.7)] text-[0.9rem]">{item.insuranceCompany?.name ?? "-"}</p>
                                </div>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <p className="text-[0.7rem] sm:text-[0.8rem] text-[#2C2B2B] mb-3"><strong>Age: </strong>{item.patient?.patientAge ?? "-"}</p>
                                <p className="text-[0.7rem] sm:text-[0.8rem] text-[#2C2B2B] mb-3"><strong>DOD: </strong>
                                    {plannedValue === "ADMISSION" ? item.doa ? dayjs(item.doa).format("DD-MMM-YYYY") : '-' : item.dod ? dayjs(item.dod).format("DD-MMM-YYYY") : '-'}
                                </p>
                                <p className="text-[0.7rem] sm:text-[0.8rem] text-[#2C2B2B] mb-3 sm:hidden"><strong>Insurance Partner: </strong>{item.insuranceCompany?.name ?? "-"}</p>
                                <p className="text-[0.7rem] sm:text-[0.8rem] text-[#2C2B2B] mb-3"><strong>Treatment: </strong>{item.treatmentType ?? "-"}</p>
                                <p className="text-[0.7rem] sm:text-[0.8rem] text-[#2C2B2B] mb-3"><strong>Contact: </strong>{item.patient?.mobileNumber ?? "-"}</p>
                                <p className="text-[0.7rem] sm:text-[0.8rem] text-[#2C2B2B] mb-3"><strong>Bill Amount: </strong>{item.paymentDetails?.finalBill ? "₹ " + item.paymentDetails?.finalBill.toLocaleString('en-IN') : "-"}</p>
                                <p className="text-[0.7rem] sm:text-[0.8rem] text-[#2C2B2B]"><strong>Claim Status: </strong>{item.claimStatus ? fromatText(item.claimStatus) : "-"}</p>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </ScrollArea>

            {/* pagination for the table */}
            <Stack className="flex-row items-center justify-between mt-1 mb-3 mr-3">
                <div className="flex flex-wrap items-center justify-end gap-5 max-sm:flex-col max-sm:items-end">
                    <span className="text-[0.7rem]">Total: {data?.total ?? 0}</span>
                    <Pagination value={plannedValue==="ADMISSION" ? admitTableParams.page : dischargeTableParams.page} 
                        onChange={e => handleChangePage(e)}
                        total={data?.total ? (plannedValue==="ADMISSION" ? 
                            Math.ceil(data?.total/Number(admitTableParams.limit)) : 
                            Math.ceil(data?.total/Number(dischargeTableParams.limit))) : 0
                        }
                        classNames={{
                            control: "!rounded-[100%] !text-[0.75rem] !font-semibold",
                        }}
                        color="#5F8FD7"
                        size={30}
                    />
                    <Select size="xs" radius={4} value={plannedValue==="ADMISSION" ? admitTableParams.limit : dischargeTableParams.limit}
                        onChange={(e)=>handleRowsPerPageChange(e)}
                        data={[
                            { value: '10', label: '10 / Page' },
                            { value: '20', label: '20 / Page' },
                            { value: '50', label: '50 / Page' },
                            { value: '100', label: '100 / Page' }
                        ]}
                        classNames={{
                            input: "!w-[7rem]",
                        }}
                    />
                </div>
            </Stack>
        </>
    )
}

export default PlannedCases;