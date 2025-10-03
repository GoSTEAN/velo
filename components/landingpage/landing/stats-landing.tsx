"use client"

import { useEffect, useRef, useState } from "react"
import { Users, TrendingUp, Shield } from "lucide-react"

export function Stats() {
    const [isVisible, setIsVisible] = useState(false)
    const [counts, setCounts] = useState({ users: 0, processed: 0, uptime: 0 })
    const sectionRef = useRef<HTMLDivElement>(null)

    const stats = [
        { value: "100k+", label: "Active Users", icon: Users, target: 100, suffix: "k+", key: "users" as const },
        {
            value: "₦2.5B+",
            label: "Processed",
            icon: TrendingUp,
            target: 2.5,
            prefix: "₦",
            suffix: "B+",
            key: "processed" as const,
        },
        { value: "99.9%", label: "Uptime", icon: Shield, target: 99.9, suffix: "%", key: "uptime" as const },
    ]

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    const duration = 2000
                    const steps = 60
                    const interval = duration / steps

                    stats.forEach((stat) => {
                        let current = 0
                        const increment = stat.target / steps
                        const timer = setInterval(() => {
                            current += increment
                            if (current >= stat.target) {
                                current = stat.target
                                clearInterval(timer)
                            }
                            setCounts((prev) => ({
                                ...prev,
                                [stat.key]: current,
                            }))
                        }, interval)
                    })
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
        <section ref={sectionRef} className="py-20 md:py-32 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`space-y-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                                }`}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl velo-gradient">
                                <stat.icon className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-5xl font-bold velo-text-gradient">
                                {stat.prefix}
                                {stat.key === "users" && Math.round(counts.users || 0)}
                                {stat.key === "processed" && (counts.processed || 0).toFixed(1)}
                                {stat.key === "uptime" && (counts.uptime || 0).toFixed(1)}
                                {stat.suffix}
                            </div>
                            <div className="text-lg text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
