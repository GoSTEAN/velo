import { HugeiconsIcon } from "@hugeicons/react";
import {
  DiscordFreeIcons,
  NewTwitterIcon,
  TelegramFreeIcons,
} from "@hugeicons/core-free-icons";

import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  const product = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Privacy", href: "#privacy" },
    { name: "FAQs", href: "#faq" },
    { name: "Contacts", href: "/contact" },
  ];

  const socials = [
    {
      name: "X",
      icon: <HugeiconsIcon icon={NewTwitterIcon} />,
      link: "https://www.x.com",
    },
    {
      name: "Discord",
      icon: <HugeiconsIcon icon={DiscordFreeIcons} />,
      link: "https://www.discord.com",
    },
    {
      name: "Telegram",
      icon: <HugeiconsIcon icon={TelegramFreeIcons} />,
      link: "https://www.telegram.com",
    },
  ];

  return (
    <footer className="bg-background py-8 px-10 md:px-25">

          <div className="w-full justify-between flex flex-col sm:flex-row items-center pb-5">
            <div className="flex w-full space-x-4">
              {socials?.map((item, id) => (
                <Link
                key={id}
                  href={item.link}
                  title={`Follow us on ${item.name}`}
                  aria-label={`Follow us on ${item.name}`}
                  className="w-10 h-10 bg-button text-button  rounded-full flex items-center justify-center hover:bg-blue-hover transition-colors"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
            <div className="w-full flex justify-end items-center gap-6 ">
              {product?.map((item, id) => (
                <div key={id} className="flex items-center space-x-2">
                  <Link
                    href={item.href}
                    key={id}
                    className="text-muted-foreground flex flex-none  w-fit text-custom-xs "
                  >
                    {item.name}
                  </Link>
                  {id !== product.length - 1 && (
                    <span className="bg-button w-2 h-2 rounded-full flex flex-none"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
      
        {/* Bottom Footer */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-text font-inter">
              © Copyright 2025
            </div>

            <div className="flex items-center space-x-6">
               <span className="bg-button w-2 h-2 rounded-full flex flex-none"></span>
              <Link
                href="#terms"
                className="text-sm text-gray-text hover:text-foreground transition-colors font-inter"
              >
                Terms of Service
              </Link>
               <span className="bg-button w-2 h-2 rounded-full flex flex-none"></span>
              <Link
                href="#privacy"
                className="text-sm text-gray-text hover:text-foreground transition-colors font-inter"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

    </footer>
  );
};

export default Footer;
