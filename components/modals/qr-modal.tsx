import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";

export default function QRModal({
  qrData,
  setShow,
}: {
  qrData: string;
  setShow: Dispatch<SetStateAction<string | null>>;
}) {
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => setShow(null)}
      className="w-full h-screen z-50 fixed p-4 top-0 left-0 flex items-center justify-center bg-black/50"
    >
      <div className="w-full h-full absolute top-0 left-0 backdrop-blur-lg z-10" />
      <div 
        onClick={handleModalClick}
        className="relative z-20 w-full max-w-sm h-auto rounded-2xl bg-white p-4"
      >
        {qrData ? (
          <Image 
            src={qrData} 
            alt="QR Code" 
            width={200}
            height={200}
            className="rounded-lg w-full h-full object-contain"
            priority 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Generating QR...
          </div>
        )}
        <div className="w-full text-center text-black text-lg mt-3 font-black">
          Scan Me!       </div>
      </div>
    </div>
  );
}