import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { FrontendNotification } from '@/types';

interface ToastNotificationProps {
  notification: FrontendNotification;
  onClose: (id: string) => void;
}

export const ToastNotification = ({ notification, onClose }: ToastNotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); 
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (notification.title) {
      case 'Login Successful':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'Deposit Received':
      case 'Send':
        return <Info className={`${iconClass} text-blue-500`} />;
      case 'alert':
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-3 
        min-w-[320px] max-w-[400px] flex items-start gap-3
        transition-all duration-300 ease-in-out
        ${isExiting 
          ? 'opacity-0 translate-x-full' 
          : 'opacity-100 translate-x-0 animate-slideIn'
        }
      `}
    >
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">
          {notification.title}
        </h4>
        <p className="text-gray-600 text-xs line-clamp-2">
          {notification.description || notification.message}
        </p>
        {notification.details?.loginTime && (
          <p className="text-gray-400 text-xs mt-1">
            {new Date(notification.details.loginTime).toLocaleTimeString()}
          </p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
