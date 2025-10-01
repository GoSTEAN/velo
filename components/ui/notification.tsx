import React, { useEffect, useState } from "react";
import { Card } from "./Card";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NotificationProps {
  onclick: React.Dispatch<React.SetStateAction<string>>;
}
export default function Notification({ onclick }: NotificationProps) {
  const [count, setCount] = useState(0);
  const { getUnreadCount } = useAuth();

  const handleFetchNotification = async () => {
    try {
      const notification = await getUnreadCount();
      console.log(notification);
      setCount(notification);
    } catch (err) {
      console.log("failed to fetch notification", err);
    }
  };

  useEffect(() => {
    handleFetchNotification();
  }, [handleFetchNotification]);
  return (
    <Card className="w-fit p-1.5 relative border-0">
      <button type="button" onClick={() => onclick("Notification")}>
        <Bell size={21} className="text-foreground" />

        <div className="absolute -top-1 -right-1 h-5 w-auto px-1 text-white bg-red-400 flex items-center justify-center text-sm rounded-full ">
          {count}
        </div>
      </button>
    </Card>
  );
}
