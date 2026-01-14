import dayjs from 'dayjs';
import { z } from 'zod'

// Document schema
export const DocumentSchema = z.object({
    fileName: z.string().nonempty({ message: "Please enter file name" }),
    filePath: z.string().nonempty({ message: "Please upload file" }),
    createdAt: z.string().optional(),
    id: z.string().optional(),
})

export const AuditTrailSchema = z.object({
    heading: z.string().optional(),
    type: z.string().optional(),
    desc: z.string().optional(),
    task: z.string().optional(),
    userName: z.string().optional(),
    datetime: z.string().optional(),
})

// Booking schema
export const BookingUpdateSchema = z.object({
    id: z.string().optional(),
    plNumber: z.string().optional(),
    createdAt: z.string().optional(),
    patient: z.object({
        email: z.string().email({message: "Please enter valid patient email"}).optional(),
        name: z.string().optional(),
        mobileNumber: z.string()
            .length(10, { message: "Patient mobile number must have exactly 10 digits" })
            .regex(/^\d+$/, { message: "Patient mobile number must contain only digits" }).optional(),
        alternateNumber: z.string()
            .length(10, { message: "Alternate number must have exactly 10 digits" })
            .regex(/^\d+$/, { message: "Alternate number must contain only digits" }).optional(),
        address: z.string().optional(),
        patientDob: z.string().optional(),
        patientAge: z.number().nonnegative({message: "Patient age cannot be negative"}).optional(),
        patientSex: z.string().optional(),
        contactPerson: z.object({
            name: z.string().optional(),
            relation: z.string().optional(),
            age: z.number().nonnegative({message: "Contact person age cannot be negative"}).optional(),
            gender: z.string().optional(),
            mobileNumber: z.string()
                .length(10, { message: "Contact person mobile number must be 10 digits" })
                .regex(/^\d+$/, { message: "Contact person mobile number must contain only digits" }).optional(),
            email: z.string().email({message: "Please enter valid contact person email address"}).optional(),
        }).optional(),
    }).optional(),
    doctorDetails: z.object({
        name: z.string().optional(),
        number: z.string()
            .length(10, { message: "Doctor contact number must have exactly 10 digits" })
            .regex(/^\d+$/, { message: "Doctor contact number must contain only digits" }).optional(),
        certificateNumber: z.string().optional(),
    }).optional(),
    treatmentType: z.string().optional(),
    treatmentName: z.string().optional(),
    treatmentDetails: z.string().optional(),
    doa: z.string().optional(),
    insuranceId: z.string().optional(),
    insuranceCompany: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
    }).optional(),
    insuranceCompanyName: z.string().optional(),
    policyType: z.string().optional(),
    policyName: z.string().optional(),
    policyNumber: z.string().optional(),
    dod: z.string().optional(),
    uhid: z.string().optional(),
    roomCategory: z.string().optional(),
    roomCategorySpecify: z.string().optional(),
    paymentDetails: z.object({
        roomRentPerDay: z.number().int().nonnegative({message: "Room rent per day cannot be negative"}).optional(),
        totalRoomRent: z.number().int().nonnegative({message: "Total room rent cannot be negative"}).optional(),
        otCharges: z.number().int().nonnegative({message: "OT charges cannot be negative"}).optional(),
        cvc: z.number().int().nonnegative({message: "Consultation charges cannot be negative"}).optional(),
        costEstimation: z.number().int().nonnegative({message: "Cost estimation cannot be negative"}).optional(),
        pharmacyCharges: z.number().int().nonnegative({message: "Pharmacy charges cannot be negative"}).optional(),
        otherCharges: z.number().int().nonnegative({message: "Other charges cannot be negative"}).optional(),
        investigationCharges: z.number().int().nonnegative({message: "Investigation charges cannot be negative"}).optional(),
        discount: z.number().int().nonnegative({message: "Discount cannot be negative"}).optional(),
        alNumber: z.string().optional(),
        paymentDate: z.date().optional(),
        pfAmount: z.number().int().nonnegative({message: "PF Amount cannot be negative"}).optional(),
        payToHospitalAmount: z.number().int().nonnegative({message: "Pay to hospital cannot be negative"}).optional(),
        surgeonFee: z.number().int().nonnegative({message: "Surgeon fess cannot be negative"}).optional(),
        anesthetistCost: z.number().int().nonnegative({message: "Anesthetist cannot be negative"}).optional(),
        packageCharges: z.number().int().nonnegative({message: "Package charges cannot be negative"}).optional(),
        initialApprovedCost: z.number().int().nonnegative({message: "Initial approval cost cannot be negative"}).optional(),
        finalApprovedCost: z.number().int().nonnegative({message: "Final approval cost cannot be negative"}).optional(),
        totalBill: z.number().int().nonnegative({message: "Total bill cannot be negative"}).optional(),
        finalBill: z.number().int().nonnegative({message: "Final bill cannot be negative"}).optional(),
        reimbursementCost: z.number().int().nonnegative({message: "Reimbursement cost cannot be negative"}).optional(),
        deductions: z.number().int().nonnegative({message: "Deductions cannot be negative"}).optional(),
        utr: z.string().optional(),
        agreedCost: z.number().int().nonnegative({message: "Agreed cost cannot be negative"}).optional(),
        treatmentCost: z.number().int().nonnegative({message: "Treatment cost cannot be negative"}).optional(),
    }).optional(),
    bookingDocs: z.array(DocumentSchema).optional(),
    billClosurePath: z.string().optional(),
    billClosureDocType: z.string().optional(),
    documentPaths: z.array(z.string()).optional(),
    patientStatus: z.string().optional(),
    claimStatus: z.string().optional(),
    closureStatus: z.string().optional(),
    auditTrail: z.array(AuditTrailSchema).optional(),
})

// add booking schema
export const AddBookingSchema = z.object({
    patientDetails: z.object({
        email: z.string({message: "Please enter patient email"}).email({message: "Please enter valid patient email"}).nonempty({message: "Please enter patient email"}),
        name: z.string({message: "Please enter patient name"}).nonempty({message: "Please enter patient name"}),
        mobileNumber: z.string({message: "Please enter patient mobile number"})
        .length(10, { message: "Patient mobile number must have exactly 10 digits" })
        .regex(/^\d+$/, { message: "Patient mobile number must contain only digits" }),
        alternateNumber: z.string()
        .length(10, { message: "Alternate number must have exactly 10 digits" })
        .regex(/^\d+$/, { message: "Alternate number must contain only digits" }).optional(),
        address: z.string({message: "Please enter patient address"}).nonempty({message: "Please enter patient address"}),
        patientDob: z.string({message: "Please enter patient date of birth"}).nonempty({message: "Please enter patient date of birth"}),
        patientAge: z.number({message: "Please enter patient age"}).nonnegative({message: "Patient age cannot be negative"}).nullable(),
        patientSex: z.string({message: "Please select patient gender"}).nonempty({message: "Please select patient gender"}),
        contactPerson: z.object({
            name: z.string({message: "Please enter patient's contact person name"}).nonempty({message: "Please enter patient's contact person name"}),
            relation: z.string({message: "Please enter patient's relation with contact person"}).nonempty({message: "Please enter patient's relation with contact person"}),
            age: z.number({message: "Please enter patient's contact person age"}).nonnegative({message: "Contact person age cannot be negative"}).nullable(),
            gender: z.string({message: "Please select patient's contact person gender"}).nonempty({message: "Please select patient's contact person gender"}),
            mobileNumber: z.string({message: "Please enter patient's contact person contact number"}).nonempty({message: "Please enter patient's contact person contact number"})
            .length(10, { message: "Contact person contact number must have exactly 10 digits" })
            .regex(/^\d+$/, { message: "Contact person contact number must contain only digits" }),
            email: z.string({message: "Please enter patient's contact person email address"}).nonempty({message: "Please enter patient's contact person email address"}).email({message: "Please enter valid contact person email address"}),
        }),
    }),
    doctorDetails: z.object({
        name: z.string({message: "Please enter doctor name"}).nonempty({message: "Please enter doctor name"}),
        number: z.string({message: "Please enter doctor contact number"}).nonempty({message: "Please enter doctor contact number"})
        .length(10, { message: "Doctor contact number must have exactly 10 digits" })
        .regex(/^\d+$/, { message: "Doctor contact number must contain only digits" }),
        certificateNumber: z.string({message: "Please enter doctor certificate number"}).nonempty({message: "Please enter doctor certificate number"}),
    }),
    treatmentType: z.string({message: "Please select treatment type"}).nonempty({message: "Please select treatment type"}),
    treatmentName: z.string({message: "Please enter treatment name"}).nonempty({message: "Please enter treatment name"}),
    treatmentDetails: z.string({message: "Please enter treatment details"}).nonempty({message: "Please enter treatment details"}),
    doa: z.string({message: "Please select date of admission"}).nonempty({message: "Please select date of admission"}),
    insuranceId: z.string({message: "Please select insurance provider"}),
    insuranceCompanyName: z.string({message: "Please select insurance company name"}),
    policyType: z.string({message: "Please select type of policy"}),
    policyName: z.string({message: "Please enter policy name"}),
    policyNumber: z.string({message: "Please enter policy number"}),
    dod: z.string({message: "Please select date of discharge"}).nonempty({message: "Please select date of discharge"}),
    uhid: z.string({message: "Please enter member ID/UHID"}).nonempty({message: "Please enter member ID/UHID"}),
    roomCategory: z.string({message: "Please select room category"}).nonempty({message: "Please select room category"}),
    roomCategorySpecify: z.string().optional(),
    paymentDetails: z.object({
        roomRentPerDay: z.number({message: "Please enter room rent per day"}).int().nonnegative({message: "Room rent per day cannot be negative"}).nullable().nullable(),
        totalRoomRent: z.number({message: "Please enter total room rent"}).int().nonnegative({message: "Total room rent cannot be negative"}).nullable().nullable(),
        // otCharges: z.number({message: "Please enter ot charges"}).int().nonnegative({message: "OT charges cannot be negative"}).nullable(),
        cvc: z.number({message: "Please enter consultation and visiting charges"}).int().nonnegative({message: "Consultation charges cannot be negative"}).nullable(),
        costEstimation: z.number({message: "Please enter cost estimation"}).int().nonnegative({message: "Cost estimation cannot be negative"}).nullable(),
        pharmacyCharges: z.number({message: "Please enter pharmacy/medicine charges"}).int().nonnegative({message: "Pharmacy charges cannot be negative"}).nullable(),
        treatmentCost: z.number({message: "Please enter treatment cost"}).int().nonnegative({message: "Treatment cost cannot be negative"}).nullable(),
        otherCharges: z.number().int().nonnegative({message: "Other charges cannot be negative"}).optional(),
        investigationCharges: z.number().int().nonnegative({message: "Investigation charges cannot be negative"}).optional(),
        discount: z.number().int().nonnegative({message: "Discount cannot be negative"}).optional(),
    }),
    bookingDocs: z.array(DocumentSchema).optional(),
})
.refine((data) => {
    // roomCategorySpecify is mandatory only if roomCategory is "OTHERS"
    if (data.roomCategory === "OTHERS" && (!data.roomCategorySpecify || data.roomCategorySpecify === '')) {
        return false;
    }
    return true;
}, {
    message: "Room category specification is required when room category is OTHERS",
    path: ["roomCategorySpecify"]
})
.refine((data) => {
    // doa should always be less than dod when both are present
    if (data.doa && data.dod) {
        const admissionDate = dayjs(data.doa);
        const dischargeDate = dayjs(data.dod);
        
        if (admissionDate.isAfter(dischargeDate)) {
            return false;
        }
    }
    return true;
}, {
    message: "Date of admission cannot be after date of discharge",
    path: ["doa"]
})

export const filterTableSchema = z.object({
    page: z.number().gt(0, { message: "Page must be greater than 0" }).optional(),
    limit: z.number().gt(0, { message: "Limit must be greater than 0" }).optional(),
    plNumber: z.string().optional(),
    patientName: z.string().optional(),
    mobileNumber: z.string().optional(),
    date: z.string().optional(),
    claimStatus: z.string().optional(),
    insuranceId: z.string().optional(),
})