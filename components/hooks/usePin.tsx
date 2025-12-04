import { useCallback, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/context/AuthContext';
import { useApiQuery } from './useApiQuery';
import { toast } from 'sonner';

interface PinResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface PinState {
  isSetting: boolean;
  isVerifying: boolean;
  error: string | null;
  isSet: boolean;
}

interface UsePinReturn {
  // State
  pinState: PinState;
  
  // Actions
  setPin: (pin: string) => Promise<PinResponse>;
  verifyPin: (pin: string) => Promise<PinResponse>;
  
  // Utilities
  resetPinState: () => void;
  // checkPinStatus: () => Promise<boolean>;
}

export const usePin = (): UsePinReturn => {
  const { user, updateProfile } = useAuth();
  const [pinState, setPinState] = useState<PinState>({
    isSetting: false,
    isVerifying: false,
    error: null,
    isSet: user?.hasTransactionPin || false
  });

  // Check PIN status from user profile
  const { refetch: refetchProfile } = useApiQuery(
    async (): Promise<{ hasTransactionPin?: boolean; [key: string]: any }> => {
      try {
        const profile = await apiClient.getUserProfile();
        return profile;
      } catch (error) {
        throw error;
      }
    },
    { 
      cacheKey: 'user-profile',
      ttl: 30 * 60 * 1000,
      backgroundRefresh: true 
    }
  );

  // Set transaction PIN - POST /transaction-pin
  const setPin = useCallback(async (pin: string): Promise<PinResponse> => {
    if (!pin || pin.length !== 4) {
      return {
        success: false,
        message: 'PIN must be 4 digits'
      };
    }

    setPinState(prev => ({ ...prev, isSetting: true, error: null }));

    try {
      // Using POST method for /transaction-pin
      const response = await apiClient.SetPin(pin);
      
      // Update local user state
      if (user) {
        await updateProfile({ ...user, hasTransactionPin: true });
      }

      setPinState(prev => ({ 
        ...prev, 
        isSetting: false, 
        isSet: true 
      }));

      toast.success('Transaction PIN set successfully');
      
      return {
        success: true,
        message: 'PIN set successfully',
        data: response
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to set PIN';
      
      setPinState(prev => ({ 
        ...prev, 
        isSetting: false, 
        error: errorMessage 
      }));

      toast.error(`Failed to set PIN: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [user, updateProfile]);

  // Verify transaction PIN - POST /transaction-pin/verify
  const verifyPin = useCallback(async (pin: string): Promise<PinResponse> => {
    if (!pin || pin.length !== 4) {
      return {
        success: false,
        message: 'PIN must be 4 digits'
      };
    }

    setPinState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      // Using POST method for /transaction-pin/verify
      const response = await apiClient.TransactionPin(pin);
      
      setPinState(prev => ({ 
        ...prev, 
        isVerifying: false 
      }));

      return {
        success: true,
        message: 'PIN verified successfully',
        data: response
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid PIN';
      
      setPinState(prev => ({ 
        ...prev, 
        isVerifying: false, 
        error: errorMessage 
      }));

      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  // Check PIN status
  // const checkPinStatus = useCallback(async (): Promise<boolean> => {
  //   try {
  //     const user = await refetchProfile();
  //     const hasPin = user?.hasTransactionPin || false;
  //     setPinState(prev => ({ ...prev, isSet: hasPin }));
  //     return hasPin;
  //   } catch (error) {
  //     console.error('Failed to check PIN status:', error);
  //     return false;
  //   }
  // }, [refetchProfile]);

  // Reset PIN state
  const resetPinState = useCallback(() => {
    setPinState({
      isSetting: false,
      isVerifying: false,
      error: null,
      isSet: user?.hasTransactionPin || false
    });
  }, [user?.hasTransactionPin]);

  return {
    pinState,
    setPin,
    verifyPin,
    resetPinState,
    // checkPinStatus
  };
};

// Enhanced version with transaction signing capability
interface UseTransactionPinReturn extends UsePinReturn {
  // Transaction signing
  signTransaction: (transactionData: any, pin: string) => Promise<{
    success: boolean;
    message: string;
    signedTransaction?: any;
  }>;
  
  // PIN dialog management
  isPinDialogOpen: boolean;
  openPinDialog: () => void;
  closePinDialog: () => void;
  requestTransactionPin: (transactionData: any) => Promise<any>;
  handleTransactionPinSubmit: (pin: string) => Promise<void>;
}

export const useTransactionPin = (): UseTransactionPinReturn => {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [transactionResolver, setTransactionResolver] = useState<((value: any) => void) | null>(null);

  const pinHook = usePin();

  // Sign transaction with PIN verification
  const signTransaction = useCallback(async (transactionData: any, pin: string) => {
    // First verify the PIN using POST /transaction-pin/verify
    const pinVerification = await pinHook.verifyPin(pin);
    
    if (!pinVerification.success) {
      return {
        success: false,
        message: pinVerification.message
      };
    }

    try {
      // If PIN is verified, proceed with the actual transaction
      const transactionResult = await apiClient.sendTransaction(transactionData);
      
      return {
        success: true,
        message: 'Transaction executed successfully',
        signedTransaction: transactionResult
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to execute transaction'
      };
    }
  }, [pinHook]);

  // Open PIN dialog for transaction signing
  const openPinDialog = useCallback(() => {
    setIsPinDialogOpen(true);
  }, []);

  // Close PIN dialog
  const closePinDialog = useCallback(() => {
    setIsPinDialogOpen(false);
    setPendingTransaction(null);
    setTransactionResolver(null);
  }, []);

  // Handle PIN submission for transaction
  const handleTransactionPinSubmit = useCallback(async (pin: string) => {
    if (!pendingTransaction) return;

    try {
      const result = await signTransaction(pendingTransaction, pin);
      
      if (transactionResolver) {
        transactionResolver(result);
      }

      if (result.success) {
        toast.success('Transaction authorized successfully');
      } else {
        toast.error(`Authorization failed: ${result.message}`);
      }

      closePinDialog();
    } catch (error) {
      if (transactionResolver) {
        transactionResolver({ 
          success: false, 
          message: 'Transaction authorization failed' 
        });
      }
      closePinDialog();
    }
  }, [pendingTransaction, transactionResolver, signTransaction, closePinDialog]);

  // Request PIN for transaction (returns a promise)
  const requestTransactionPin = useCallback((transactionData: any): Promise<any> => {
    return new Promise((resolve) => {
      setPendingTransaction(transactionData);
      setTransactionResolver(() => resolve);
      setIsPinDialogOpen(true);
    });
  }, []);

  return {
    ...pinHook,
    signTransaction,
    requestTransactionPin,
    isPinDialogOpen,
    openPinDialog,
    closePinDialog,
    handleTransactionPinSubmit
  };
};

// Hook for using PIN with specific transaction types
export const usePinWithTransaction = (transactionType: 'send' | 'withdraw' | 'swap' | 'merchant') => {
  const transactionPin = useTransactionPin();
  
  const executeWithPin = useCallback(async (transactionData: any) => {
    // Add transaction type to data
    const enhancedData = {
      ...transactionData,
      type: transactionType,
      timestamp: new Date().toISOString()
    };

    return await transactionPin.requestTransactionPin(enhancedData);
  }, [transactionType, transactionPin]);

  return {
    ...transactionPin,
    executeWithPin
  };
};