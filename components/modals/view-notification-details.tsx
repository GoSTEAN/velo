import { FrontendNotification } from "@/types";
import React from "react";

interface ViewNotificationDetailsProps extends FrontendNotification {
    show: (value: boolean) => void; // Add the show prop separately
    toggle : boolean
}

export default function ViewNotificationDetails({
  category,
  description,
  title,
  time,
  ip,
  loginTime,
  userAgent,
  show ,
  toggle
}: ViewNotificationDetailsProps) {
  return (
    <div  className={` w-full h-full absolute top-0 left-0 ${toggle? "flex": "hidden"} items-center justify-center bg-black/40 `}>
      <div onClick={() => show(false)} className="w-full z-10 h-full absolute top-0 left-0 backdrop-blur-md" />
      <div className="w-full max-h-100 h-auto max-w-120 border rounded-lg p-3 bg-background relative z-20">
        <h1 className="text-lg font-bold text-foreground text-center">
          {title}
        </h1>
        <div className=" space-y-2">
          <h3>{description}</h3>
          <div className="w-full flex justify-between items-center px-2">
            <p>Ip:: {ip}</p>
            <p> Time:: {loginTime}</p>
          </div>
          <p className="w-full text-sm ">Browser:: {userAgent}</p>
          <div className="w-full flex justify-between items-center px-2">
            <p>Time:: {time}</p>
            <p>{category}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
