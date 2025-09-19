import React from "react";
import { Card } from "./Card";
import { Bell } from "lucide-react";

interface NotificationProps {
  onclick: React.Dispatch<React.SetStateAction<string>>;
  
}
export default function Notification({onclick} : NotificationProps) {

  return (
    <Card className="w-fit relative">
      <button type="button" onClick={() => onclick("notification")}>

      <Bell size={21}  className="text-foreground"/>

      <span className="absolute top-3 right-4 w-3 h-3  rounded-full bg-blue"></span>
      </button>
    </Card>
  );
}
