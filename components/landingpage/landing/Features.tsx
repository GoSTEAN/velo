import { HugeiconsIcon } from "@hugeicons/react";
import {
  SaveMoneyDollarIcon,
  UserGroupIcon,
  Exchange03Icon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/Card";

const Features = () => {
  const features = [
    {
      id: 1,
      icon: (
        <HugeiconsIcon icon={QrCodeIcon} size={100} className="text-head" />
      ),
      title: "QR Code Payments",
      description:
        "Accept USDC, USDT and E-NGN with a single QR code. Seamless transactions, paying where bank cards.",
    },
    {
      id: 2,
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} size={100} className="text-head" />
      ),
      title: "Smart Payment Splits",
      description:
        "Easily share revenue among team members or business partners with automated distribution.",
    },
    {
      id: 3,
      icon: (
        <HugeiconsIcon icon={Exchange03Icon} size={100} className="text-head" />
      ),
      title: "Swap",
      description:
        "Convert between USDC and E-NGN via Nigerian Naira Stablecoin instantly.",
    },
    {
      id: 4,
      icon: (
        <HugeiconsIcon
          icon={SaveMoneyDollarIcon}
          size={100}
          className="text-head"
        />
      ),
      title: "Full Transparency",
      description:
        "Track every transaction with real-time fee analysis, costs, and Naira value.",
    },
  ];
  return (
    <section id="features" className=" section-blur w-full flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="w-full">
          <h1 className="text-custom-md text-head border-b-2 py-1 border-[#2F80ED] w-fit">
            Features
          </h1>
        </div>
        <div className="w-full text-foreground text-custom-lg">
          Payments Made Simple, Secure, and Local.
        </div>
      </div>

      <div className="w-full flex flex-col  gap-1">
        <div className="w-full flex flex-col md:flex-row gap-10 ">
          <div className="w-full text-muted-foreground text-custom-sm">
            Velo empowers Nigerian merchants and SMEs to accept crypto payments
            that feel as easy as cash.
            <br />
            <br />
            With QR-based payments, automated revenue splits, and transparent
            NGN equivalents, businesses can focus on growth while we handle the
            complexity of blockchain behind the scenes.
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-1">
            {features
              ?.filter((item) => item.id < 3)
              .map((item) => (
                <Card
                  key={item.id}
                  className="max-w-75 shadow-md min-h-87 w-full flex-col p-8 gap-7 rounded-md bg-background"
                  dir="ltr"
                >
                  <div className="me-8">{item.icon}</div>
                  <h1 className="text-custom-lg text-foreground ">
                    {item.title}
                  </h1>
                  <p className="text-custom-sm text-muted-foreground">
                    {item.description}
                  </p>
                </Card>
              ))}
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-1 lg:justify-center">
          {features
            ?.filter((item) => item.id > 2)
            .map((item) => (
              <Card
                key={item.id}
                className="max-w-75 min-h-87 shadow-md w-full flex flex-col p-8 gap-7 rounded-md bg-background"
                dir="ltr"
              >
                <div className="me-8">{item.icon}</div>
                <h1 className="text-custom-lg text-foreground ">
                  {item.title}
                </h1>
                <p className="text-custom-sm text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
