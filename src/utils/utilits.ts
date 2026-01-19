export const fromatText = (text: string): string => {
    if (!text) {
        return ""
    }
    return text.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

export const getUrlParams = (param: string): string => {
    if (!param) {
        return ""
    }
    const params = new URLSearchParams(window.location.search)
    return params.get(param) || ""
}

export const getMobileOperatingSystem = (): "Android" | "Windows Phone" | "iOS" | "unknown" => {
    try {
        var userAgent = navigator.userAgent || navigator.vendor

        if(/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if(/android/i.test(userAgent)) {
            return "Android";
        }

        if(/iPad|iPhone|iPod/.test(userAgent)) {
            return "iOS";
        }

        return "unknown";
    } catch (error) {
        console.log(error);
        return "unknown"
    }
}

export function removeNulls<T>(obj: T): T {
    if (Array.isArray(obj)) {
        
        return obj.map(removeNulls).filter(item => {
            return item !== null && item !== undefined && item !== "";
        }) as any;

    } else if (obj !== null && typeof obj === "object") {

        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (value === null || value === undefined || value === "") {
                return acc
            }
            
            const cleanedValue = removeNulls(value);
            
            if (cleanedValue !== null && cleanedValue !== undefined && cleanedValue !== "") {
                acc[key as keyof T] = cleanedValue
            }
            
            return acc
        }, {} as T)
    }
    return obj
}

export function removeEmptyObj<T>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj.map(removeEmptyObj) as any;
    } else if (obj !== null && typeof obj === "object") {
        const cleaned = Object.entries(obj).reduce((acc, [key, value]) => {
            const cleanedValue = removeEmptyObj(value);
            
            // Only add if the cleaned value is not an empty object
            if (!(typeof cleanedValue === "object" && cleanedValue !== null && !Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0)) {
                acc[key as keyof T] = cleanedValue;
            }
            
            return acc;
        }, {} as T);
        
        return cleaned;
    }
    return obj;
}

export function removeEmptyArr<T>(obj: T): T {
    if (Array.isArray(obj)) {
        const cleaned = obj.map(removeEmptyArr).filter(item => {
            // Remove empty arrays
            return !(Array.isArray(item) && item.length === 0);
        });
        
        return cleaned as any;
    } else if (obj !== null && typeof obj === "object") {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const cleanedValue = removeEmptyArr(value);
            
            // Only add if the cleaned value is not an empty array
            if (!(Array.isArray(cleanedValue) && cleanedValue.length === 0)) {
                acc[key as keyof T] = cleanedValue;
            }
            
            return acc;
        }, {} as T);
    }
    return obj;
}

export const deepCompare = (orig: any, upd: any, path: string[] = []) => {
    const changes: Record<string, any> = {};
    for (const key in upd) {
        const origValue = orig[key]
        const updValue = upd[key]

        if (typeof updValue === 'object' && updValue !== null && !Array.isArray(updValue)) {
            // Handle nested objects
            const nestedChanges = deepCompare(origValue || {}, updValue, [...path, key]);
            if (Object.keys(nestedChanges).length > 0) {
                changes[key] = nestedChanges;
            }
        } else if (origValue !== updValue) {
            // Handle primitive fields
            changes[key] = updValue;
        }
    }
    return changes;
};

export const asyncForEach = async <T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<void>): Promise<void> => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export const CalculatePercent = (value: number, total: number): number => {
    if(total == 0) return 0
    const percent = Math.round((value * 100 / total))
    return percent;
}