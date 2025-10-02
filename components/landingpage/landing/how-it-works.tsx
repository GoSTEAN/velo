"use client"

import { Check } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "../../ui/buttons"
import Link from "next/link"


export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<"today" | "day5" | "day30">("today")
  const sectionRef = useRef<HTMLElement>(null)

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

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const timeline = {
    today: {
      title: "Get started.",
      items: [
        "Create your VELO wallet in one minute",
        "Generate your first QR code instantly",
        "Accept your first payment immediately",
      ],
    },
    day5: {
      title: "Get comfortable.",
      items: [
        "Set up payment splits for your team",
        "Connect to your business tools",
        "Configure automated distributions",
      ],
    },
    day30: {
      title: "Ask why you didn't switch years ago.",
      items: [
        "100% of business payments moved to VELO",
        "Revenue distribution 10x more efficient",
        "Transaction costs reduced by 75%",
      ],
    },
  }

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          <p className="text-muted-foreground text-lg">New payment solutions shouldn't take months to implement.</p>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Here's what you can get done with VELO in just 30 days.
          </h2>
          <Link href={"/dashboard"}>
            <Button size="lg" className="mt-6">
              Get Started with VELO
            </Button>
          </Link>
        </div>

        <div
          className={`max-w-4xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          {/* Tab buttons */}
          <div className="flex gap-2 mb-12 border-b border-border/50">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-6 py-4 text-lg font-semibold cursor-pointer relative ${activeTab === "today" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Today
              {activeTab === "today" && <div className="absolute duration-500 transition-all bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab("day5")}
              className={`px-6 py-4 text-lg font-semibold cursor-pointer duration-500 transition-colors relative ${activeTab === "day5" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Day 5{activeTab === "day5" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab("day30")}
              className={`px-6 py-4 text-lg font-semibold cursor-pointer transition-colors relative ${activeTab === "day30" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Day 30
              {activeTab === "day30" && <div className="absolute  bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          {/* Tab content */}
          <div className="bg-card border animate-in border-border/80 shadow translate rounded-2xl p-12">
            <h3 className="text-3xl font-bold mb-8">{timeline[activeTab].title}</h3>
            <ul className="space-y-4">
              {timeline[activeTab].items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
