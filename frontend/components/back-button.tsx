"use client"

import {  ChevronLeft } from "lucide-react";

const BackButton = () => {
    const handleBack = () => {
        window.history.back();
    };
    return ( 
        <>
        <div className="flex items-center cursor-pointer" onClick={handleBack}>
                <ChevronLeft className="text-black w-6 h-6" />
                <span className="ml-2 text-black">Back</span>
            </div>
        </>
     );
}
 
export default BackButton;