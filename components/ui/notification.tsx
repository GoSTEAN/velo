import React from "react";
import { Card } from "./Card";
import { Bell } from "lucide-react";

interface NotificationProps {
  onclick: React.Dispatch<React.SetStateAction<string>>;
  
}
export default function Notification({onclick} : NotificationProps) {

  return (
    <Card className="w-fit p-1.5 relative">
      <button type="button" onClick={() => onclick("Notification")}>

      <Bell size={21}  className="text-foreground"/>

      <span className="absolute top-1 right-1 w-2 h-2  rounded-full bg-blue"></span>
      </button>
    </Card>
  );
}
