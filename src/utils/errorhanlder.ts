type ZodFieldError = {
    path: string[];
    message: string;
};

export const getFieldError = (errors: ZodFieldError[] | null, fieldName: string): string | undefined => {
    if (!errors) return undefined;
    const match = errors.find((err) => err.path[0] === fieldName);
    return match?.message;
};