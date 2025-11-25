"use client"


import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Exchange03Icon, QrCodeIcon, SaveMoneyDollarIcon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { ArrowRight } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"


export function Features() {
  const [isVisible, setIsVisible] = useState(false)
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

  const features = [
    {
      icon: QrCodeIcon,
      title: "QR Code Payments",
      description:
        "Accept USDC, USDT and E-NGN with a single QR code. Seamless transactions, paying where bank cards.",
      link: "#",
    },
    {
      icon: UserGroupIcon,
      title: "Smart Payment Splits",
      description:
        "Easily share revenue among team members or business partners with automated distribution.",
      link: "#",
    },
    // {
    //   icon: Exchange03Icon,
    //   title: "Swap",
    //   description:
    //     "Convert between USDC and E-NGN via Nigerian Naira Stablecoin instantly.",
    //   link: "#",
    // },
    {
      icon: SaveMoneyDollarIcon,
      title: "Full Transparency",
      description:
        "Track every transaction with real-time fee analysis, costs, and Naira value.",
      link: "#",
    },
  ]


  return (
    <section id="features" ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-2xl mb-20 space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          <div className="inline-block">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              VELO Product Suite
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">Get to know VELO</h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Replace multiple broken tools with VELO, the only platform designed to make payments faster—and simpler.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              href={feature.link}
              className={`group relative bg-card border border-border/80 rounded-2xl p-8 hover:bg-accent/5 transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              style={{
                transitionDelay: isVisible ? `${index * 50}ms` : "0ms",
              }}
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HugeiconsIcon icon={feature.icon} size={100} className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
                <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
