import { Loader } from "@mantine/core";
import React from "react";

const GlobalLoader:React.FC = () => {
    return (
        <div className="grid place-content-center fixed top-0 left-0 h-[100vh] w-[100vw] z-[10000] bg-[#00000033]">
            <Loader size={"md"} color="#39B54A" />
        </div>
    )
}

export default GlobalLoader