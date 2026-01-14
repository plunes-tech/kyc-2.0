import React, { useEffect, useState } from "react";
import { Accordion, Pagination, ScrollArea, Select, Stack, Table } from "@mantine/core";
import { DateProps, dateValue } from "../../features/dashboard/types";
import useDashboard from "../../hooks/useDashboard";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { EmptyIcon } from "../../assets/icons";
import dayjs from "dayjs";

const TransactionDetails: React.FC<DateProps> = ({date, dateString}) => {

    const { transactionStatus } = useDashboard()
    const data = useSelector((state: RootState) => state.dashboard.transactionData)

    const [reloadTable, setReloadTable] = useState(false)
    const [tableParams, setTableParams] = useState({
        page: 1,
        limit: '10',
    })

    useEffect(() => {
    
        const fetchData = async (date: dateValue, dateString?: string, from?: string, to?: string) => {
            try {
                await transactionStatus({
                    page: tableParams.page,
                    limit: Number(tableParams.limit),
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
    }, [date, dateString, reloadTable])

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

    return (
        <>
            <div className="flex flex-col gap-3 items-start md:flex-row md:items-center justify-between p-[0.75rem]">
                <h3 className="text-[#111111] text-[0.8rem] font-semibold">All Successful Transaction Details</h3>
                <div className="flex items-center gap-2">
                    <p className="text-[#43B75D] text-[0.7rem] font-semibold px-2 py-1 border-1 border-[#43B75D] rounded-[0.25rem]">Successful {data?.total ?? 0}</p>
                    <p className="text-[#404040] text-[0.7rem] font-semibold px-2 py-1 border-1 border-[#C9C9C9] rounded-[0.25rem]">Total Cases {data?.successfull ?? 0}</p>
                </div>
            </div>

            {/* table for larger screens */}
            <ScrollArea h={165} className="hidden md:block border-t-1 border-t-[#E8E8E8]">
                <Table verticalSpacing="xs" horizontalSpacing="xxs" stickyHeader stickyHeaderOffset={0}>
                    <Table.Thead className="!bg-[#F2F5FA]">
                        <Table.Tr>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] font-semibold">Pl No.</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] font-semibold">Patient Name</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] font-semibold text-center">DOD</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] font-semibold text-center">Final Approval</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] font-semibold text-center">Amount Settled</Table.Td>
                            <Table.Td className="text-[rgba(3,2,41,0.7)] text-[0.7rem] font-semibold text-center">UTR No.</Table.Td>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {(!data?.bookings || !data?.bookings?.length) && <Table.Tr>
                            <Table.Td>
                                <div className="absolute top-[40%] left-[50%] flex items-center justify-center flex-col gap-2 text-[#D9D9D9] text-[0.8rem] font-semibold">
                                    <EmptyIcon width={40} height={40} />
                                    No Data
                                </div>
                            </Table.Td>
                        </Table.Tr>}
                        {data && data?.bookings && data?.bookings?.map(item => (
                            <Table.Tr key={item.id + Math.random().toString()}>
                                <Table.Td className="text-[0.6rem] text-[rgba(3,2,41,0.7)]">{item.plNumber ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.6rem] text-[rgba(3,2,41,0.7)]">{item.patient?.name ?? "-"}</Table.Td>
                                <Table.Td className="text-[0.6rem] text-center text-[rgba(3,2,41,0.7)]">{item.dod ? dayjs(item.dod).format("DD-MMM-YYYY") : '-'}</Table.Td>
                                <Table.Td className="text-[0.6rem] text-center text-[rgba(3,2,41,0.7)]">{item.paymentDetails?.finalApprovalAmount ? "₹ " + item.paymentDetails?.finalApprovalAmount.toLocaleString('en-IN') : "-"}</Table.Td>
                                <Table.Td className="text-[0.6rem] text-center text-[rgba(3,2,41,0.7)]">{item.paymentDetails?.finalBill ? "₹ " + item.paymentDetails?.finalBill.toLocaleString('en-IN') : "-"}</Table.Td>
                                <Table.Td className="text-[0.6rem] text-center text-[rgba(3,2,41,0.7)]">{item.paymentDetails?.utr ?? "-"}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            {/* accordion for smaller screens */}
            <ScrollArea h={165} className="md:hidden">
                <Accordion classNames={{
                    item: "!border-1 !border-[#CECECE] !rounded-[0.4rem] mb-[0.5rem] !bg-[#FFFFFF]",
                    root: 'p-2'
                }}>
                    {data && data?.bookings && data?.bookings.map(item => (
                        <Accordion.Item value={item.plNumber + Math.random().toString()}>
                            <Accordion.Control className="!px-2">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <h5 className="font-semibold text-[rgba(3,2,41,0.7)] text-[0.8rem] sm:text-[0.9rem]">{item.plNumber ?? "-"}</h5>
                                    <p className="font-semibold text-[rgba(3,2,41,0.7)] text-[0.8rem] sm:text-[0.9rem]">{item.patient?.name ?? "-"}</p>
                                </div>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <p className="text-[0.8rem] sm:text-[0.9rem] text-[#2C2B2B] mb-3"><strong>DOD: </strong>{item.dod ? dayjs(item.dod).format("DD-MMM-YYYY") : '-'}</p>
                                <p className="text-[0.8rem] sm:text-[0.9rem] text-[#2C2B2B] mb-3"><strong>Final Approval: </strong>{item.paymentDetails?.finalApprovalAmount ? "₹ " + item.paymentDetails?.finalApprovalAmount.toLocaleString('en-IN') : "-"}</p>
                                <p className="text-[0.8rem] sm:text-[0.9rem] text-[#2C2B2B] mb-3"><strong>Amount Settled: </strong>{item.paymentDetails?.finalBill ? "₹ " + item.paymentDetails?.finalBill.toLocaleString('en-IN') : "-"}</p>
                                <p className="text-[0.8rem] sm:text-[0.9rem] text-[#2C2B2B] mb-3"><strong>UTR No.: </strong>{item.paymentDetails?.utr ?? "-"}</p>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </ScrollArea>

            {/* pagination for the table */}
            <Stack className="flex-row items-center justify-between mt-1 mb-3 mr-3">
                <div className="flex flex-wrap items-center justify-end gap-5 max-sm:flex-col max-sm:items-end">
                    <span className="text-[0.7rem]">Total: {data?.total ?? 0}</span>
                    <Pagination value={tableParams.page} 
                        onChange={e => handleChangePage(e)}
                        total={data?.total ? Math.ceil(data?.total/Number(tableParams.limit)) : 0}
                        classNames={{
                            control: "!rounded-[100%] !text-[0.75rem] !font-semibold",
                        }}
                        color="#5F8FD7"
                        size={30}
                    />
                    <Select size="xs" radius={4} value={tableParams.limit}
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

export default TransactionDetails;