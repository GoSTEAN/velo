import React from "react";
import { Card } from "./Card";
import { Bell } from "lucide-react";

export default function Notification() {
  return (
    <Card className="w-fit relative">
      <Bell size={21}  className="text-foreground"/>
      <span className="absolute top-3 right-4 w-3 h-3  rounded-full bg-blue"></span>
    </Card>
  );
}
