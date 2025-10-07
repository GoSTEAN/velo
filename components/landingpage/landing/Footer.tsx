import { HugeiconsIcon } from "@hugeicons/react";
import {
  DiscordFreeIcons,
  NewTwitterIcon,
  TelegramFreeIcons,
} from "@hugeicons/core-free-icons";

import Link from "next/link";
import { Button } from "@/components/ui/buttons";

export const Footer = () => {


  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Privacy Policy", href: "#privacy" },
        { name: "FAQs", href: "#faq" },
        { name: "Contacts", href: "/contact" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "#privacy" },
        { name: " Terms of Service", href: "#terms" },
        { name: "Security", href: "#" },
      ],
    },
  ]


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
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Button  className="text-2xl font-bold velo-logo-gradient">VELO.</Button>
            <p className="text-sm text-muted-foreground">
              Fast, secure, and borderless payments for Nigerian businesses.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 VELO. All rights reserved.</p>
          <div className="flex items-center gap-4">

            {socials.map((social, index) => (
              <Link key={index} href={social.link} className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">{social.name}</span>
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
};

export default Footer;
