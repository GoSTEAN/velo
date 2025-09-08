import { shortenAddress } from "@/components/lib/utils";
import AddSplit from "@/components/modals/add-split";
import { Card } from "@/components/ui/Card";
import { Check, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { SplitData } from "@/splits";

export default function PaymentSplit() {
  const [addSplitModal, setAddSplitModal] = useState(false);
  const [splitData, setSplitData] = useState<SplitData | null>(null);

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
  return (
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5  relative ">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-foreground text-custom-lg"> Create Split</h1>
        <button
          onClick={handleShowSplitModal}
          className="bg-Card p-2 text-foreground rounded-[7px]"
        >
          <Plus className="" />
        </button>
      </div>
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
                <h1 className="text-foreground text-custom-lg font-[600]">
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
                <h1 className="text-foreground text-custom-lg font-[600]">
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
                <h1 className="text-foreground text-custom-lg font-[600]">
                  ₦{totalAmount.toLocaleString()}
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
                      <Trash2 size={14} />
                    </h4>
                    <Card className="w-full flex text-custom-sm items-center bg-background p-[12px] gap-[7px]">
                      <div className="text-foreground w-full">
                        {shortenAddress(recipient.walletAddress, 4)}
                      </div>
                      <div className="text-foreground flex flex-none">
                        ≈₦{parseFloat(recipient.amount).toLocaleString()}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
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
