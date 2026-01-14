import { z } from "zod";
import dayjs from "dayjs";

export const filterDateSchema = z.object({
    filterType: z.enum([
        "today",
        "yesterday",
        "lastWeek",
        "thisWeek",
        "month",
        "year",
        "customRange",
    ]),
    filterValue: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
})
.superRefine((data, ctx) => {
    const { filterType, filterValue, from, to } = data;

    // === Validate filterValue for "month"
    if (filterType === "month") {
        if (!filterValue) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Please select month and year for month filter`,
            });
        } else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(filterValue)) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Selected date filter must be in "YYYY-MM" format for month filter`,
            });
        }
    }

    // === Validate filterValue for "year"
    if (filterType === "year") {
        if (!filterValue) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Please select year for year filter`,
            });
        } else if (!/^\d{4}$/.test(filterValue)) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Selected must be a 4-digit year (e.g., 2025) for year filter`,
            });
        }
    }

    // === Validate customRange: from/to must exist, be valid, and from <= to
    if (filterType === "customRange") {
        if (!from) {
            ctx.addIssue({
                path: ["from"],
                code: z.ZodIssueCode.custom,
                message: `Start date is required for custom range`,
            });
        }
        if (!to) {
            ctx.addIssue({
                path: ["to"],
                code: z.ZodIssueCode.custom,
                message: `End date is required for custom range`,
            });
        }
        const fromDate = from ? dayjs(from, "YYYY-MM-DD", true) : null;
        const toDate = to ? dayjs(to, "YYYY-MM-DD", true) : null;
        if (from && (!fromDate || !fromDate.isValid())) {
            ctx.addIssue({
                path: ["from"],
                code: z.ZodIssueCode.custom,
                message: `Start date must be a valid date in YYYY-MM-DD format`,
            });
        }
        if (to && (!toDate || !toDate.isValid())) {
            ctx.addIssue({
                path: ["to"],
                code: z.ZodIssueCode.custom,
                message: `End date must be a valid date in YYYY-MM-DD format`,
            });
        }
        if (fromDate?.isValid() && toDate?.isValid() && fromDate.isAfter(toDate)) {
            ctx.addIssue({
                path: ["from", "to"],
                code: z.ZodIssueCode.custom,
                message: `Start date cannot be after end date`,
            });
        }
    }
});

export const filterTableSchema = z.object({
    page: z.number().gt(0, { message: "Page must be greater than 0" }),
    limit: z.number().gt(0, { message: "Limit must be greater than 0" }),
    type: z.enum(["ADMISSION", "DISCHARGE"]).optional(),
    filterType: z.enum([
        "today",
        "yesterday",
        "lastWeek",
        "thisWeek",
        "month",
        "year",
        "customRange",
    ]),
    filterValue: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
})
.superRefine((data, ctx) => {
    const { filterType, filterValue, from, to } = data;

    // === Validate filterValue for "month"
    if (filterType === "month") {
        if (!filterValue) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Please select month and year for month filter`,
            });
        } else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(filterValue)) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Selected date filter must be in "YYYY-MM" format for month filter`,
            });
        }
    }

    // === Validate filterValue for "year"
    if (filterType === "year") {
        if (!filterValue) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Please select year for year filter`,
            });
        } else if (!/^\d{4}$/.test(filterValue)) {
            ctx.addIssue({
                path: ["filterValue"],
                code: z.ZodIssueCode.custom,
                message: `Selected must be a 4-digit year (e.g., 2025) for year filter`,
            });
        }
    }

    // === Validate customRange: from/to must exist, be valid, and from <= to
    if (filterType === "customRange") {
        if (!from) {
            ctx.addIssue({
                path: ["from"],
                code: z.ZodIssueCode.custom,
                message: `Start date is required for custom range`,
            });
        }
        if (!to) {
            ctx.addIssue({
                path: ["to"],
                code: z.ZodIssueCode.custom,
                message: `End date is required for custom range`,
            });
        }
        const fromDate = from ? dayjs(from, "YYYY-MM-DD", true) : null;
        const toDate = to ? dayjs(to, "YYYY-MM-DD", true) : null;
        if (from && (!fromDate || !fromDate.isValid())) {
            ctx.addIssue({
                path: ["from"],
                code: z.ZodIssueCode.custom,
                message: `Start date must be a valid date in YYYY-MM-DD format`,
            });
        }
        if (to && (!toDate || !toDate.isValid())) {
            ctx.addIssue({
                path: ["to"],
                code: z.ZodIssueCode.custom,
                message: `End date must be a valid date in YYYY-MM-DD format`,
            });
        }
        if (fromDate?.isValid() && toDate?.isValid() && fromDate.isAfter(toDate)) {
            ctx.addIssue({
                path: ["from", "to"],
                code: z.ZodIssueCode.custom,
                message: `Start date cannot be after end date`,
            });
        }
    }
});