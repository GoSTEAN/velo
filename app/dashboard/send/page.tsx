"use client"

import { useAuth } from "@/components/context/AuthContext";
import { useTokenBalance } from "@/components/hooks";
import {
  normalizeStarknetAddress,
  shortenAddress,
} from "@/components/lib/utils";
import { AddressDropdown } from "@/components/modals/addressDropDown";
import {
  StatusBadge,
  TransactionStatus,
} from "@/components/modals/TransactionStatus";
import { AddressCopyButton } from "@/components/ui/AddressCopyButton";
import { AmountInput } from "@/components/ui/AmountInput";
import { CardContainer, InstructionCard } from "@/components/ui/CardContainer";
import { TransactionPinDialog } from "@/components/ui/transaction-pin-dialog";
import { formatNGN } from "@/lib/utils/token-utils";
import { AlertCircle, Loader2, ArrowUpRight } from "lucide-react";
import { useState, useMemo, useCallback } from "react";

export default function SendFunds() {
  const [selectedToken, setSelectedToken] = useState("ethereum");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    txHash?: string;
  }>({ type: null, message: "" });

  const { sendTransaction } = useAuth();

  // Single hook for all token data
  const {
    walletTokens,
    getTokenInfo,
    getWalletBalance,
    getWalletAddress,
    getWalletNetwork,
    hasWalletForToken,
    getTokenSymbol,
    getTokenName,
    getTokenRate,
    isLoading,
    error,
    formatBalance,
    formatValue,
  } = useTokenBalance();

  const selectedTokenData = getTokenInfo(selectedToken);
  
  // Simplified derived values
  const currentWalletBalance = getWalletBalance(selectedToken);
  console.log("balance" , currentWalletBalance)
  const currentWalletAddress = getWalletAddress(selectedToken);
  const currentNetwork = getWalletNetwork(selectedToken);
  const hasWalletForSelectedToken = hasWalletForToken(selectedToken);

  // Simplified NGN calculation
  const ngnEquivalent = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      return 0;

    const tokenSymbol = getTokenSymbol(selectedToken);
    const tokenRate = getTokenRate(tokenSymbol);
    return parseFloat(amount) * tokenRate;
  }, [amount, selectedToken, getTokenRate, getTokenSymbol]);

  // Simplified validation
  const validationError = useMemo(() => {
    if (!hasWalletForSelectedToken) {
      return "No wallet found for this currency";
    }
    if (!toAddress.trim()) {
      return "Recipient address is required";
    }
    if (!amount || parseFloat(amount) <= 0) {
      return "Amount must be greater than 0";
    }
    if (parseFloat(amount) > currentWalletBalance) {
      return "Insufficient balance";
    }
    return null;
  }, [hasWalletForSelectedToken, toAddress, amount, currentWalletBalance]);

  // Reset form
  const resetForm = useCallback(() => {
    setToAddress("");
    setAmount("");
    setTxStatus({ type: null, message: "" });
  }, []);

  // Handle token selection
  const handleTokenSelect = useCallback(
    (chain: string) => {
      setSelectedToken(chain);
      resetForm();
    },
    [resetForm]
  );

  // Handle send transaction with PIN
  const handleSendWithPin = async (pin: string) => {
    if (validationError) {
      setTxStatus({
        type: "error",
        message: validationError,
      });
      setShowPinDialog(false);
      return;
    }

    setIsSending(true);
    setTxStatus({ type: null, message: "" });

    try {
      let normalizedToAddress = toAddress.trim();
      let normalizedFromAddress = currentWalletAddress.trim();

      // Special handling for Starknet addresses
      if (selectedToken === "starknet") {
        try {
          normalizedToAddress = normalizeStarknetAddress(
            normalizedToAddress,
            selectedToken
          );
          normalizedFromAddress = normalizeStarknetAddress(
            normalizedFromAddress,
            selectedToken
          );
          console.log("Normalized Starknet address:", normalizedToAddress);
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? `Invalid Starknet address: ${error.message}`
              : "Invalid Starknet address format"
          );
        }
      }

      // Send transaction
      const response = await sendTransaction({
        chain: selectedToken,
        network: currentNetwork,
        toAddress: normalizedToAddress,
        amount: amount,
        fromAddress: normalizedFromAddress,
        transactionPin: pin,
      });

      setTxStatus({
        type: "success",
        message: "Transaction sent successfully!",
        txHash: response.txHash,
      });

      // Close PIN dialog
      setShowPinDialog(false);

      // Reset form after 10 seconds
      setTimeout(() => {
        resetForm();
      }, 10000);
    } catch (error: any) {
      console.error("Transaction error:", error);

      let errorMessage = "Failed to send transaction. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setTxStatus({
        type: "error",
        message: errorMessage,
      });

      // Close PIN dialog on error
      setShowPinDialog(false);
    } finally {
      setIsSending(false);
    }
  };

  // Handle send transaction (show PIN dialog)
  const handleSendTransaction = () => {
    if (validationError) {
      setTxStatus({
        type: "error",
        message: validationError,
      });
      return;
    }

    // Show PIN dialog instead of immediately sending
    setShowPinDialog(true);
  };

  // Handle PIN dialog close
  const handlePinDialogClose = () => {
    setShowPinDialog(false);
  };

  // Loading state

  // Instructions for important notes
  const importantNotes = [
    "Recipient does NOT need to be a Velo user",
    "Only send to valid addresses for the selected currency",
    "Transactions are irreversible once confirmed",
    "Double-check addresses before sending",
  ];

  // Add Starknet-specific notes if needed
  if (selectedToken === "starknet") {
    importantNotes.push(
      "Starknet wallets may need deployment (auto-handled)",
      "Addresses will be auto-formatted with 0x prefix and padding"
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6 mt-12 md:mt-16">
      <div className="space-y-6">
        {/* Main Card */}
        <CardContainer>
          {/* Header */}
          <div className="w-full flex flex-col gap-3 text-center mb-8">
            <h1 className="text-foreground text-xl font-bold">Send Payment</h1>
            <p className="text-muted-foreground text-sm">
              Transfer funds from your Velo wallet to any valid address
            </p>
          </div>

          <div className="space-y-6">
            {/* Transaction Status */}
            {txStatus.type && (
              <TransactionStatus
                type={txStatus.type}
                message={txStatus.message}
                txHash={txStatus.txHash}
                network={currentNetwork}
                chain={selectedToken}
                onDismiss={() => setTxStatus({ type: null, message: "" })}
                showExplorerLink={!!txStatus.txHash}
                autoDismiss={txStatus.type === "success"}
              />
            )}

            {/* Wallet Status Warning */}
            {!hasWalletForSelectedToken && (
              <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">No Wallet Found</span>
                </div>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                  No Velo wallet found for {getTokenName(selectedToken)}. You
                  can only send from wallets created in Velo.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <AddressDropdown
                  selectedToken={selectedToken}
                  onTokenSelect={handleTokenSelect}
                  showBalance={true}
                  showNetwork={false}
                  showAddress={true}
                  disabled={isSending}
                />

                {currentWalletAddress && (
                  <div className="w-full flex flex-col gap-2 p-3 bg-accent/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        From Address:
                      </span>
                      <AddressCopyButton
                        address={currentWalletAddress}
                        chain={selectedToken}
                        size="sm"
                        showIcon={true}
                        showText={false}
                      />
                    </div>
                    <p className="text-xs font-mono text-foreground break-all">
                      {shortenAddress(currentWalletAddress, 8)}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground capitalize">
                        Network: {currentNetwork}
                      </p>
                      <StatusBadge
                        status={
                          currentNetwork === "testnet" ? "success" : "warning"
                        }
                        label={currentNetwork}
                        size="sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Recipient Info */}
              <div className="space-y-4">
                <div className="w-full flex flex-col gap-3">
                  <label
                    htmlFor="toAddress"
                    className="text-foreground text-sm font-medium"
                  >
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    id="toAddress"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder={`Enter ${
                      selectedTokenData?.name || selectedToken
                    } address`}
                    className="w-full p-3 rounded-lg bg-muted placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                    disabled={!hasWalletForSelectedToken || isSending}
                  />
                  {selectedToken === "starknet" && toAddress && (
                    <p className="text-xs text-muted-foreground">
                      Tip: Address will be automatically formatted with 0x
                      prefix and proper padding
                    </p>
                  )}
                </div>

                {/* Amount Input */}
                <div className="w-full flex flex-col gap-3">
                  <label
                    htmlFor="amount"
                    className="text-foreground text-sm font-medium"
                  >
                    Amount
                  </label>
                  <AmountInput
                    value={amount}
                    onChange={setAmount}
                    currency={selectedTokenData?.symbol || selectedToken}
                    disabled={!hasWalletForSelectedToken || isSending}
                    placeholder="0.00"
                  />
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>
                      Available:{" "}
                      {currentWalletBalance}{" "}
                      {selectedTokenData?.symbol}
                    </span>
                    {ngnEquivalent > 0 && (
                      <span>≈ {formatNGN(ngnEquivalent)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div>
              <button
                onClick={handleSendTransaction}
                disabled={
                  !!validationError || isSending || !hasWalletForSelectedToken
                }
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={16} />
                    {validationError || "Send Payment"}
                  </>
                )}
              </button>
            </div>

            {/* Network Info */}
            <div className="w-full p-3 bg-accent/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">
                Sending on{" "}
                <span className="font-medium capitalize">{currentNetwork}</span>{" "}
                network
              </p>
            </div>
          </div>
        </CardContainer>

        {/* Instructions Card */}
        <InstructionCard title="Important Notes" items={importantNotes} />
      </div>

      {/* PIN Dialog */}
      <TransactionPinDialog
        isOpen={showPinDialog}
        onClose={handlePinDialogClose}
        onPinComplete={handleSendWithPin}
        isLoading={isSending}
        title="Authorize Transaction"
        description="Enter your transaction PIN to confirm this transfer"
      />
    </div>
  );
}
