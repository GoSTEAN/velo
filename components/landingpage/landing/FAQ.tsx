"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

export function FAQ() {
  const [isVisible, setIsVisible] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

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

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-16 space-y-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">Frequently asked questions</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about VELO. Can&#39;t find the answer you&#39;re looking for? Contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-accent/5 transition-colors"
              >
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-6 text-lg text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
