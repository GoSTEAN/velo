import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import WalletSAndBalance from "@/components/modals/walletSAndBalance";

interface PaymentSelectionProps {
  type: string;
  formData: any;
  selectedToken: string;
  providers: any[];
  config: any;
  onTokenSelect: (token: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PaymentSelection({
  formData,
  selectedToken,
  providers,
  onTokenSelect,
  onBack,
  onNext,
}: PaymentSelectionProps) {
  // const [selectedToken, setSelectedToken] = useState<string | null>(null);


  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 sm:p-6"
    >
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-accent transition-colors mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold">Select Payment Method</h2>
      </div>

      <div className="bg-card border rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground text-sm">Amount</p>
            <p className="text-2xl font-bold">
              ₦{parseInt(formData.amount || "0").toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Provider</p>
            <p className="font-medium">
              {providers.find(p => p.serviceID === formData.service_id)?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
       <WalletSAndBalance selectedToken={selectedToken} setSelectedToken={onTokenSelect}/>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 p-4 rounded-xl border hover:bg-accent transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 p-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}