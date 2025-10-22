"use client"

import { useEffect, useRef, useState } from "react"

export function Trust() {
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

    const partners = ["Starknet", "Bitcoin", "Ethereum", "Polkadot", "USDT", "Stellar"]

    return (
        <section ref={sectionRef} className="py-16 border-y border-border/50 bg-muted/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p
                    className={`text-center text-lg font-medium text-foreground mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                        }`}
                >
                    100,000+ users and businesses have saved millions with VELO.
                </p>

                <div className="relative">
                    <div className="flex gap-12 animate-scroll">
                        {[...partners, ...partners].map((name, index) => (
                            <div
                                key={`${name}-${index}`}
                                className="flex-shrink-0 text-2xl font-bold text-muted-foreground/60 hover:text-foreground transition-colors"
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
