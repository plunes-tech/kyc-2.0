import { Loader } from "@mantine/core";
import React from "react";

const GlobalLoader: React.FC<{ message?: string }> = ({ message }) => {
    
    return (
        <div className="grid place-content-center fixed inset-0 z-[10000] bg-[#00000033]">
            <div className="flex items-center flex-col gap-2">
                <Loader size="md" color="#0F3D46" />
                {message && (
                    <p className="text-white text-[0.7rem] sm:text-[0.8rem] font-semibold">
                        {message}
                    </p>
                )}
            </div>
        </div>
    )
};

export default GlobalLoader