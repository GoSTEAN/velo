"use client";

import { Card } from "@/components/ui/Card";
import { ArrowDown, ArrowUp, Coins, Copy, Plus, User } from "lucide-react";
import React, { useState } from "react";
import { shortenAddress, shortenName } from "@/components/lib/utils";
import { useAccount } from "@starknet-react/core";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { span, thead, tr } from "framer-motion/client";

export default function DashboardHome() {
  const [addressError, SetAddressError] = useState();
  const [view, setview] = useState();
  const { address, account } = useAccount();

  console.log(account);

  const sortedTransactions = [
    {
      name: "Progress Ada",
      amount: "$400",
      date: "August 10, 2025",
      status: "Processing",
      img: undefined,
    },
    {
      name: "Babatunde Abdullahi",
      amount: "$600",
      date: "August 10, 2025",
      status: "Failed",
      img: undefined,
    },
    {
      name: "Zainab Ogunleye",
      amount: "$90",
      date: "August 10, 2025",
      status: "Completed",
      img: undefined,
    },
    {
      name: "Kunle Ayodele",
      amount: "$20",
      date: "August 10, 2025",
      status: "Completed",
      img: undefined,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "failed":
        return "text-[#EF4444]";
      case "processing":
        return "text-[#1E488E]";
      case "completed":
        return "text-[#22C55E]";
      default:
        return "";
    }
  };

  const metrix = [
    {
      token: "USDT",
      icons: <Coins />,
      symbol: "$",
      amount: "1,500,000",
      ngnValue: "N1,909,000",
      tradeChat: 9,
    },
    {
      token: "USDC",
      icons: <Coins />,
      symbol: "$",
      amount: "1,500,000",
      ngnValue: "N1,909,000",
      tradeChat: -9,
    },
    {
      token: "STRK",
      icons: <Coins />,
      symbol: "$",
      amount: "1,500,000",
      ngnValue: "N1,909,000",
      tradeChat: 9,
    },
  ];

  const quickTransaction = [
    {
      fName: "Tali",
      lName: "Moses",
      walletAddress: address,
      img: undefined,
    },
    {
      fName: "Tali",
      lName: "Moses",
      walletAddress: address,
      img: undefined,
    },

    {
      fName: "Tali",
      lName: "Moses",
      walletAddress: address,
      img: undefined,
    },
  ];

  const thead = ["Name", "Amount", "Timestamp", "Status"];

  return (
    <div className="w-full h-auto p-[32px_20px_172px_32px] overflow-y-scroll">
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-[20px]">
        <div className="flex flex-col items-start border-none w-fit lg:min-w-[40%]">
          <h3 className="text-muted-foreground font-[400] text-custom-xs">
            Current balance
          </h3>
          <h1 className="text-custom-2xl text-foreground flex flex-none truncate font-black">
            ₦ 2,847,500
          </h1>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-stretch gap-[12px]">
          {metrix.map((item, id) => (
            <Card
              key={id}
              className="flex flex-col gap-[12px] w-full  border-none "
            >
              <div className="w-full flex items-center justify-between">
                <div className="flex gap-[4px] text-muted-foreground items-center">
                  {item.icons}
                  <p>{item.token}</p>
                </div>
                <div className="flex gap-[4px] items-center">
                  {item.tradeChat < 0 ? (
                    <ArrowDown size={15} color="#EB5757" />
                  ) : (
                    <ArrowUp size={15} color="#27AE60" />
                  )}
                  <span
                    className="text-[14px]"
                    style={{
                      color: item.tradeChat < 0 ? "#EB5757" : "#27AE60",
                    }}
                  >
                    {" "}
                    {item.tradeChat}%
                  </span>
                </div>
              </div>
              <div className="w-full flex items-center justify-between gap-[8px]">
                <div className="flex gap-[4px] text-head text-custom-md font-black items-center">
                  <p>{item.symbol}</p>
                  <p>{item.amount}</p>
                </div>
                <p className="text-custom-xs text-muted-foreground truncate">
                  ≈{item.ngnValue}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="w-full flex items-start flex-col lg:flex-row gap-[20px] mt-7">
        <Card className="p-[24px w-full flex lg:justify-between border-none space-y-[20px] lg:space-y-0 lg:space-x-[50px] flex-col lg:flex-row items-center">
          <div className="w-full flex flex-col  gap-[14px] px-4 ">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-custom-xs">
                Connected address
              </span>
            </div>
            <div className="flex w-full justify-between ">
              <div className="text-foreground w-full text-custom-md font-black">
                {shortenAddress(address, 12)}
              </div>
              <div className="flex gap-2 ">
                <button className="text-muted-foreground cursor-pointer text-[14px] ">
                  <Copy />
                </button>
              </div>
            </div>
          </div>
          <div className="w-full h-1 bg-[#D5DFEC]  rounded-full  lg:w-2 lg:h-12"></div>
          <div className="w-full flex flex-col gap-[14px] px-4 ">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-custom-xs">
                Account Number
              </span>
            </div>
            <div className="flex w-full justify-between ">
              <div className="text-foreground  text-custom-md w-full font-black">
                8101842464
              </div>
              <div className="flex gap-2 ">
                <button className="text-muted-foreground text-[14px] cursor-pointer">
                  <Copy />
                </button>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-[22px] border-none flex flex-col gap-[18px] items-start w-full ">
          <h1 className="text-foreground text-custom-md font-bold">
            Quick transaction
          </h1>
          <div className="flex items-center gap-[4px] w-full space-x-3">
            {quickTransaction.map((transaction, id) => (
              <div
                key={id}
                className="flex p-[8px_6px] rounded-[20px] bg-background justify-evenly w-full"
              >
                <div className="rounded-full w-[22px] h-[22px] border flex items-center justify-center border-border relative">
                  {transaction.img ? (
                    <Image src={transaction.img} alt={transaction.fName} fill />
                  ) : (
                    <span className="text-[#1E488E] text-[10px] text-center font-bold">
                      {shortenName(transaction.fName, transaction.lName)}
                    </span>
                  )}
                </div>
                <p className="text-foreground text-custom-xs">
                  {shortenAddress(transaction.walletAddress, 6)}
                </p>
              </div>
            ))}
            <button className="cursor-pointer text-foreground">
              <Plus />
            </button>
          </div>
          <div className="w-full flex gap-[4px] font-bold flex-col lg:flex-row ">
            <button className="rounded-[7px] p-[16px_32px] bg-button hover:bg-hover text-button cursor-pointer w-full hover:text-hover">
              Marchant Pay
            </button>
            <button className="rounded-[7px] p-[16px_32px] bg-button hover:bg-hover text-button cursor-pointer w-full hover:text-hover">
              Swap
            </button>
          </div>
        </Card>
      </div>

      {/* history section */}
      <div className="w-full max-w-[922px] flex flex-col">
        <h3 className="text-muted-foreground">Transaction History</h3>
        <table className="w-full flex border border-border rounded-[12px] flex-col ">
          <thead className="w-full bg-card border-none rounded-t-[12px] text-muted-foreground">
            <tr className="w-full p-[14px_24px] justify-between flex">
              {thead.map((td, id) => (
                <td key={id} className="text-custom-xs w-full ">
                  {td}
                </td>
              ))}
            </tr>
          </thead>
          <tbody className="">
            {sortedTransactions.map((tx, id) => (
              <tr
                key={id}
                className="w-full p-[14px_24px] justify-between flex border-b-[1px] border-border"
              >
                <td className="flex gap-[8px] items-center w-full">
                  <div className="w-[24px] h-[24px] rounded-full border border-border p-[1px] relative">
                    {tx.img ? (
                      <Image src={tx.img} fill alt="user profile image" />
                    ) : (
                      <User color="white" size={100} />
                    )}
                  </div>
                  <span className="text-foreground text-custom-sm font-[400] truncate text-start">
                    {tx.name}
                  </span>
                </td>
                <td className="text-custom-sm text-foreground w-full truncate text-start">
                  {tx.amount}
                </td>
                <td className="text-custom-sm text-foreground w-full truncate text-start">
                  {tx.date}
                </td>
                <td className={`${getStatusColor(tx.status)} text-custom-sm w-full truncate text-start `}>
                  {tx.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
