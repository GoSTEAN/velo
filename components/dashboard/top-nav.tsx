'use client';

import React, { useState } from 'react';
import Search from '../ui/search';
import Notification from '../ui/notification';
import { ThemeToggle } from '../ui/theme-toggle';
import ConnectWalletButton from '../ui/connect-button';
import { Menu, User, X } from 'lucide-react';
import Image from 'next/image';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

import { useRouter } from 'next/navigation';

interface TopNavProps {
    tabTitle: string;
    setTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function TopNav({ tabTitle, setTab }: TopNavProps) {
    const [toggle, setToggle] = useState(false);

    const handleTogle = () => {
        setToggle(!toggle);
    };
    const router = useRouter();
    return (
        <section className="w-full h-[112px] relative bg-nav border-b border-border">
            {/* destop nav */}
            <div className=" p-[16px_24px] hidden gap-[20px] lg:gap-[58px] items-center md:flex">
                <h1 className="text-[28px] font-[500px] text-foreground lg:min-w-[200px]">
                    {tabTitle}
                </h1>
                <Search />
                <Notification  onclick={setTab} />
                <ThemeToggle />
                <Card className="p-0 w-fit">
                    <button onClick={() => setTab('profile')} className="p-2 ">
                        <User className="text-muted-foreground stroke-1 " />
                    </button>
                </Card>
                <Card className="p-0 w-fit">
                    <button
                        className="p-2 text-muted-foreground flex  "
                        onClick={() => router.push('/auth')}
                    >
                        Get Started
                    </button>
                </Card>
            </div>

            <div className="flex w-full justify-between pr-5 pt-5 md:hidden">
                <Image
                    src={'/swiftLogo.svg'}
                    alt="logo"
                    width={100}
                    height={100}
                    className="ml-5"
                />
                <button
                    onClick={handleTogle}
                    className={`${
                        toggle ? 'hidden' : 'flex'
                    } cursor-pointer text-foreground `}
                >
                    <Menu />
                </button>
            </div>
            {/* Mobile nav */}
            <div
                className={`w-full h-full md:hidden  ${
                    toggle ? 'flex' : 'hidden'
                }  justify-end items-center pr-5`}
            >
                <div className="w-full h-99 absolute top-0  left-0 z-10 bg-background">
                    <div className="w-full h-full relative  bg-background flex flex-col ">
                        <button
                            onClick={handleTogle}
                            className="text-muted-foreground absolute right-3 top-3"
                        >
                            <X className="hover:text-red-500" />
                        </button>
                        <div className='w-fit absolute top-3 left-3'>
                             <ThemeToggle />
                        </div>
                        <div className='flex justify-between items-center'>

                        <div className="w-[70px] h-[70px] relative  mx-auto mt-5 ">
                            <Image src={'/swiftLogo.svg'} alt="logo" fill />
                        </div>
                        
                        </div>
                        <div className="w-full flex flex-col gap-5 px-5 ">
                            <div className="w-full flex items-center gap-5 justify-between">
                                <p className="text-foreground text-custom-xl text-center">
                                    {tabTitle}
                                </p>
                                <Button className='w-full max-w-30'>
                                    Get Started
                                </Button>
                                  <Card className="p-0 w-fit">
                    <button onClick={() => setTab('profile')} className="p-2 ">
                        <User className="text-muted-foreground stroke-1 " />
                    </button>
                </Card>
                               
                            </div>
                            <div className="w-full flex  gap-5 justify-between">
                                <Search />
                                <Notification onclick={setTab} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
