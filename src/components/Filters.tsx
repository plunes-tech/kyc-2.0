import { TextInput, Select, Checkbox, Radio, Button, Stack, ScrollArea } from "@mantine/core";
import { useState } from "react";
import { FilterConfig } from "../utils/types";
import { CloseIcon } from "../assets/icons";
import { DatePicker } from "@mantine/dates";

interface FilterProps {
    config: FilterConfig[];
    onApply: (filters: Record<string, any>) => void;
    setOpenFilter: React.Dispatch<React.SetStateAction<boolean>>,
    initialFilters: Record<string, any>;
}

const Filter: React.FC<FilterProps> = ({ config, onApply, setOpenFilter, initialFilters }) => {

    const [filters, setFilters] = useState<Record<string, any>>(initialFilters)
    const [selectedFilter, setSelectedFilter] = useState<string>(config[0]?.name || "")
    const selected = config.find((item) => item.name === selectedFilter)

    // TODO: Check why it is not working (filter not getting applied)
    // useEffect(() => {
    //     const handleKeyPress = (event: KeyboardEvent) => {
    //         if (event.key === 'Enter') {
    //             onApply(filters)
    //         }
    //     };

    //     // Add event listener
    //     window.addEventListener('keydown', handleKeyPress);

    //     // Cleanup function to remove event listener
    //     return () => {
    //         window.removeEventListener('keydown', handleKeyPress);
    //     };
    // }, []);

    const handleChange = (name: string, value: any) => {
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    return (
        // background of the filter
        <>
        <div className="fixed top-0 left-0 z-100 w-[100vw] h-[100vh] rounded-none bg-[#00000040]" onClick={()=>setOpenFilter(false)}/>
        <Stack className="fixed top-0.5 right-0.5 z-101">
            {/* main filter component */}
            <div className="w-[100vw] sm:w-[25rem] bg-[#FFFFFF] border border-[#39B54A] ml-auto sm:mr-2 sm:mt-2">
                {/* header */}
                <div className="bg-[#39B54A] py-1 px-2 sm:py-2 sm:px-4 flex items-center justify-between">
                    <h2 className="text-[#FFFFFF] text-[0.8rem] sm:text-[0.9rem] font-semibold">Filter</h2>
                    <CloseIcon onClick={() => setOpenFilter(false)} className="cursor-pointer text-[#FFFFFF]" width={10} height={10} />
                </div>
                <div className="px-1 py-2 sm:py-2 sm:px-4 border-b-1 border-b-[#C1C1C1]">
                    <h3 className="text-[#E50E0E] text-[0.7rem] sm:text-[0.8rem] font-medium">Search by the following filters.</h3>
                </div>
                {/* body */}
                <div className="flex items-start gap-0">
                    {/* left side where all filter name comes */}
                    <div className="w-1/3">
                        <ScrollArea h={300} scrollbarSize={4} type="hover" className="border-r-1 border-r-[#C1C1C1]">
                            {/* write code here */}
                            {config.map((item) => (
                                <Button size="compoact-xs" key={item.name} radius={0} classNames={{
                                    root: `${selectedFilter===item.name ? "!bg-[#39B54A]" : "!border-b-1 !border-b-[#C1C1C1] !bg-transparent"} !block !w-full !break-words !px-0`,
                                    label: `!text-[0.6rem] sm:!text-[0.7rem] !font-medium ${selectedFilter===item.name ? "!text-[#FFFFFF]" : "!text-[#0B0B0B]"}`,
                                }} onClick={() => setSelectedFilter(item.name)}>
                                    {item.label}
                                </Button>
                            ))}
                        </ScrollArea>
                    </div>
                    {/* right side where all filter type comes */}
                    <div className="w-2/3">
                        <ScrollArea h={300} scrollbarSize={4} type="hover">
                            {/* write code here */}
                            {selected && (
                                <div className="px-1 py-2 sm:py-2 sm:px-4">
                                    <h3 className="text-[#0B0B0B] text-[0.7rem] sm:text-[0.8rem] font-medium border-b-1 border-b-[#D1D1D1] pb-2 mb-2">Search By {selected.label}</h3>
                                    {selected.type === "input" && (
                                        <TextInput size="xs"
                                            label={selected.label} placeholder={`Enter ${selected.label}`}
                                            value={filters[selected.name] || ""}
                                            classNames={{
                                                label: "!text-[#0B0B0B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium"
                                            }}
                                            onChange={(e) =>
                                                handleChange(selected.name, e.currentTarget.value)
                                            }
                                        />
                                    )}
                                    {selected.type === "select" && (
                                        <Select size="xs"
                                            classNames={{
                                                label: "!text-[#0B0B0B] !text-[0.7rem] sm:!text-[0.8rem] !font-medium"
                                            }}
                                            label={selected.label} placeholder={`Select ${selected.label}`}
                                            data={selected.options || []}
                                            value={filters[selected.name] || ""}
                                            onChange={(value) => handleChange(selected.name, value)}
                                        />
                                    )}
                                    {selected.type === "radio" && (
                                        <Radio.Group
                                            label={selected.label}
                                            value={filters[selected.name] || ""}
                                            onChange={(value) => handleChange(selected.name, value)}
                                        >
                                            <div className="flex items-start flex-col gap-2">
                                                {selected.options?.map((opt) => (
                                                    <Radio size="xs" color="#39B54A"
                                                        key={opt.value}
                                                        value={opt.value}
                                                        label={opt.label}
                                                    />
                                                ))}
                                            </div>
                                        </Radio.Group>
                                    )}
                                    {selected.type === "checkbox" && (
                                        <Checkbox.Group>
                                            {selected.options?.map((opt) => (
                                                <Checkbox size="xs" key={opt.value} label={opt.label} value={opt.value}
                                                    checked={filters[selected.name]?.split(',').includes(opt.value) || false}
                                                    onChange={(e) => {
                                                        const checked = e.currentTarget.checked
                                                        setFilters((prev) => {
                                                            const currentString = prev[selected.name] || ""
                                                            const currentArray = currentString ? currentString.split(',') : []
                                                            
                                                            let newArray
                                                            if (checked) {
                                                                // Add the value if it's not already present
                                                                newArray = currentArray.includes(opt.value) ? currentArray : [...currentArray, opt.value]
                                                            } else {
                                                                // Remove the value
                                                                newArray = currentArray.filter((v:any) => v !== opt.value)
                                                            }
                                                            
                                                            return {
                                                                ...prev,
                                                                [selected.name]: newArray.join(','),
                                                            }
                                                        })
                                                    }}
                                                    classNames={{
                                                        root: "mb-2 ",
                                                        input: "!cursor-pointer"
                                                    }}
                                                />
                                            ))}
                                        </Checkbox.Group>
                                    )}
                                    {selected.type === "date" && (
                                        <DatePicker size="xs" type="range" allowSingleDateInRange
                                            value={filters[selected.name] || [null, null]}
                                            onChange={e => handleChange(selected.name, e)}
                                        />
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
                {/* bottom buttons */}
                <div className="p-2 sm:p-4 flex items-center justify-between border-t-1 border-t-[#C1C1C1]">
                    <Button size="compact-xs" radius={5} w={80} h={25} classNames={{
                        root: "!border-1 !border-[#39B54A] !bg-transparent",
                        label: "!text-[#39B54A] !text-[0.7rem] !font-medium",
                    }} onClick={() => window.location.reload()}>
                        Reset
                    </Button>
                    <Button size="compact-xs" radius={5} w={80} h={25} classNames={{
                        root: "!bg-[#39B54A]",
                        label: "!text-[0.7rem] !font-medium",
                    }} onClick={() => onApply(filters)}>
                        Apply
                    </Button>
                </div>
            </div>
        </Stack>
        </>
    );
};

export default Filter