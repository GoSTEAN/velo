// import { useCallback, useState } from 'react';
// import { apiClient } from '@/lib/api-client';
// import { toast } from 'sonner';

// interface TransactionPinHook {
//   // State
//   isPinDialogOpen: boolean;
//   isProcessing: boolean;
  
//   // Methods
//   requestTransactionPin: (transactionData: any) => Promise<{
//     success: boolean;
//     message: string;
//     data?: any;
//   }>;
//   openPinDialog: () => void;
//   closePinDialog: () => void;
//   handlePinSubmit: (pin: string) => Promise<void>;
// }

// export const useTransactionPin = (): TransactionPinHook => {
//   const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [pendingTransaction, setPendingTransaction] = useState<any>(null);
//   const [transactionResolver, setTransactionResolver] = useState<((value: any) => void) | null>(null);

//   // Request PIN for transaction (returns a promise)
//   const requestTransactionPin = useCallback((transactionData: any): Promise<any> => {
//     return new Promise((resolve) => {
//       setPendingTransaction(transactionData);
//       setTransactionResolver(() => resolve);
//       setIsPinDialogOpen(true);
//     });
//   }, []);

//   // Handle PIN submission and transaction execution
//   const handlePinSubmit = useCallback(async (pin: string) => {
//     if (!pendingTransaction) return;
    
//     setIsProcessing(true);

//     try {
//       // Step 1: Verify the PIN first
//       const pinVerification = await apiClient.TransactionPin(pin);
      
//       if (!pinVerification.success) {
//         throw new Error(pinVerification.message || 'Invalid PIN');
//       }

//       // Step 2: If PIN is valid, execute the transaction with PIN included
//       let transactionResult;
      
//       switch (pendingTransaction.type) {
//         case 'send':
//           // Include PIN in the transaction data for backend signing
//           const transactionWithPin = {
//             ...pendingTransaction,
//             transactionPin: pin // ADD PIN to transaction data
//           };
//           transactionResult = await apiClient.sendTransaction(transactionWithPin);
//           break;
//         case 'split-payment':
//           transactionResult = await apiClient.executeSplitPayment(pin);
//           break;
//         default:
//           throw new Error('Unknown transaction type');
//       }

//       // Step 3: Return success result
//       if (transactionResolver) {
//         transactionResolver({
//           success: true,
//           message: 'Transaction completed successfully',
//           data: transactionResult
//         });
//       }

//       toast.success('Transaction completed successfully');
//       closePinDialog();

//     } catch (error: any) {
//       const errorMessage = error.message || 'Transaction failed';
      
//       if (transactionResolver) {
//         transactionResolver({
//           success: false,
//           message: errorMessage
//         });
//       }

//       toast.error(errorMessage);
//       closePinDialog();
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [pendingTransaction, transactionResolver]);

//   const openPinDialog = useCallback(() => {
//     setIsPinDialogOpen(true);
//   }, []);

//   const closePinDialog = useCallback(() => {
//     setIsPinDialogOpen(false);
//     setPendingTransaction(null);
//     setTransactionResolver(null);
//     setIsProcessing(false);
//   }, []);

//   return {
//     isPinDialogOpen,
//     isProcessing,
//     requestTransactionPin,
//     openPinDialog,
//     closePinDialog,
//     handlePinSubmit
//   };
// };