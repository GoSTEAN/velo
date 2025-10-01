import { ToastNotification } from "./toastNotification";
import { FrontendNotification } from "@/types";

interface ToastContainerProps {
  toasts: FrontendNotification[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={onRemoveToast}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
