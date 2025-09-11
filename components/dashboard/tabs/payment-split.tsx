"use client";

import { shortenAddress } from "@/components/lib/utils";
import AddSplit from "@/components/modals/add-split";
import { Card } from "@/components/ui/Card";
import { Check, Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import { SplitData, } from "@/splits";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { CallData, uint256 } from "starknet";
import { TOKEN_ADDRESSES as tokenAddress } from "autoswap-sdk";

// Token contract addresses
const TOKEN_ADDRESSES: { [key: string]: string } = {
  USDT: tokenAddress.USDT ,
  USDC: tokenAddress.USDC|| "",
  STRK: tokenAddress.STRK || "",
  ETH: tokenAddress.ETH || "",
};

// Token decimals for u256 conversion
const TOKEN_DECIMALS: { [key: string]: number } = {
  USDT: 6,
  USDC: 6,
  STRK: 18,
  ETH: 18,
};

export default function PaymentSplit() {
  const [addSplitModal, setAddSplitModal] = useState(false);
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [toggle, setToggle] = useState(false);
  const [token, setToken] = useState("STRK");
  const [isCreating, setIsCreating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [error, setError] = useState("");
  const [smeId, setSmeId] = useState<string | null>(null);
  const { address: connectedAddress, account } = useAccount();

  console.log('USDT ADDRESS', tokenAddress.USDT)
  // Get contract address from environment variables
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not defined");
  }

  // Hooks for sending transactions
  const { sendAsync: sendCreateSme } = useSendTransaction({ calls: undefined });
  const { sendAsync: sendDistributePayment } = useSendTransaction({ calls: undefined });

  const handleShowSplitModal = () => {
    setAddSplitModal(!addSplitModal);
  };

  const totalPercentage =
    splitData?.recipients?.reduce((total, recipient) => {
      return total + (recipient.percentage || 0);
    }, 0) || 0;

  // Calculate total amount
  const totalAmount =
    splitData?.recipients?.reduce((total, recipient) => {
      return total + parseFloat(recipient.amount || "0");
    }, 0) || 0;

  const tokens = ["USDT", "USDC", "STRK", "ETH"];
  
  const handleTokenToggle = useCallback(() => {
    setToggle((prev) => !prev);
  }, []);

  const handleTokenChange = useCallback((tkn: string) => {
    setToken(tkn);
    setToggle(false);
  }, []);

  // Create split on the smart contract
  const handleCreateSplit = async () => {
    if (!connectedAddress || !account || !splitData) {
      setError("Please connect your Starknet wallet");
      return;
    }

    if (totalPercentage !== 100) {
      setError("Total percentage must equal 100%");
      return;
    }

    const recipientCount = splitData.recipients.length;
    if (recipientCount < 3 || recipientCount > 5) {
      setError("Split must have between 3-5 recipients");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Determine which function to call based on recipient count
      const functionName = `create_sme${recipientCount}`;
      
      // Build parameters dynamically
      const params: any[] = [];
      for (let i = 0; i < recipientCount; i++) {
        const recipient = splitData.recipients[i];
        params.push(recipient.walletAddress);
        params.push(recipient.percentage); // Already a number (0-100)
      }

      // Create the contract call
      const call = {
        contractAddress,
        entrypoint: functionName,
        calldata: CallData.compile(params),
      };

      // Execute the transaction
      const result = await sendCreateSme([call]);
      setSmeId(result.transaction_hash);
      
      alert(`Split created successfully! Transaction Hash: ${result.transaction_hash}`);
      
    } catch (err) {
      console.error("Failed to create split:", err);
      setError("Failed to create split: " + (err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  // Distribute payment to recipients
  const handleDistributeSplit = async () => {
    if (!connectedAddress || !account || !splitData || !smeId) {
      setError("Please create the split first and connect your wallet");
      return;
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      setError("Please enter a valid amount to distribute");
      return;
    }

    const tokenAddress = TOKEN_ADDRESSES[token];
    if (!tokenAddress) {
      setError("Invalid token selected");
      return;
    }

    setIsDistributing(true);
    setError("");

    try {
      // Convert totalAmount to u256 with decimals
      const decimals = TOKEN_DECIMALS[token] || 18;
      const amountBN = BigInt(Math.floor(totalAmount * 10 ** decimals));
      const amountU256 = uint256.bnToUint256(amountBN);

      const recipientCount = splitData.recipients.length;
      const functionName = `distribute_sme${recipientCount}_payment`;

      // Approve call (set allowance)
      const approveCall = {
        contractAddress: tokenAddress,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: contractAddress,
          amount: amountU256,
        }),
      };

      // Distribute call
      const distributeCall = {
        contractAddress,
        entrypoint: functionName,
        calldata: CallData.compile({
          total_amount: amountU256,
          token: tokenAddress,
        }),
      };

      // Execute both transactions
      await sendDistributePayment([approveCall, distributeCall]);
      
      alert("Payment distributed successfully!");
      
      // Reset after successful distribution
      setSplitData(null);
      setSmeId(null);
      
    } catch (err) {
      console.error("Failed to distribute payment:", err);
      setError("Failed to distribute payment: " + (err as Error).message);
    } finally {
      setIsDistributing(false);
    }
  };

  // Clear error after some time
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5 relative">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-foreground text-custom-lg">Create Split</h1>
        <button
          onClick={handleShowSplitModal}
          className="bg-Card p-2 text-foreground rounded-[7px]"
        >
          <Plus className="" />
        </button>
      </div>

      {error && (
        <div className="w-full mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {smeId && (
        <div className="w-full mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Split created successfully! Transaction Hash: {smeId.slice(0, 10)}...
        </div>
      )}

      {splitData ? (
        <Card className="w-full bg-Card mt-10 p-[32px_22px] flex flex-col gap-[24px] rounded-[12px] items-start">
          <div className="flex flex-col gap-[8px] w-full">
            <h1 className="text-foreground text-custom-xl font-bold">
              {splitData.title}
            </h1>
            <p className="text-custom-md text-muted-foreground">
              {splitData.description}
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] xl:gap-[90px]">
            <div className="p-[20px_22px] rounded-[12px] flex flex-col">
              <Card className="bg-Card flex-col text-muted-foreground">
                <Card className="w-fit p-2">
                  <Check />
                </Card>
                <h3 className="text-custom-md flex flex-none">
                  Total Percentage
                </h3>
                <h1 className="text-foreground text-custom-md font-[600]">
                  {totalPercentage}%
                </h1>
              </Card>
            </div>
            <div className="p-[20px_22px] rounded-[12px] flex flex-col">
              <Card className="bg-Card flex-col text-muted-foreground">
                <Card className="w-fit p-2">
                  <Check />
                </Card>
                <h3 className="text-custom-md flex flex-none">Recipients</h3>
                <h1 className="text-foreground text-custom-md font-[600]">
                  {splitData.recipients.length}
                </h1>
              </Card>
            </div>
            <div className="p-[20px_22px] rounded-[12px] flex flex-col">
              <Card className="bg-Card flex-col text-muted-foreground">
                <Card className="w-fit p-2">
                  <Check />
                </Card>
                <h3 className="text-custom-md flex flex-none">Total Amount</h3>
                <h1 className="text-foreground text-custom-md font-[600] truncate">
                  {token} {totalAmount.toLocaleString()}
                </h1>
              </Card>
            </div>
          </div>

          <div className="w-full flex flex-col gap-[12px]">
            <h1 className="text-foreground text-custom-md">Recipients</h1>

            {splitData.recipients.map((recipient, id) => (
              <div key={id} className="flex flex-col gap-[8px]">
                <div className="w-full flex flex-col lg:flex-row gap-[24px]">
                  <div className="w-full flex flex-col gap-[10px] p-[8px]">
                    <h4 className="text-muted-foreground text-custom-sm">
                      Name
                    </h4>
                    <Card className="w-full flex text-custom-sm items-center bg-background p-[12px] gap-[7px]">
                      <div className="text-foreground w-full flex justify-between items-center">
                        {recipient.name}
                      </div>
                      <div className="text-foreground">
                        {recipient.percentage}%
                      </div>
                    </Card>
                  </div>
                  <div className="w-full flex flex-col gap-[10px] p-[8px]">
                    <h4 className="text-muted-foreground text-custom-sm flex justify-between items-center">
                      <p>Address</p>
                    </h4>
                    <Card className="w-full flex text-custom-sm items-center bg-background p-[12px] gap-[7px]">
                      <div className="text-foreground w-full">
                        {shortenAddress(recipient.walletAddress as `0x${string}`, 4)}
                      </div>
                      <div className="text-foreground flex flex-none">
                        ≈{token} {parseFloat(recipient.amount).toLocaleString()}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="w-full flex flex-col lg:items-end lg:flex-row gap-[24px] mt-4">
              {!smeId ? (
                <button
                  onClick={handleCreateSplit}
                  disabled={isCreating || totalPercentage !== 100}
                  className="w-full max-h-[51px] rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-[16px_32px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating Split..." : "Create Split"}
                </button>
              ) : (
                <button
                  onClick={handleDistributeSplit}
                  disabled={isDistributing}
                  className="w-full max-h-[51px] rounded-[12px] bg-green-600 text-white font-bold hover:bg-green-700 duration-200 transition-colors p-[16px_32px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDistributing ? "Distributing..." : "Distribute Split"}
                </button>
              )}
              <div className="flex flex-col gap-[10px] w-full relative">
                <h1 className="text-foreground text-custom-sm">
                  Select token
                </h1>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTokenToggle();
                  }}
                  className="w-full flex p-[12px] items-center rounded-[7px] bg-background cursor-pointer"
                >
                  <p className="text-muted-foreground">{token}</p>
                </div>
                {toggle && (
                  <Card className="w-full max-w-[200px] flex flex-col items-start absolute bottom-full left-0 z-10 mt-1">
                    {tokens.map((tkn, id) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTokenChange(tkn);
                        }}
                        key={id}
                        className="text-muted-foreground hover:bg-hover w-full p-2 text-left hover:text-hover"
                      >
                        {tkn}
                      </button>
                    ))}
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="w-full bg-Card mt-10 p-[32px_22px] flex flex-col gap-[24px] rounded-[12px] items-center justify-center h-64">
          <p className="text-muted-foreground text-custom-md">
            No split created yet. Click the + button to create one.
          </p>
        </Card>
      )}

      {/* add split modal */}
      {addSplitModal && (
        <AddSplit setSplitData={setSplitData} close={setAddSplitModal} />
      )}
    </div>
  );
}