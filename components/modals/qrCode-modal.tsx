"use server"

import { Card } from "../ui/Card";
import Image  from "next/image";

interface QrCodeProps {
  adrs: string;
//   onClose: () => void;
}

export default async function QrCode({adrs} : QrCodeProps) {

  
    return(
        <Card className="w-full h-full border-none absolute top-0 left-0 bg-background">
                <div className="w-full max-w-[320px] relative p-2 h-[320px]">
                    {/* <Image src={adrs} alt="qrcode" fill/> */}
                </div>
        </Card>
    )
}   