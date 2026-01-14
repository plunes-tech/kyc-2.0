export type FilterType = "input" | "select" | "radio" | "checkbox" | "date";

export type OptionProps = {
    label: string;
    value: string;
}

export interface FilterConfig {
    name: string;
    label: string;
    type: FilterType;
    options?: { label: string; value: string }[]; // For select, radio, checkbox
    placeholder?: string;
}