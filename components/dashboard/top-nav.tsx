"use client";

import React, { useState } from "react";
import Search from "../ui/search";
import Notification from "../ui/notification";
import { ThemeToggle } from "../ui/theme-toggle";
import { Menu, User, X } from "lucide-react";
import { Card } from "../ui/Card";
import Link from "next/link";
// import { Titan_One } from "next/font/google";

interface TopNavProps {
  tabTitle: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
}

// const titanOne = Titan_One({
//   subsets: ["latin"],
//   weight: [ "400"],
//   variable: "--font-titan-one",
// });

export default function TopNav({ tabTitle, setTab }: TopNavProps) {
  const [toggle, setToggle] = useState(false);

  const handleTogle = () => {
    setToggle(!toggle);
  };
  return (
    <section className="w-full h-auto relative bg-nav border-b border-border">
      {/* destop nav */}
      <div className=" p-[5px_24px] w-full hidden gap-[20px] lg:gap-[58px] items-center md:flex">
        <Link
          href={"/"}
          className="text-2xl font-bold font-[mono] italic rounded-b-2xl border-b-4 text-[#255ff1] "
        >
          VELO
        </Link>

        <div className="flex w-full justify-center items-center gap-5">
          <h1
            className={` text-[20]  font-[500px] flex text-foreground  gap-20 `}
          >
            {tabTitle}
          </h1>
          <Search />
          <Notification onclick={setTab} />
          <ThemeToggle />
          <Card className="p-0 w-fit">
            <button onClick={() => setTab("profile")} className="p-1 ">
              <User className="text-muted-foreground stroke-1 " />
            </button>
          </Card>
        </div>
      </div>

      <div className="flex w-full justify-between  py-2 px-5 md:hidden">
        <Link
          href={"/"}
          className="text-2xl font-bold font-[mono] italic rounded-b-2xl border-b-4 text-[#255ff1] "
        >
          VELO
        </Link>
        <button
          onClick={handleTogle}
          className={`${
            toggle ? "hidden" : "flex"
          } cursor-pointer text-foreground `}
        >
          <Menu />
        </button>
      </div>
      {/* Mobile nav */}
      <div
        className={`w-full h-full md:hidden  ${
          toggle ? "flex" : "hidden"
        }  justify-end items-center pr-5`}
      >
        <div className="w-full h-fit border-b border-border shadow-sm rounded-b-xl overflow-hidden shadow-black absolute top-0  left-0 z-10 bg-background">
          <div className="w-full h-full relative p-2 bg-background flex flex-col ">
            <button
              onClick={handleTogle}
              className="text-muted-foreground absolute right-3 top-3"
            >
              <X className="hover:text-red-500" />
            </button>

            <div className="flex justify-between items-center">
              <Link
                href={"/"}
                className="text-2xl font-bold font-[mono] italic rounded-b-2xl border-b-4 text-[#255ff1] "
              >
                VELO
              </Link>
            </div>
            <div className="w-full flex flex-col gap-5 p-5 ">
              <div className="w-full flex items-center gap-5 justify-between">
                <p className="text-foreground text-custom-xl text-center">
                  {tabTitle}
                </p>

                <Card className="p-0 w-fit">
                  <button onClick={() => setTab("profile")} className="p-2 ">
                    <User className="text-muted-foreground stroke-1 " />
                  </button>
                </Card>
                <Notification onclick={setTab} />
                <ThemeToggle />
              </div>
              <div className="w-full flex  gap-5 justify-center">
                <Search />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
