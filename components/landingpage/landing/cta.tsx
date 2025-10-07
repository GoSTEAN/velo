"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/buttons"

export function CTA() {
  const [isVisible, setIsVisible] = useState(false)
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

  return (
    <section
      ref={sectionRef}
      className="py-32 md:py-40 relative overflow-hidden bg-gradient-to-b from-background to-primary/5"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div
          className={`space-y-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
          }`}
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Ready to save time and money?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join 100,000+ users already using VELO for seamless crypto payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="velo-gradient text-white font-semibold shadow-xl hover:shadow-2xl transition-all group text-lg px-8 py-6 cursor-pointer"
              >
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="font-semibold border-2 text-lg px-8 py-6 bg-transparent hover:bg-velo-gradient cursor-pointer">
                Talk to sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground pt-6">
            No credit card required • Free forever • Setup in minutes
          </p>
        </div>
      </div>
    </section>
  )
}
