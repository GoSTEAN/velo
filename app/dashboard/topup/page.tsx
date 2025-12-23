// "use client";

// import { useState } from "react";
// // Assuming Card component is styled like the one in the screenshot (dark, slightly translucent)
// import { Card } from "@/components/ui/Card"; 
// import { ChevronLeft } from "lucide-react";
// // Components for each step (assuming they handle their own internal styling)
// import TokenSelection from "@/components/modals/token-selection";
// import AmountEntry from "@/components/modals/amount-entry";
// import Confirmation from "@/components/modals/confirmation";
// import { apiClient } from "@/lib/api-client";
// import toast from "react-hot-toast";

// type TopUpStep = "selection" | "amount" | "confirmation";

// const steps: TopUpStep[] = ["selection", "amount", "confirmation"];
// const stepTitles = {
//   selection: "Select Cryptocurrency",
//   amount: "Enter Amount",
//   confirmation: "Confirm Purchase",
// };

// export default function TopUp() {
//   const [currentStep, setCurrentStep] = useState<TopUpStep>("selection");
//   const [selectedToken, setSelectedToken] = useState<string>("");
//     const [isProcessing, setIsProcessing] = useState(false);

//   const [amountData, setAmountData] = useState({
//     usdAmount: "",
//     cryptoAmount: "",
//   });

//   const handleTokenSelect = (token: string) => {
//     setSelectedToken(token);
//     setCurrentStep("amount");
//   };

//   const handleAmountSubmit = (usdAmount: string, cryptoAmount: string) => {
//     setAmountData({ usdAmount, cryptoAmount });
//     setCurrentStep("confirmation");
//   };

//   const handleBack = () => {
//     if (currentStep === "amount") {
//       setCurrentStep("selection");
//     } else if (currentStep === "confirmation") {
//       setCurrentStep("amount");
//     }
//   };

//   const handleComplete = () => {
//     // Reset flow after completion
//     setCurrentStep("selection");
//     setSelectedToken("");
//     setAmountData({ usdAmount: "", cryptoAmount: "" });
//     // In a real app, you might want to show a success message here before redirecting
//   };

//   const handleCreateDepositWithAmount = async (usdAmount: string) => {
//   if (!selectedToken || !usdAmount) {
//     toast.error("Please select a token and enter an amount.");
//     return;
//   }

//   setIsProcessing(true);
//   try {
//     // 1. Get all wallet addresses
//     const addresses = await apiClient.getWalletAddresses();
//     if (!addresses || addresses.length === 0) {
//       toast.error("No wallet addresses found. Please add one in settings.");
//       return;
//     }

//     // 2. Map crypto → correct chain name in your backend
//     const chainMap: Record<string, string> = {
//       ETH: "ethereum",
//       BTC: "bitcoin",
//       SOL: "solana",
//       USDT: "ethereum",
//       USDC: "ethereum",
//     };

//     const targetChain = chainMap[selectedToken.toUpperCase()] || selectedToken.toLowerCase();

//     // 3. Find the correct address for the selected token
//     const wallet = addresses.find((addr: any) => 
//       addr.chain?.toLowerCase() === targetChain ||
//       addr.network?.toLowerCase() === targetChain
//     );

//     if (!wallet || !wallet.address) {
//       toast.error(`No ${selectedToken} wallet address found. Go to Settings → Addresses and add one.`);
//       return;
//     }

//     if (selectedToken === "ETH" && !wallet.address.startsWith("0x")) {
//       toast.error("ETH requires an Ethereum (0x...) address. Your current address is for Starknet.");
//       return;
//     }

//     // 4. Final payload — 100% correct
//     const payload = {
//       currencyTo: selectedToken.toUpperCase(),
//       amountFrom: usdAmount.trim(),           // ← string, no number!
//       walletAddress: wallet.address.trim(),    // ← correct 0x address
//     };

//     console.log("Sending to backend:", payload);

//     const resp = await apiClient.createFiatDeposit(payload);

//     // SUCCESS → redirect user to payment page
//     if (resp.success && resp.redirectUrl) {
//       toast.success("Redirecting to payment...");
//       window.location.href = resp.redirectUrl;
//     } else {
//       toast.error("Deposit created but no redirect URL");
//     }

//   } catch (err: any) {
//     console.error("Deposit failed:", err);
//     const msg = err?.data?.error || err?.message || "Payment failed";
//     toast.error(msg);
//   } finally {
//     setIsProcessing(false);
//   }
// };

//   // const handleCreateDeposit = async () => {
//   //   if (!selectedToken || !amountData.usdAmount) {
//   //     toast.error("Please select a token and enter an amount in USD.");
//   //     return;
//   //   }

//   //   setIsProcessing(true);
//   //   try {
//   //     // Get user's wallet addresses and pick the first/main address
//   //     const addresses = await apiClient.getWalletAddresses();
//   //     const walletAddress = (addresses && addresses[0] && addresses[0].address) || "";

//   //     if (!walletAddress) {
//   //       throw new Error("No wallet address available for deposit.");
//   //     }

//   //     const payload = {
//   //       currencyTo: selectedToken,
//   //       // amountFrom should be the USD amount entered by the user
//   //       amountFrom: String(amountData.usdAmount),
//   //       walletAddress,
//   //     };

//   //     const resp = await apiClient.createFiatDeposit(payload);
//   //     console.log("Deposit response:", resp);

//   //     toast.success("Deposit initiated. Check your notifications for updates.");
//   //     handleComplete();
//   //   } catch (err: any) {
//   //     console.error("Deposit creation failed:", err);
//   //     const msg = err?.data?.message || err?.message || "Deposit failed";
//   //     toast.error(msg);
//   //   } finally {
//   //     setIsProcessing(false);
//   //   }
//   // };



//   // Helper to create a deposit using explicit usdAmount (used by AmountEntry
//   // when user clicks Proceed and we want to call the backend immediately).
//   const handleCreateDepositWithAmount = async (usdAmount: string) => {
//     if (!selectedToken || !usdAmount) {
//       toast.error("Please select a token and enter an amount in USD.");
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       const addresses = await apiClient.getWalletAddresses();
//       const walletAddress = (addresses && addresses[0] && addresses[0].address) || "";
//       if (!walletAddress) throw new Error("No wallet address available for deposit.");

//       const payload = {
//         currencyTo: selectedToken,
//         amountFrom: String(usdAmount),
//         walletAddress,
//       };

//       const resp = await apiClient.createFiatDeposit(payload);
//       console.log("Deposit response:", resp);

//       toast.success("Deposit initiated. Check your notifications for updates.");
//       handleComplete();
//     } catch (err: any) {
//       console.error("Deposit creation failed:", err);
//       const msg = err?.data?.message || err?.message || "Deposit failed";
//       toast.error(msg);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const currentStepIndex = steps.indexOf(currentStep);

//   return (
//     <div className="w-full max-w-xl mx-auto p-4 space-y-6 mt-12 md:mt-16">
//       <div className="space-y-6">
//         {/* Adjusted Card: slightly wider for better flow, using a richer dark background */}
//         <Card className="border-border/50 bg-gray-900/70 flex-col backdrop-blur-md p-8 shadow-2xl max-w-xl mx-auto">
//           {/* Header */}
//           <div className="flex items-center gap-4 mb-8">
//             {currentStep !== "selection" && (
//               <button
//                 onClick={handleBack}
//                 className="p-2 hover:bg-white/10 rounded-lg transition-colors"
//                 aria-label="Go back to previous step"
//               >
//                 <ChevronLeft className="h-6 w-6 text-foreground" />
//               </button>
//             )}
//             <div className="flex-1">
//               {/* Stronger, more prominent title */}
//               <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
//                 Buy Crypto
//               </h1>
//               {/* Current Step Title/Subtitle */}
//               <p className="text-primary text-md font-semibold mt-1">
//                 {stepTitles[currentStep]}
//               </p>
//             </div>
//           </div>

//           {/* Progress Steps: Modern Pill/Bar Indicator */}
//           <div className="flex justify-between w-full mb-10">
//             {steps.map((step, index) => (
//               <div
//                 key={step}
//                 className="flex flex-col items-center flex-1 min-w-0"
//               >
//                 {/* Step Marker Pill */}
//                 <div
//                   className={`w-full h-1.5 rounded-full transition-all duration-300 ${
//                     index <= currentStepIndex
//                       ? "bg-primary" // Active/Completed
//                       : "bg-muted/30" // Pending
//                   }`}
//                 />
//                 {/* Step Label (Hidden on small screens, optional) */}
//                 <span
//                   className={`hidden sm:block text-xs mt-2 transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
//                     index === currentStepIndex
//                       ? "text-primary font-medium"
//                       : index < currentStepIndex
//                       ? "text-muted-foreground/80"
//                       : "text-muted-foreground/50"
//                   }`}
//                 >
//                   {stepTitles[step]}
//                 </span>
//               </div>
//             ))}
//           </div>

//           {/* Step Content */}
//           {/* The min-h is kept to prevent layout shift */}
//           <div className="min-h-[400px] pt-4"> 
//             {currentStep === "selection" && (
//               <TokenSelection onTokenSelect={handleTokenSelect} />
//             )}
//             {currentStep === "amount" && (
//               <AmountEntry
//                 selectedToken={selectedToken}
//                 onAmountSubmit={handleAmountSubmit}
//                 onProceed={(usdAmount) => handleCreateDepositWithAmount(usdAmount)}
//                 onBack={handleBack}
//               />
//             )}
//             {currentStep === "confirmation" && (
//               <Confirmation
//                 selectedToken={selectedToken}
//                 usdAmount={amountData.usdAmount}
//                 cryptoAmount={amountData.cryptoAmount}
//                 onComplete={handleCreateDeposit}
//                 onBack={handleBack}
//               />
//             )}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ChevronLeft } from "lucide-react";
import TokenSelection from "@/components/modals/token-selection";
import AmountEntry from "@/components/modals/amount-entry";
import Confirmation from "@/components/modals/confirmation";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

type TopUpStep = "selection" | "amount" | "confirmation";

const steps: TopUpStep[] = ["selection", "amount", "confirmation"];
const stepTitles = {
  selection: "Select Cryptocurrency",
  amount: "Enter Amount",
  confirmation: "Confirm Purchase",
};

export default function TopUp() {
  const [currentStep, setCurrentStep] = useState<TopUpStep>("selection");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amountData, setAmountData] = useState({ usdAmount: "", cryptoAmount: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    setCurrentStep("amount");
  };

  const handleAmountSubmit = (usdAmount: string, cryptoAmount: string) => {
    setAmountData({ usdAmount, cryptoAmount });
    setCurrentStep("confirmation");
  };

  const handleBack = () => {
    if (currentStep === "amount") setCurrentStep("selection");
    if (currentStep === "confirmation") setCurrentStep("amount");
  };

  const handleComplete = () => {
    setCurrentStep("selection");
    setSelectedToken("");
    setAmountData({ usdAmount: "", cryptoAmount: "" });
  };

  // ONE SINGLE WORKING FUNCTION — no duplicate, no design change
  const createFiatDeposit = async (usdAmount: string) => {
    if (!selectedToken || !usdAmount) {
      toast.error("Please select a token and enter an amount.");
      return;
    }

    setIsProcessing(true);
    try {
      const addresses = await apiClient.getWalletAddresses();
      if (!addresses?.length) {
        toast.error("No wallet addresses found.");
        return;
      }

      const chainMap: Record<string, string> = {
        ETH: "ethereum",
        BTC: "bitcoin",
        SOL: "solana",
        USDT: "ethereum",
        USDC: "ethereum",
      };
      const targetChain = chainMap[selectedToken.toUpperCase()] || selectedToken.toLowerCase();

      const wallet = addresses.find(
        (a: any) =>
          a.chain?.toLowerCase() === targetChain ||
          a.network?.toLowerCase() === targetChain
      );

      if (!wallet?.address) {
        toast.error(`No ${selectedToken} wallet address found. Add it in Settings.`);
        return;
      }

      if (selectedToken.toUpperCase() === "ETH" && !wallet.address.startsWith("0x")) {
        toast.error("ETH requires an Ethereum (0x...) address.");
        return;
      }

      const payload = {
        currencyTo: selectedToken.toUpperCase(),
        amountFrom: usdAmount.trim(),
        walletAddress: wallet.address.trim(),
      };

      const resp = await apiClient.createFiatDeposit(payload);

      if (resp.success && resp.redirectUrl) {
        toast.success("Redirecting to payment...");
        window.location.href = resp.redirectUrl;
      } else {
        toast.error("No payment link received.");
      }
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "Payment failed";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-6 mt-12 md:mt-16">
      <div className="space-y-6">
        {/* YOUR ORIGINAL CARD — 100% untouched */}
        <Card className="border-border/50 bg-gray-900/70 flex-col backdrop-blur-md p-8 shadow-2xl max-w-xl mx-auto">
          {/* YOUR ORIGINAL HEADER */}
          <div className="flex items-center gap-4 mb-8">
            {currentStep !== "selection" && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Go back to previous step"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
                Buy Crypto
              </h1>
              <p className="text-primary text-md font-semibold mt-1">
                {stepTitles[currentStep]}
              </p>
            </div>
          </div>

          {/* YOUR ORIGINAL PROGRESS BAR */}
          <div className="flex justify-between w-full mb-10">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    index <= currentStepIndex ? "bg-primary" : "bg-muted/30"
                  }`}
                />
                <span
                  className={`hidden sm:block text-xs mt-2 transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                    index === currentStepIndex
                      ? "text-primary font-medium"
                      : index < currentStepIndex
                      ? "text-muted-foreground/80"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {stepTitles[step]}
                </span>
              </div>
            ))}
          </div>

          {/* YOUR ORIGINAL CONTENT AREA */}
          <div className="min-h-[400px] pt-4">
            {currentStep === "selection" && (
              <TokenSelection onTokenSelect={handleTokenSelect} />
            )}
            {currentStep === "amount" && (
              <AmountEntry
                selectedToken={selectedToken}
                onAmountSubmit={handleAmountSubmit}
                onProceed={createFiatDeposit}
                onBack={handleBack}
              />
            )}
            {currentStep === "confirmation" && (
              <Confirmation
                selectedToken={selectedToken}
                usdAmount={amountData.usdAmount}
                cryptoAmount={amountData.cryptoAmount}
                onComplete={() => createFiatDeposit(amountData.usdAmount)}
                onBack={handleBack}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}