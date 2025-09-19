import { Wallet, CreditCard, Users, ArrowRightLeft } from "lucide-react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Exchange02FreeIcons,
  SaveMoneyDollarFreeIcons,
  UserGroupIcon,
  UserSwitchFreeIcons,
  Wallet05Icon,
} from "@hugeicons/core-free-icons";

const HowItWorks = () => {
  const steps = [
    {
      icon: (
        <HugeiconsIcon icon={Wallet05Icon} size={100} className="text-head" />
      ),
      title: "Generate Your Wallet",
      description:
        "Link to an Agent or Business via Smart Contract and start accepting instant payments.",
    },
    {
      icon: (
        <HugeiconsIcon
          icon={SaveMoneyDollarFreeIcons}
          size={100}
          className="text-head"
        />
      ),
      title: "Accept Payments",
      description:
        "Enter the amount and share instantly accept COD only with international business.",
    },
    {
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} size={100} className="text-head" />
      ),
      title: "Split Revenue (SMEs)",
      description:
        "Payments are auto-distributed by Smart Contracts to partners accordingly business.",
    },
    {
      icon: (
        <HugeiconsIcon
          icon={UserSwitchFreeIcons}
          size={100}
          className="text-head"
        />
      ),
      title: "Swap",
      description:
        "Can swap blockchain.USDT, and E-NGN into business Value conversion efficiently.",
    },
  ];

  return (
    <section id="how-it-works" className=" section-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-custom-md text-head border-b-2 py-1 border-[#2F80ED] w-fit">
              How it works
            </h1>
            <h2 className="text-custom-3xl font-bold tracking-tight text-foreground">
              From Scan to Settlement, All in One Flow
            </h2>

            <p className="text-custom-sm text-muted-foreground leading-relaxed">
              Velo makes payments effortless for merchants and SMEs. From a
              quick QR scan to automated revenue split and transparent costs,
              every step is streamlined with blockchain security and
              transparency. No technical complexity, just simple and efficient
              transactions.
            </p>
          </div>

          {/* Right Content - Steps Grid */}
          <div className="grid grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-background rounded-xl w-full max-w-75  p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="space-y-4" dir="ltr">
                  <div className="bg-blue-primary rounded-lg flex items-center justify-center w-fit me-8">
                    {step.icon}
                  </div>


                  <p className="text-sm text-gray-text leading-relaxed py-2 border-b-2 border-border">
                    {step.description}
                  </p>

                  <h3 className="font-semibold text-muted-foreground  ">
                    {step.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
