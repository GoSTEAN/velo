"use client"

import React, { useState } from "react";
import Search from "../ui/search";
import Notification from "../ui/notification";
import { ThemeToggle } from "../ui/theme-toggle";
import ConnectWalletButton from "../ui/connect-button";
import { Menu, X } from "lucide-react";
import Image from "next/image";

interface TopNavProps {
  tabTitle: string;
}

export default function TopNav({ tabTitle }: TopNavProps) {
const [toggle, setToggle] = useState(false)

const handleTogle = () => {
  setToggle(!toggle)
}
  return (
    <section className="w-full h-[112px] relative bg-nav border-b border-border">
      {/* destop nav */}
      <div className=" p-[16px_24px] hidden gap-[20px] lg:gap-[58px] items-center md:flex">
        <h1 className="text-[28px] font-[500px] text-foreground lg:min-w-[200px]">
          {tabTitle}
        </h1>
        <Search />
        <Notification />
        <ThemeToggle />
        <ConnectWalletButton />
      </div>

      <div className="flex w-full justify-end pr-5 pt-5 md:hidden">
        <button onClick={handleTogle} className={`${toggle? 'hidden' : 'flex'} cursor-pointer  `}>
          <Menu />
        </button>
      </div>
      {/* Mobile nav */}
      <div className={`w-full h-full md:hidden ${toggle? "flex" : "hidden"}  justify-end items-center pr-5`}>

        <div className="w-full h-full absolute top-0 left-0 z-10 bg-background">
          <div className="w-full h-full relative flex flex-col ">
            <button onClick={handleTogle} className="text-muted-foreground absolute right-3 top-3">
              <X className="hover:text-red-500"/>
            </button>
            <div className="w-[100px] h-[100px] relative  mx-auto mt-5 ">
              <Image src={"/swiftLogo.svg"} alt="logo" fill />
            </div>
            <div className="w-full flex flex-col gap-5 px-5">
              <div className="w-full flex items-center gap-5 justify-between">
                <p className="text-foreground text-custom-xl text-center">{tabTitle}</p>
                <ThemeToggle />
                <ConnectWalletButton />
              </div>
              <div className="w-full flex  gap-5 justify-between">
                <Search />
                <Notification />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
