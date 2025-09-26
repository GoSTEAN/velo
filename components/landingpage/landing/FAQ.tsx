"use client";

import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
export default function Faq() {
  const faqs = [
    {
      question: "Do I need blockchain experience to use Velo?",
      answer:
        "Nope! Velo uses Starknet’s account abstraction, so you can sign up using just your email or social account — no seed phrase, no gas fees, no crypto knowledge needed.",
    },
    {
      question: "How do I accept payments as a merchant?",
      answer:
        "Just generate a QR code inside the app by entering the amount and choosing your currency (USDC, USDT, or STRK). Customers scan and pay directly from their wallets.",
    },
    {
      question: "Can I withdraw in Naira (NGN)?",
      answer:
        "Yes. After receiving crypto, you can request a withdrawal in NGN. For the demo, it’s simulated with fixed conversion rates, but real off-ramping will be integrated in production.",
    },
    {
      question: "What is payment splitting?",
      answer:
        "Payment splitting allows SMEs to automatically divide received payments among multiple wallets. Great for teams, cooperatives, or vendors with revenue sharing.",
    },
    {
      question: "What fees does Velo charge?",
      answer:
        "A 0.5% transaction fee is taken from merchant payments. This helps cover operational costs and keeps the platform running smoothly.",
    },
    {
      question: "Is it possible to accept payments without internet?",
      answer:
        "Yes, customers can scan QR codes offline and their wallet will process the payment once it reconnects to the internet. Perfect for low-connectivity areas.",
    },
  ];
  const [index, setIndex] = useState(0);
  const itemsPerPage = 2;

  const next = () => {
    if (index + itemsPerPage < faqs.length) {
      setIndex(index + itemsPerPage);
    }
  };

  const prev = () => {
    if (index - itemsPerPage >= 0) {
      setIndex(index - itemsPerPage);
    }
  };

  const currentFaqs = faqs.slice(index, index + itemsPerPage);

  return (
    <section
      id="faq"
      className="relative w-full  justify-center h-auto flex flex-col items-center "
    >
      <div className="flex flex-col z-10 gap-[16px] space-y-12  overflow-hidden relative">
        <div className="flex flex-col lg:flex-row w-full items-start justufy-between space-x-20">
          <h1 className=" text-custom-3xl font-[600] text-foreground ">
            Have any Questions? We’ve Got Your Answers{" "}
          </h1>
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-center space-x-20 transition-transform duration-500">
          {currentFaqs.map((faq, index) => (
            <div
              key={index}
              className="flex flex-col  w-full items-start justufy-between space-x-20"
              style={{ width: "100%" }}
            >
              <h1 className="text-custom-md text-foreground font-[600]">
                {faq.question}
              </h1>
              <p className="text-custom-sm py-[10px] font-[400] text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        <div className="w-full justify-end space-x-8   flex items-center pb-5 pr-5">
          <Button
            onClick={prev}
            type="button"
            
            className="rounded-full"
            size="xs"
            disabled={index === 0}
          >
            <ArrowLeft size={30} />
          </Button>
          <Button
          variant="secondary"
            onClick={next}
            type="button"
            size="xs"
            className="rounded-full"
            disabled={index + itemsPerPage >= faqs.length}
              
          >
            <ArrowRight size={30} />
          </Button>
        </div>
      </div>
    </section>
  );
}
