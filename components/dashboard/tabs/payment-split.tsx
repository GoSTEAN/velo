import { Card } from "@/components/ui/Card";
import { Check, Plus, Trash2 } from "lucide-react";
import React from "react";

export default function PaymentSplit() {
  return (
    <div className="w-full h-full max-w-[80%] md:p-[20px_20px_20px_80px] pl-5">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-foreground text-custom-lg"> Create Split</h1>
        <button className="bg-Card p-2 text-foreground rounded-[7px]">
          <Plus className="" />
        </button>
      </div>
      <Card className="w-full bg-Card mt-10 p-[32px_22px] flex flex-col  gap-[24px]  rounded-[12px] items-start">
        <div className="flex flex-col gap-[8px] w-full">
          <h1 className="text-foreground text-custom-xl font-bold ">
            Main Business Split
          </h1>
          <p className="text-custom-md text-muted-foreground">
            Revenue sharing for core team
          </p>
        </div>

        <div className="w-full grid grid-cols1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] xl:gap-[90px]">
          <div className="p-[20px_22px] rounded-[12px] flex flex-col">
            <Card className="bg-Card flex-col text-muted-foreground">
              <Card className="w-fit p-2">
                <Check />
              </Card>
              <h3 className="text-custom-md flex flex-none">
                Total Percentage
              </h3>
              <h1 className="text-foreground text-custom-lg font-[600]">
                100%
              </h1>
            </Card>
          </div>
          <div className="p-[20px_22px] rounded-[12px] flex flex-col">
            <Card className="bg-Card flex-col text-muted-foreground">
              <Card className="w-fit p-2">
                <Check />
              </Card>
              <h3 className="text-custom-md flex flex-none">Recipients</h3>
              <h1 className="text-foreground text-custom-lg font-[600]">3</h1>
            </Card>
          </div>
          <div className="p-[20px_22px] rounded-[12px] flex flex-col">
            <Card className="bg-Card flex-col text-muted-foreground">
              <Card className="w-fit p-2">
                <Check />
              </Card>
              <h3 className="text-custom-md flex flex-none">Total Received</h3>
              <h1 className="text-foreground text-custom-lg font-[600]">
                ₦2,450,000
              </h1>
            </Card>
          </div>
        </div>

        <div className="w-full flex flex-col gap-[12px]">
          <h1 className="text-foreground text-custom-md">Recipients</h1>
          <div className="flex flex-col gap-[8px]">
            <div className="w-full flex flex-col lg:flex-row gap-[24px]">
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <h4 className="text-muted-foreground text-custom-sm">Name</h4>
                <Card className="w-full flex text-custom-sm items-center bg-background p-[12px] gap-[7px]">
                  <div className="text-foreground w-full flex justify-between items-center">
                    Tali Moses Nanzing
                  </div>
                  <div className="text-foreground ">60%</div>
                </Card>
              </div>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <h4 className="text-muted-foreground text-custom-sm flex justify-between items-center">
                  <p>Address</p>
                  <Trash2 size={14} />
                </h4>
                <Card className="w-full flex text-custom-sm items-center bg-background p-[12px] gap-[7px]">
                  <div className="text-foreground w-full">1000</div>
                  <div className="text-foreground flex flex-none">≈₦{1000}</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* add split modal */}

      <div className="absolute top-0 left-0 bg-background w-full  h-full flex items-center justify-center">
        <div className="w-full max-w-[974.8281860351562px] h-auto p-[32px_22px] gap-[32px] rounded-[12px] bg-Card">
          <h1 className="text-foreground text-custom-md font-bold">
            Create Payment Split
          </h1>

          <div className="flex flex-col gap-[24px] lg:flex-row">
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <label htmlFor="title" className="text-foreground text-custom-sm">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Input Text"
                className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
              />
            </div>
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <label
                htmlFor="wallet"
                className="text-foreground text-custom-sm"
              >
                Wallet Address
              </label>
              <input
                id="wallet"
                type="text"
                placeholder="Input Text"
                className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
              />
            </div>
          </div>

          <Card className="flex-col items-start bg-Card mt-5">
            <div className="w-full flex justify-between items-center">
              <h1 className="text-foreground  text-custom-md mt-5 font-bold">
                Add Receipants
              </h1>
              <button className="bg-background border cursor-pointer border-border p-2 text-foreground rounded-[7px]">
                <Plus className="" />
              </button>
            </div>

            <div className="flex w-full  flex-col gap-[24px] lg:flex-row">
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label
                  htmlFor="title"
                  className="text-foreground text-custom-sm"
                >
                  Titie
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="Input Text"
                  className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
                />
              </div>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label htmlFor="des" className="text-foreground text-custom-sm">
                  Description
                </label>
                <input
                  id="des"
                  type="text"
                  placeholder="Input Text"
                  className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
                />
              </div>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label htmlFor="per" className="text-foreground text-custom-sm">
                  Amount
                </label>
                <input
                  id="per"
                  type="text"
                  placeholder="Input Text"
                  className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[12px] w-full">
                <div className="w-full flex-col flex gap-[12px] ">
                    <h4 className="text-custon-xs thext-muted-foreground">Recepiant</h4>
                </div>
            </div>
          </Card>

          <div className="w-full flex gap-[24px] flex-col mt-5 lg:flex-row">
            <button className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-[16px_32px] ">
              Create Split
            </button>
            <button className="w-full rounded-[12px] duration-200 transition-colors bg-white border border-[#2F80ED] text-[#2F80ED] hover:bg-hover  hover:text-hover font-bold p-[16px_32px] ">
              cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
