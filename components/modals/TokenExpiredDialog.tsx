import React from "react";

interface TokenExpiredDialogProps {
  isOpen: boolean;
  onRelogin: () => void;
}

export const TokenExpiredDialog: React.FC<TokenExpiredDialogProps> = ({
  isOpen,
  onRelogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-99">
      <div className="bg-card rounded-lg p-6 max-w-sm mx-4">
        <h2 className="text-xl font-semibold mb-4">Session Expired</h2>
        <p className="text-gray-300 mb-6">
          Your access token has expired. Please log in again to continue.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onRelogin}
            className="bg-red-300 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Re-login
          </button>
        </div>
      </div>
    </div>
  );
};
