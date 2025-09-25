import React from "react";
import { Card } from "./Card";
import { Bell } from "lucide-react";

interface NotificationProps {
  onclick: React.Dispatch<React.SetStateAction<string>>;
  
}
export default function Notification({onclick} : NotificationProps) {

  return (
    <Card className="w-fit p-1.5 relative border-0">
      <button type="button" onClick={() => onclick("Notification")}>

      <Bell size={21}  className="text-foreground"/>

      <div className="absolute -top-1 -right-1 h-4 w-4 text-white bg-red-400 flex items-center justify-center text-sm rounded-full ">0</div>
      </button>
    </Card>
  );
}
