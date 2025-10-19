"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Zap, BarChart3 } from "lucide-react"
import Link from "next/link"

export function ValueProposition() {
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

  const values = [
    {
      title: "Payments that enforce themselves.",
      description:
        "Accept crypto payments with built-in controls. Set limits, automate splits, and stop unauthorized transactions before they happen.",
      icon: Shield,
      link: "#",
      linkText: "Payment security",
    },
    {
      title: "Real-time checks are done for you.",
      description:
        "VELO monitors transactions 24/7 to catch errors, verify amounts, and ensure compliance with your business rules automatically.",
      icon: Zap,
      link: "#",
      linkText: "Smart monitoring",
    },
    {
      title: "Leave the busywork to us.",
      description:
        "Keep everyone focused on growth while VELO automates payment splits, reconciliation, reporting, and more.",
      icon: BarChart3,
      link: "#",
      linkText: "Automation features",
    },
  ]

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-3xl mb-20 space-y-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Three ways we save your business both time and money.
          </h2>
          <p className="text-lg text-muted-foreground">there are many more, but we thought we&#39;d ease you into it.</p>
          <Link href="#" className="inline-flex items-center text-primary hover:underline font-medium">
            Learn more about savings →
          </Link>
        </div>

        <div className="space-y-24">
          {values.map((item, index) => (
            <div
              key={item.title}
              className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 200}ms` : "0ms",
              }}
            >
              {/* Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-4xl font-bold leading-tight">{item.title}</h3>
                <p className="text-xl text-muted-foreground leading-relaxed">{item.description}</p>
                <Link href={item.link} className="inline-flex items-center text-primary hover:underline font-medium">
                  {item.linkText} →
                </Link>
              </div>

              {/* mockup/video */}
              <div className={`${index % 2 === 1 ? "md:order-1" : ""}`}>
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border/80  flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <item.icon className="h-16 w-16 text-primary/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">Coming Soon...</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
