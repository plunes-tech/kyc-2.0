import { z } from "zod";

const emailSchema = z.string().email({ message: "Invalid email address" })

const documentTypeSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Document name is required"),
    docUrl: z.string().min(1, "Document URL is required"),
    date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Date must be a valid ISO date string",
    }),
})

export const beneficiarieSchema = z.object({
    id: z.string().optional(),
    beneName: z.string({message: "Beneficiary name cannot be empty"}).nonempty({message: "Beneficiary name cannot be empty"}),
    beneCode: z.string({message: "Beneficiary code cannot be empty"}).nonempty({message: "Beneficiary code cannot be empty"}),
    beneIfsc: z.string({message: "Beneficiary IFSC cannot be empty"}).nonempty({message: "Beneficiary IFSC cannot be empty"}),
    beneAccount: z.string({message: "Beneficiary account number cannot be empty"}).nonempty({message: "Beneficiary account number cannot be empty"})
        .refine((val) => !val || /^\d+$/.test(val), {
            message: "Beneficiary account must only contains digits",
        }),
    beneMobile: z.string({message: "Beneficiary mobile number cannot be empty"}).nonempty({message: "Beneficiary mobile number cannot be empty"})
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Beneficiary mobile number must be a 10-digit number",
        }),
    beneEmail: z.string({message: "Beneficiary email cannot be empty"}).nonempty({message: "Beneficiary email cannot be empty"})
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "Beneficiary email must be a valid email",
        }),
})

export const dpaAccountSchema = z.object({
    type: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional()
        .refine((val) => !val || (val.length > 0 && /^\d+$/.test(val)), {
            message: "DPA account number must only contain digits",
        }),
    mobileNumber: z.string().optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "DPA account contact number must be a valid 10-digit number",
        }),
    email: z.string().optional()
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "DPA account email must be a valid email",
        }),
    bankName: z.string().optional(),
    ifsc: z.string().optional(),
    customerId: z.string().optional(),
    makerId: z.string().optional(),
    checkerId: z.string().optional(),
    benificiaries: z.array(beneficiarieSchema).optional(),
})

export const hospitalDetailsSchema = z.object({
    accountsContactPerson: z.string().optional(),
    accountsContactPersonEmail: z
        .string()
        .optional()
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "Account contact person email must be a valid email",
        }),
    accountsContactPersonContact: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Account contact person number must be a valid 10-digit number",
        }),
    hospitalTariff: z.string().optional(),
    mouSiginingAuthority: z.string().optional(),
    mouSiginingDate: z.string().optional(),
    address: z.string().optional(),
    representativeName: z.string().optional(),
    representativeDesignation: z.string().optional(),
    bedDetails: z.object({
        bedCapacity: z.string().optional(),
        inPatientBeds: z.string().optional()
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "In-Patient beds must only contains digits",
            }),
        dayCareBeds: z.string().optional()
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Day care beds must only contains digits",
            }),
        icuNicu: z.string().optional()
            .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                message: "ICU beds must only contains digits",
            }),
        bedsDistance: z.string().optional()
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Bed distance must only contains digits",
            }),
        singleAc: z.string().optional()
            .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                message: "Single A/C beds must only contains digits",
            }),
        sharingAC: z.string().optional()
            .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                message: "Single A/C beds must only contains digits",
            }),
        nonBedArea: z.string().optional()
            .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                message: "Non bed area must only contains digits",
            }),
        totalBed: z.string().optional()
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Total beds must only contains digits",
            }),
    }).optional(),
    profileDocuments: z.object({
        rohiniCertificate: z.string().optional(),
        registrationCertificate: z.string().optional(),
        tarrifList: z.string().optional(),
        tarrifStatus: z.string().optional(),
        cancelledCheque: z.string().optional(),
        panCard: z.string().optional(),
        gstCertificate: z.string().optional(),
        otherDocuments: z.array(documentTypeSchema).optional(),
    }).optional(),
    registrationNumber: z.string().optional(),
    registrationDate: z.string().optional(),
    registrationAuthority: z.string().optional(),
    multispeciality: z.boolean().optional(),
    typeOfHospital: z.string().optional(),
    careType: z.string().optional(),
    ppnStatus: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    pinCode: z.string().optional()
        .refine((val) => !val || /^\d{6}$/.test(val), {
            message: "Pin-code must be a valid 6-digits number",
        }),
    medicalSuperintendent: z.string().optional(),
    medicalSuperintendentEmail: z
        .string()
        .optional()
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "Medical superintendent email must be a valid email",
        }),
    medicalSuperintendentContact: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Medical superintendent contact number must be a valid 10-digit number",
        }),
    totalArea: z.string().optional()
        .refine((val) => !val || /^\d+$/.test(val), {
            message: "Total area must only contains digits",
        }),
    ownership: z.string().optional(),
    buildingAge: z.string().optional(),
    majorNos: z.string().optional()
        .refine((val) => !val || /^\d+$/.test(val), {
            message: "Major must only contains digits",
        }),
    generalInfo: z.string().optional(),
    minorNos: z.string().optional()
        .refine((val) => !val || /^\d+$/.test(val), {
            message: "Minor must only contains digits",
        }),
    specializedOT: z.string().optional(),
    otZones: z.string().optional(),
    preparationScrub: z.string().optional(),
    laminarFlow: z.string().optional(),
    hepaFilters: z.string().optional(),
    pestManagement: z.string().optional(),
    monitoring: z.string().optional(),
    earthquakeSafety: z.string().optional(),
    fireSafety: z.string().optional(),
    doctorPatientRatio: z.string().optional(),
    nursePatientRatio: z.string().optional(),
    doctorAvailability: z.string().optional(),
    totalStaff: z.string().optional()
        .refine((val) => !val || /^\d+$/.test(val), {
            message: "Total staff must only contains digits",
        }),
    docConsultant: z.string().optional(),
    doctorsTotal: z.string().optional(),
    medicalOfficers: z.string().optional(),
    nursingStaff: z.string().optional(),
    paramedicalStaff: z.string().optional(),
    medicalENT: z.string().optional(),
    generalMedicine: z.string().optional(),
    gastroenterology: z.string().optional(),
    obstetricGynaecology: z.string().optional(),
    urology: z.string().optional(),
    neurology: z.string().optional(),
    cardiology: z.string().optional(),
    surgicalENT: z.string().optional(),
    surgicalCardiology: z.string().optional(),
    surgicalGastroenterology: z.string().optional(),
    generalSurgery: z.string().optional(),
    neurosurgery: z.string().optional(),
    surgicalObstetricGynaecology: z.string().optional(),
    opthalmology: z.string().optional(),
    orthopedics: z.string().optional(),
    plasticSurgery: z.string().optional(),
    surgicalUrology: z.string().optional(),
    oncology: z.string().optional(),
    paediatricsSurgery: z.string().optional(),
    roboticSurgery: z.string().optional(),
    inHouseLab: z.string().optional(),
    bloodBank: z.string().optional(),
    bloodGuidelines: z.string().optional(),
    xRay: z.string().optional(),
    colorDoppler: z.string().optional(),
    mri: z.string().optional(),
    ctScan: z.string().optional(),
    dialysisUnit: z.string().optional(),
    usg: z.string().optional(),
    pharmacy: z.string().optional(),
    ambulance: z.string().optional(),
    dietary: z.string().optional(),
    laundry: z.string().optional(),
    bioGases: z.string().optional(),
    bioWaste: z.string().optional(),
    hosInfoSystem: z.string().optional(),
    fireSafetyCerti: z.string().optional(),
    municipalRecognistion: z.string().optional(),
    housekeeping: z.string().optional(),
    parkingSpace: z.string().optional(),
    floorHeight: z.string().optional()
        .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
            message: "Floor height must only contains digits",
        }),
    panNumber: z.string().optional(),
    panHolderName: z.string().optional(),
    gstNumber: z.string().optional(),
})

export const updateHospitalSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    basicDetailUpdates: z.boolean().optional(),
    createdAt: z.string().optional(),
    contactPerson: z.string().optional(),
    contactPersonEmail: z
        .string()
        .optional()
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "Contact person email must be a valid email",
        }),
    contactPersonContact: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Contact person number must be a valid 10-digit number",
        }),
    email: z
        .string()
        .optional()
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "Hospital email must be a valid email",
        }),
    mobileNumber: z
        .string().optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Hospital contact number must be a valid 10-digit number",
        }),
    alternateMobileNumber: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Alternate contact number must be a valid 10-digit number",
        }),
    rohiniId: z.string().optional()
        .refine((val) => !val || /^\d{13}$/.test(val), {
            message: "ROHINI ID must be 13 digit number",
        }),
    rohiniExpiryDate: z.string().optional(),
    platformSubscriptionFee: z.number()
        .nonnegative({message: "Platform subscription fee cannot be negative"})
        .max(100, {message: "Platform subcription fee cannot be greater that 100"})
        .optional().nullable(),
    tpaHeadDesignation: z.string().optional(),
    marketingTpaHead: z.string().optional(),
    tpaHeadEmail: z
        .string()
        .optional()
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "TPA head email must be a valid email",
        }),
    tpaHeadContact: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "TPA contact number must be a valid 10-digit number",
        }),
    hospitalDetails: hospitalDetailsSchema.optional(),
    dpaAccount: dpaAccountSchema.optional(),
})

export const generalInfoSchema = z.object({
    name: z.string({message: "Hospital name cannot be empty"})
        .nonempty({message: "Hospital name cannot be empty"}),
    contactPerson: z.string().nonempty({message: "Contact person name cannot be empty"}),
    contactPersonEmail: z
        .string().email({message: "Contact person email must be a valid email"})
        .nonempty({message: "Contact person email cannot be empty"})
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "Contact person email must be a valid email",
        }),
    contactPersonContact: z
        .string()
        .nonempty({message: "Contact person contact number cannot be empty"})
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Contact person number must be a valid 10-digit number",
        }),
    email: z.string({message: "Hospital email cannot be empty"}).nonempty({message: "Hospital email cannot be empty"}).email({message: "Please enter valid hospital email"}),
    mobileNumber: z
        .string({message: "Mobile number cannot be empty"})
        .nonempty({message: "Mobile number cannot be empty"})
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Mobile number must be a valid 10-digit number",
        }),
    alternateMobileNumber: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Alternate number must be a valid 10-digit number",
        }),
    rohiniId: z
        .string({message: "ROHINI ID cannot be empty"})
        .nonempty({message: "ROHINI ID cannot be empty"})
        .refine((val) => !val || /^\d{13}$/.test(val), {
            message: "ROHINI ID must be 13 digit number",
        }),
    rohiniExpiryDate: z.string().nonempty({message: "ROHINI expiry date cannot be empty"}),
    platformSubscriptionFee: z
        .number({message: "Platform subscription fee cannot be empty"})
        .min(0, {message: "Platform subcription fee cannot be less than 0"})
        .max(100, {message: "Platform subscription fee cannot be greater than 100"})
        .nonnegative({message: "Platform subscription fee cannot be negative"}),
    tpaHeadDesignation: z.string().nonempty({message: "TPA head designation cannot be empty"}),
    marketingTpaHead: z.string().nonempty({message: "Marketing TPA head cannot be empty"}),
    tpaHeadEmail: z
        .string()
        .nonempty({message: "TPA head email cannot be empty"})
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "TPA email must be a valid email",
        }),
    tpaHeadContact: z
        .string()
        .nonempty({message: "TPA contact number cannot be empty"})
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "TPA contact must be a valid 10-digit number",
        }),
    hospitalDetails: z.object({
        accountsContactPerson: z.string().nonempty({message: "Account contact person name cannot be empty"}),
        accountsContactPersonEmail: z
            .string()
            .nonempty({message: "Account contact person email cannot be empty"})
            .refine((val) => !val || emailSchema.safeParse(val).success, {
                message: "Account contact person email must be a valid email",
            }),
        accountsContactPersonContact: z
            .string()
            .optional()
            .refine((val) => !val || /^\d{10}$/.test(val), {
                message: "Account contact person number must be a valid 10-digit number",
            }),
        hospitalTariff: z.string().nonempty({message: "Hospital tariff cannot be empty"}),
        mouSiginingAuthority: z.string().nonempty({message: "MOU signing authority cannot be empty"}),
        mouSiginingDate: z.string().nonempty({message: "MOU signing date cannot be empty"}),
        address: z.string().nonempty({message: "Address cannot be empty"}),
        representativeName: z.string().nonempty({message: "Representative name cannot be empty"}),
        representativeDesignation: z.string().nonempty({message: "Representative designation cannot be empty"}),
        bedDetails: z.object({
            bedCapacity: z.string().nonempty({message: "Bed capacity cannot be empty"}),
            inPatientBeds: z.string().nonempty({message: "In-Patient beds cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "In-Patient beds must only contains digits",
                }),
            dayCareBeds: z.string().nonempty({message: "Day care beds cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "Day care beds must only contains digits",
                }),
            icuNicu: z.string().nonempty({message: "ICU beds cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "ICU beds must only contains digits",
                }),
            bedsDistance: z.string().nonempty({message: "Bed distance cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "Bed distance must only contains digits",
                }),
            singleAc: z.string().nonempty({message: "Single A/C beds cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "Single A/C beds must only contains digits",
                }),
            sharingAC: z.string().nonempty({message: "Sharing A/C beds cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "Single A/C beds must only contains digits",
                }),
            nonBedArea: z.string().nonempty({message: "Non bed area cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "Non bed area must only contains digits",
                }),
            totalBed: z.string().nonempty({message: "Total beds cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "Total beds must only contains digits",
                }),
        }),
        registrationNumber: z.string().nonempty({message: "Registration number cannot be empty"}),
        registrationDate: z.string().nonempty({message: "Registration date cannot be empty"}),
        registrationAuthority: z.string().nonempty({message: "Registration authority cannot be empty"}),
        multispeciality: z.boolean().optional(),
        typeOfHospital: z.string().nonempty({message: "Type of hospital cannot be empty"}),
        careType: z.string().nonempty({message: "Care type cannot be empty"}),
        ppnStatus: z.string().nonempty({message: "PPN status cannot be empty"}),
        state: z.string().nonempty({message: "State cannot be empty"}),
        city: z.string().nonempty({message: "City cannot be empty"}),
        pinCode: z.string().nonempty({message: "Pin-code cannot be empty"})
            .refine((val) => !val || /^\d{6}$/.test(val), {
                message: "Pin-code must be a valid 6-digits number",
            }),
        medicalSuperintendent: z.string().nonempty({message: "Medical superintendent name cannot be empty"}),
        medicalSuperintendentEmail: z
            .string()
            .nonempty({message: "Medical superintendent email cannot be empty"})
            .refine((val) => !val || emailSchema.safeParse(val).success, {
                message: "Medical superintendent email must be a valid email",
            }),
        medicalSuperintendentContact: z
            .string()
            .nonempty({message: "Medical superintendent contact number cannot be empty"})
            .refine((val) => !val || /^\d{10}$/.test(val), {
                message: "Medical superintendent contact number must be a valid 10-digit number",
            }),
        totalArea: z.string().nonempty({message: "Total area cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Total area must only contains digits",
            }),
        ownership: z.string().nonempty({message: "Ownership cannot be empty"}),
        buildingAge: z.string().nonempty({message: "Building age cannot be empty"}),
        majorNos: z.string().nonempty({message: "Major number cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Major must only contains digits",
            }),
        generalInfo: z.string().nonempty({message: "General information cannot be empty"}),
        minorNos: z.string().nonempty({message: "Minor number cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Minor must only contains digits",
            }),
        specializedOT: z.string().nonempty({message: "Specialized OT cannot be empty"}),
        otZones: z.string().nonempty({message: "OT zones cannot be empty"}),
        preparationScrub: z.string().nonempty({message: "Preparation scrub cannot be empty"}),
        laminarFlow: z.string().nonempty({message: "Laminar flow cannot be empty"}),
        hepaFilters: z.string().nonempty({message: "HEPA filters cannot be empty"}),
        pestManagement: z.string().nonempty({message: "Pest management cannot be empty"}),
        monitoring: z.string().nonempty({message: "Monitoring cannot be empty"}),
        earthquakeSafety: z.string().nonempty({message: "Earthquake safety cannot be empty"}),
        fireSafety: z.string().nonempty({message: "Fire safety cannot be empty"}),
        doctorPatientRatio: z.string().nonempty({message: "Doctor patient ratio cannot be empty"}),
        nursePatientRatio: z.string().nonempty({message: "Nurse patient ratio cannot be empty"}),
        doctorAvailability: z.string().nonempty({message: "Doctor availability cannot be empty"}),
        totalStaff: z.string().nonempty({message: "Total staff cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Total staff must only contains digits",
            }),
        docConsultant: z.string().nonempty({message: "Doctor consultant cannot be empty"}),
        doctorsTotal: z.string().nonempty({message: "Total doctors cannot be empty"}),
        medicalOfficers: z.string().nonempty({message: "Medical officers cannot be empty"}),
        nursingStaff: z.string().nonempty({message: "Nursing staff cannot be empty"}),
        paramedicalStaff: z.string().nonempty({message: "Paramedical staff cannot be empty"}),
        medicalENT: z.string().nonempty({message: "Medical ENT cannot be empty"}),
        generalMedicine: z.string().nonempty({message: "General medicine cannot be empty"}),
        gastroenterology: z.string().nonempty({message: "Gastroenterology cannot be empty"}),
        obstetricGynaecology: z.string().nonempty({message: "Obstetric Gynaecology cannot be empty"}),
        urology: z.string().nonempty({message: "Urology cannot be empty"}),
        neurology: z.string().nonempty({message: "Neurology cannot be empty"}),
        cardiology: z.string().nonempty({message: "Cardiology cannot be empty"}),
        surgicalENT: z.string().nonempty({message: "Surgical ENT cannot be empty"}),
        surgicalCardiology: z.string().nonempty({message: "Surgical Cardiology cannot be empty"}),
        surgicalGastroenterology: z.string().nonempty({message: "Surgical Gastroenterology cannot be empty"}),
        generalSurgery: z.string().nonempty({message: "General Surgery cannot be empty"}),
        neurosurgery: z.string().nonempty({message: "Neurosurgery cannot be empty"}),
        surgicalObstetricGynaecology: z.string().nonempty({message: "Surgical Obstetric Gynaecology cannot be empty"}),
        opthalmology: z.string().nonempty({message: "Ophthalmology cannot be empty"}),
        orthopedics: z.string().nonempty({message: "Orthopedics cannot be empty"}),
        plasticSurgery: z.string().nonempty({message: "Plastic Surgery cannot be empty"}),
        surgicalUrology: z.string().nonempty({message: "Surgical Urology cannot be empty"}),
        oncology: z.string().nonempty({message: "Oncology cannot be empty"}),
        paediatricsSurgery: z.string().nonempty({message: "Paediatrics Surgery cannot be empty"}),
        roboticSurgery: z.string().nonempty({message: "Robotic Surgery cannot be empty"}),
        inHouseLab: z.string().nonempty({message: "In-house lab cannot be empty"}),
        bloodBank: z.string().nonempty({message: "Blood bank cannot be empty"}),
        bloodGuidelines: z.string().nonempty({message: "Blood guidelines cannot be empty"}),
        xRay: z.string().nonempty({message: "X-Ray cannot be empty"}),
        colorDoppler: z.string().nonempty({message: "Color Doppler cannot be empty"}),
        mri: z.string().nonempty({message: "MRI cannot be empty"}),
        ctScan: z.string().nonempty({message: "CT Scan cannot be empty"}),
        dialysisUnit: z.string().nonempty({message: "Dialysis unit cannot be empty"}),
        usg: z.string().nonempty({message: "USG cannot be empty"}),
        pharmacy: z.string().nonempty({message: "Pharmacy cannot be empty"}),
        ambulance: z.string().nonempty({message: "Ambulance cannot be empty"}),
        dietary: z.string().nonempty({message: "Dietary cannot be empty"}),
        laundry: z.string().nonempty({message: "Laundry cannot be empty"}),
        bioGases: z.string().nonempty({message: "Bio gases cannot be empty"}),
        bioWaste: z.string().nonempty({message: "Bio waste cannot be empty"}),
        hosInfoSystem: z.string().nonempty({message: "Hospital information system cannot be empty"}),
        fireSafetyCerti: z.string().nonempty({message: "Fire safety certificate cannot be empty"}),
        municipalRecognistion: z.string().nonempty({message: "Municipal recognition cannot be empty"}),
        housekeeping: z.string().nonempty({message: "Housekeeping cannot be empty"}),
        parkingSpace: z.string().nonempty({message: "Parking space cannot be empty"}),
        floorHeight: z.string().nonempty({message: "Floor height cannot be empty"})
            .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                message: "Floor height must only contains digits",
            }),
    }),
    profileDocuments: z.object({
        rohiniCertificate: z.string().nonempty({message: "ROHINI certificate cannot be empty"}),
        registrationCertificate: z.string().nonempty({message: "Registration certificate cannot be empty"}),
        tarrifList: z.string().nonempty({message: "TARIFF certificate cannot be empty"}),
    }),
})

export const accountInfoSchema = z.object({
    hospitalDetails: z.object({
        panNumber: z.string().nonempty({message: "PAN number cannot be empty"}),
        panHolderName: z.string().nonempty({message: "PAN holder name cannot be empty"}),
        gstNumber: z.string().nonempty({message: "GST number cannot be empty"}),
    }),
    profileDocuments: z.object({
        cancelledCheque: z.string().nonempty({message: "Cancelled cheque cannot be empty"}),
        panCard: z.string().nonempty({message: "PAN card cannot be empty"}),
        gstCertificate: z.string().nonempty({message: "GST certificate cannot be empty"}),
    }),
})

export const AddHospitalSchema = z.object({
    name: z.string({message: "Hospital name cannot be empty"})
        .nonempty({message: "Hospital name cannot be empty"}),
    contactPerson: z.string().nonempty({message: "Contact person name cannot be empty"}),
    contactPersonEmail: z
        .string().email({message: "Contact person email must be a valid email"})
        .nonempty({message: "Contact person email cannot be empty"})
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "Contact person email must be a valid email",
        }),
    contactPersonContact: z
        .string()
        .nonempty({message: "Contact person contact number cannot be empty"})
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Contact person number must be a valid 10-digit number",
        }),
    email: z.string({message: "Hospital email cannot be empty"}).nonempty({message: "Hospital email cannot be empty"}).email({message: "Please enter valid hospital email"}),
    mobileNumber: z
        .string({message: "Mobile number cannot be empty"})
        .nonempty({message: "Mobile number cannot be empty"})
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Mobile number must be a valid 10-digit number",
        }),
    alternateMobileNumber: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "Alternate number must be a valid 10-digit number",
        }),
    rohiniId: z
        .string({message: "ROHINI ID cannot be empty"})
        .nonempty({message: "ROHINI ID cannot be empty"})
        .refine((val) => !val || /^\d{13}$/.test(val), {
            message: "ROHINI ID must be 13 digit number",
        }),
    rohiniExpiryDate: z.string().nonempty({message: "ROHINI expiry date cannot be empty"}),
    platformSubscriptionFee: z
        .number({message: "Platform subscription fee cannot be empty"})
        .min(0, {message: "Platform subcription fee cannot be less than 0"})
        .max(100, {message: "Platform subscription fee cannot be greater than 100"})
        .nonnegative({message: "Platform subscription fee cannot be negative"})
        .nullable(),
    tpaHeadDesignation: z.string().nonempty({message: "TPA head designation cannot be empty"}),
    marketingTpaHead: z.string().nonempty({message: "Marketing TPA head cannot be empty"}),
    tpaHeadEmail: z
        .string()
        .nonempty({message: "TPA head email cannot be empty"})
        .refine((val) => !val || emailSchema.safeParse(val).success, {
            message: "TPA email must be a valid email",
        }),
    tpaHeadContact: z
        .string()
        .nonempty({message: "TPA contact number cannot be empty"})
        .refine((val) => !val || /^\d{10}$/.test(val), {
            message: "TPA contact must be a valid 10-digit number",
        }),
    hospitalDetails: z.object({
        accountsContactPerson: z.string().nonempty({message: "Account contact person name cannot be empty"}),
        accountsContactPersonEmail: z
            .string()
            .nonempty({message: "Account contact person email cannot be empty"})
            .refine((val) => !val || emailSchema.safeParse(val).success, {
                message: "Account contact person email must be a valid email",
            }),
        accountsContactPersonContact: z
            .string()
            .optional()
            .refine((val) => !val || /^\d{10}$/.test(val), {
                message: "Account contact person number must be a valid 10-digit number",
            }),
        hospitalTariff: z.string().nonempty({message: "Hospital tariff cannot be empty"}),
        mouSiginingAuthority: z.string().nonempty({message: "MOU signing authority cannot be empty"}),
        mouSiginingDate: z.string().nonempty({message: "MOU signing date cannot be empty"}),
        address: z.string().nonempty({message: "Address cannot be empty"}),
        representativeName: z.string().nonempty({message: "Representative name cannot be empty"}),
        representativeDesignation: z.string().nonempty({message: "Representative designation cannot be empty"}),
        bedDetails: z.object({
            bedCapacity: z.string().nonempty({message: "Bed capacity cannot be empty"}),
            inPatientBeds: z.string().nonempty({message: "In-Patient beds cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "In-Patient beds must only contains digits",
                }),
            dayCareBeds: z.string().nonempty({message: "Day care beds cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "Day care beds must only contains digits",
                }),
            icuNicu: z.string().nonempty({message: "ICU beds cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "ICU beds must only contains digits",
                }),
            bedsDistance: z.string().nonempty({message: "Bed distance cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "Bed distance must only contains digits",
                }),
            singleAc: z.string().nonempty({message: "Single A/C beds cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "Single A/C beds must only contains digits",
                }),
            sharingAC: z.string().nonempty({message: "Sharing A/C beds cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "Single A/C beds must only contains digits",
                }),
            nonBedArea: z.string().nonempty({message: "Non bed area cannot be empty"})
                .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                    message: "Non bed area must only contains digits",
                }),
            totalBed: z.string().nonempty({message: "Total beds cannot be empty"})
                .refine((val) => !val || /^\d+$/.test(val), {
                    message: "Total beds must only contains digits",
                }),
        }),
        registrationNumber: z.string().nonempty({message: "Registration number cannot be empty"}),
        registrationDate: z.string().nonempty({message: "Registration date cannot be empty"}),
        registrationAuthority: z.string().nonempty({message: "Registration authority cannot be empty"}),
        multispeciality: z.boolean().optional(),
        typeOfHospital: z.string().nonempty({message: "Type of hospital cannot be empty"}),
        careType: z.string().nonempty({message: "Care type cannot be empty"}),
        ppnStatus: z.string().nonempty({message: "PPN status cannot be empty"}),
        state: z.string().nonempty({message: "State cannot be empty"}),
        city: z.string().nonempty({message: "City cannot be empty"}),
        pinCode: z.string().nonempty({message: "Pin-code cannot be empty"})
            .refine((val) => !val || /^\d{6}$/.test(val), {
                message: "Pin-code must be a valid 6-digits number",
            }),
        medicalSuperintendent: z.string().nonempty({message: "Medical superintendent name cannot be empty"}),
        medicalSuperintendentEmail: z
            .string()
            .nonempty({message: "Medical superintendent email cannot be empty"})
            .refine((val) => !val || emailSchema.safeParse(val).success, {
                message: "Medical superintendent email must be a valid email",
            }),
        medicalSuperintendentContact: z
            .string()
            .nonempty({message: "Medical superintendent contact number cannot be empty"})
            .refine((val) => !val || /^\d{10}$/.test(val), {
                message: "Medical superintendent contact number must be a valid 10-digit number",
            }),
        totalArea: z.string().nonempty({message: "Total area cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Total area must only contains digits",
            }),
        ownership: z.string().nonempty({message: "Ownership cannot be empty"}),
        buildingAge: z.string().nonempty({message: "Building age cannot be empty"}),
        majorNos: z.string().nonempty({message: "Major number cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Major must only contains digits",
            }),
        generalInfo: z.string().nonempty({message: "General information cannot be empty"}),
        minorNos: z.string().nonempty({message: "Minor number cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Minor must only contains digits",
            }),
        specializedOT: z.string().nonempty({message: "Specialized OT cannot be empty"}),
        otZones: z.string().nonempty({message: "OT zones cannot be empty"}),
        preparationScrub: z.string().nonempty({message: "Preparation scrub cannot be empty"}),
        laminarFlow: z.string().nonempty({message: "Laminar flow cannot be empty"}),
        hepaFilters: z.string().nonempty({message: "HEPA filters cannot be empty"}),
        pestManagement: z.string().nonempty({message: "Pest management cannot be empty"}),
        monitoring: z.string().nonempty({message: "Monitoring cannot be empty"}),
        earthquakeSafety: z.string().nonempty({message: "Earthquake safety cannot be empty"}),
        fireSafety: z.string().nonempty({message: "Fire safety cannot be empty"}),
        doctorPatientRatio: z.string().nonempty({message: "Doctor patient ratio cannot be empty"}),
        nursePatientRatio: z.string().nonempty({message: "Nurse patient ratio cannot be empty"}),
        doctorAvailability: z.string().nonempty({message: "Doctor availability cannot be empty"}),
        totalStaff: z.string().nonempty({message: "Total staff cannot be empty"})
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Total staff must only contains digits",
            }),
        docConsultant: z.string().nonempty({message: "Doctor consultant cannot be empty"}),
        doctorsTotal: z.string().nonempty({message: "Total doctors cannot be empty"}),
        medicalOfficers: z.string().nonempty({message: "Medical officers cannot be empty"}),
        nursingStaff: z.string().nonempty({message: "Nursing staff cannot be empty"}),
        paramedicalStaff: z.string().nonempty({message: "Paramedical staff cannot be empty"}),
        medicalENT: z.string().nonempty({message: "Medical ENT cannot be empty"}),
        generalMedicine: z.string().nonempty({message: "General medicine cannot be empty"}),
        gastroenterology: z.string().nonempty({message: "Gastroenterology cannot be empty"}),
        obstetricGynaecology: z.string().nonempty({message: "Obstetric Gynaecology cannot be empty"}),
        urology: z.string().nonempty({message: "Urology cannot be empty"}),
        neurology: z.string().nonempty({message: "Neurology cannot be empty"}),
        cardiology: z.string().nonempty({message: "Cardiology cannot be empty"}),
        surgicalENT: z.string().nonempty({message: "Surgical ENT cannot be empty"}),
        surgicalCardiology: z.string().nonempty({message: "Surgical Cardiology cannot be empty"}),
        surgicalGastroenterology: z.string().nonempty({message: "Surgical Gastroenterology cannot be empty"}),
        generalSurgery: z.string().nonempty({message: "General Surgery cannot be empty"}),
        neurosurgery: z.string().nonempty({message: "Neurosurgery cannot be empty"}),
        surgicalObstetricGynaecology: z.string().nonempty({message: "Surgical Obstetric Gynaecology cannot be empty"}),
        opthalmology: z.string().nonempty({message: "Ophthalmology cannot be empty"}),
        orthopedics: z.string().nonempty({message: "Orthopedics cannot be empty"}),
        plasticSurgery: z.string().nonempty({message: "Plastic Surgery cannot be empty"}),
        surgicalUrology: z.string().nonempty({message: "Surgical Urology cannot be empty"}),
        oncology: z.string().nonempty({message: "Oncology cannot be empty"}),
        paediatricsSurgery: z.string().nonempty({message: "Paediatrics Surgery cannot be empty"}),
        roboticSurgery: z.string().nonempty({message: "Robotic Surgery cannot be empty"}),
        inHouseLab: z.string().nonempty({message: "In-house lab cannot be empty"}),
        bloodBank: z.string().nonempty({message: "Blood bank cannot be empty"}),
        bloodGuidelines: z.string().nonempty({message: "Blood guidelines cannot be empty"}),
        xRay: z.string().nonempty({message: "X-Ray cannot be empty"}),
        colorDoppler: z.string().nonempty({message: "Color Doppler cannot be empty"}),
        mri: z.string().nonempty({message: "MRI cannot be empty"}),
        ctScan: z.string().nonempty({message: "CT Scan cannot be empty"}),
        dialysisUnit: z.string().nonempty({message: "Dialysis unit cannot be empty"}),
        usg: z.string().nonempty({message: "USG cannot be empty"}),
        pharmacy: z.string().nonempty({message: "Pharmacy cannot be empty"}),
        ambulance: z.string().nonempty({message: "Ambulance cannot be empty"}),
        dietary: z.string().nonempty({message: "Dietary cannot be empty"}),
        laundry: z.string().nonempty({message: "Laundry cannot be empty"}),
        bioGases: z.string().nonempty({message: "Bio gases cannot be empty"}),
        bioWaste: z.string().nonempty({message: "Bio waste cannot be empty"}),
        hosInfoSystem: z.string().nonempty({message: "Hospital information system cannot be empty"}),
        fireSafetyCerti: z.string().nonempty({message: "Fire safety certificate cannot be empty"}),
        municipalRecognistion: z.string().nonempty({message: "Municipal recognition cannot be empty"}),
        housekeeping: z.string().nonempty({message: "Housekeeping cannot be empty"}),
        parkingSpace: z.string().nonempty({message: "Parking space cannot be empty"}),
        floorHeight: z.string().nonempty({message: "Floor height cannot be empty"})
            .refine((val) => !val || /^\d*\.?\d+$/.test(val), {
                message: "Floor height must only contains digits",
            }),
        panNumber: z.string().nonempty({message: "PAN number cannot be empty"}),
        panHolderName: z.string().nonempty({message: "PAN holder name cannot be empty"}),
        gstNumber: z.string().nonempty({message: "GST number cannot be empty"}),
        profileDocuments: z.object({
            rohiniCertificate: z.string().nonempty({message: "ROHINI certificate cannot be empty"}),
            registrationCertificate: z.string().nonempty({message: "Registration certificate cannot be empty"}),
            tarrifList: z.string().nonempty({message: "TARIFF certificate cannot be empty"}),
            cancelledCheque: z.string().nonempty({message: "Cancelled cheque cannot be empty"}),
            panCard: z.string().nonempty({message: "PAN card cannot be empty"}),
            gstCertificate: z.string().nonempty({message: "GST certificate cannot be empty"}),
            otherDocuments: z.array(documentTypeSchema).optional(),
        }),
    }),
})