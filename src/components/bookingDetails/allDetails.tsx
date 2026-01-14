import { Grid, ScrollArea } from "@mantine/core";
import React from "react";
import { RootState } from "../../app/store";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const AllDetails:React.FC = () => {

    const data = useSelector((state: RootState) => state.booking.booking)
    const hospitalData = useSelector((state: RootState) => state.hospital.hospital)

    return (
        <div className="w-full overflow-hidden rounded-[0.5rem]">
            <div className="flex items-center justify-between bg-[#39B54A] py-1 px-3">
                <h3 className="text-[#FFFFFF] text-[0.8rem] md:text-[0.9rem] font-semibold">Hospital Details</h3>
            </div>
            <ScrollArea h={"calc(100vh - 10.25rem)"} className="border-1 border-[#ACACAC]" scrollbarSize={6}>
                <div className="p-3">
                    <Grid grow>
                        <Grid.Col span={{base: 3, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >ROHINI ID</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.rohiniId ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 5, md: 8, lg: 8}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Hospital Name</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.name ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 12, md: 12, lg: 12}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Address</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.hospitalDetails?.address ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >State</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.hospitalDetails?.state ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >City</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.hospitalDetails?.city ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Pincode</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.hospitalDetails?.pinCode ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Contact Person</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.contactPerson ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Mobile Number</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.mobileNumber ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Email</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium break-words">{hospitalData?.email ?? "-"}</p>
                        </Grid.Col>
                    </Grid>
                </div>

                {/* basic patient details */}
                <h3 className="text-[#FFFFFF] text-[0.8rem] md:text-[0.9rem] bg-[#39B54A] py-1 px-3 font-semibold my-2">Basic Patient Details</h3>
                <div className="p-3">
                    <Grid grow>
                        <Grid.Col span={{base: 3, md: 3, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >PL Number</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.plNumber ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 5, md: 5, lg: 8}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Patient Name</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.name ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 12, md: 12, lg: 12}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Address</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.address ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 3, md: 3, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Age</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{(data?.patient?.patientAge || data?.patient?.patientAge == 0) ? data?.patient?.patientAge : "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 5, md: 5, lg: 8}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Date Of Birth</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.patientDob ? dayjs(data?.patient?.patientDob).format("DD-MMM-YYYY") : "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Gender</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.patientSex ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 3, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Mobile Number</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.mobileNumber ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 5, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Email</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.email ?? "-"}</p>
                        </Grid.Col>
                        <div className="w-full h-[1px] bg-[#E3E3E3] my-4" />
                        <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Contact Person</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.contactPerson?.name ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 3, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Age</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{(data?.patient?.contactPerson?.age || data?.patient?.contactPerson?.age == 0) ? data?.patient?.contactPerson?.age : "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 3, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Gender</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.contactPerson?.gender ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Email</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.contactPerson?.email ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 3, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Mobile Number</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.contactPerson?.mobileNumber ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 3, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Relation</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.patient?.contactPerson?.relation ?? "-"}</p>
                        </Grid.Col>
                        <div className="w-full h-[1px] bg-[#E3E3E3] my-4" />
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >DOA</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.doa ? dayjs(data?.doa).format("DD-MMM-YYYY") : "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >DOD</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.dod ? dayjs(data?.dod).format("DD-MMM-YYYY") : "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Insurance Provider</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.insuranceCompany?.name ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Insurance Comapny Name</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.insuranceCompanyName ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Policy Number</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.policyNumber ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Policy Type</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.policyType ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Policy Name</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.policyName ?? "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Room Category</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{data?.roomCategory ? (data?.roomCategory + (data?.roomCategory==="OTHERS" && data?.roomCategorySpecify ? ` (${data?.roomCategorySpecify})` : "")) : "-"}</p>
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 4, lg: 4}}>
                            <label className="text-[#767474] text-[0.6rem] md:text-[0.7rem] font-medium" >Cost Estimation</label>
                            <p className="text-[#424141] text-[0.7rem] md:text-[0.8rem] font-medium">{(data?.paymentDetails?.costEstimation || data?.paymentDetails?.costEstimation == 0) ? "₹ " + data?.paymentDetails?.costEstimation?.toLocaleString("en-In") : "-"}</p>
                        </Grid.Col>
                    </Grid>
                </div>
            </ScrollArea>
        </div>
    )
}

export default AllDetails;