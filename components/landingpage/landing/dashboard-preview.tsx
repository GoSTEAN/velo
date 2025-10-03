"use client"

import { useEffect, useRef, useState } from "react"

import { ArrowUpRight, ArrowDownLeft, Users, QrCode, TrendingUp, Eye } from "lucide-react"
import { Card } from "@/components/ui/cards"
import { Button } from "@/components/ui/buttons"
import Link from "next/link"
import Image from "next/image"


export function DashboardPreview() {
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
            className="py-24 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div
                    className={`text-center mb-20 space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    <h2 className="text-5xl md:text-6xl font-bold leading-tight">Your Financial Command Center</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Experience a powerful dashboard designed for modern finance. Track, manage, and optimize your payments in
                        real-time.
                    </p>
                </div>

                <div
                    className={`relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                        }`}
                    style={{
                        perspective: "2000px",
                    }}
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl opacity-50" />

                    <div
                        className="relative bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
                        style={{
                            transform: "rotateX(8deg) rotateY(-10deg)",
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {/* Dashboard header */}
                        <div className="bg-card border-b border-border/50 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl velo-gradient flex items-center justify-center">
                                    <Image
                                        src="/velo-og.png"
                                        alt="Velo Logo"
                                        width={120}
                                        height={120}
                                        className="rounded-lg"
                                    />
                                </div>
                                <span className="font-semibold text-lg">VELO Dashboard</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10" />
                            </div>
                        </div>

                        {/* Dashboard content */}
                        <div className="p-6 md:p-8 space-y-6">
                            {/* Stats grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: "Total Balance", value: "₦2.4M", change: "+12.5%", icon: Eye, positive: true },
                                    { label: "Transactions", value: "1,429", change: "+8.2%", icon: TrendingUp, positive: true },
                                    { label: "Active Splits", value: "12", change: "+3", icon: Users, positive: true },
                                    { label: "QR Payments", value: "284", change: "+15.3%", icon: QrCode, positive: true },
                                ].map((stat, i) => (
                                    <Card
                                        key={i}
                                        className={`p-4 transition-all duration-500 hover:shadow-lg ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                                            }`}
                                        style={{ transitionDelay: `${400 + i * 100}ms` }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                            <p className={`text-xs ${stat.positive ? "text-green-500" : "text-muted-foreground"}`}>
                                                {stat.change}
                                            </p>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div
                                className={`transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                                    }`}
                            >
                                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "QR Payment", icon: QrCode, color: "from-blue-500 to-blue-600" },
                                        { label: "Payment Split", icon: Users, color: "from-green-500 to-green-600" },
                                        { label: "Send Money", icon: ArrowUpRight, color: "from-purple-500 to-pink-500" },
                                        { label: "Receive Funds", icon: ArrowDownLeft, color: "from-indigo-500 to-blue-600" },
                                    ].map((action, i) => (
                                        <Card key={i} className="p-4 hover:shadow-lg transition-all cursor-pointer group">
                                            <div className="flex flex-col items-center gap-3 text-center">
                                                <div
                                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                                >
                                                    <action.icon className="h-6 w-6 text-white" />
                                                </div>
                                                <span className="text-sm font-medium">{action.label}</span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity & Wallet Overview */}
                            <div
                                className={`grid md:grid-cols-2 gap-6 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                                    }`}
                            >
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Recent Activity</h3>
                                        <Button variant="ghost" size="sm">
                                            View all
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Payment received", time: "2 hours ago", amount: "+₦125,000" },
                                            { label: "Split payment sent", time: "5 hours ago", amount: "-₦45,000" },
                                            { label: "QR code payment", time: "1 day ago", amount: "+₦89,500" },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary/10" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.label}</p>
                                                    <p className="text-xs text-muted-foreground">{item.time}</p>
                                                </div>
                                                <span
                                                    className={`text-sm font-semibold ${item.amount.startsWith("+") ? "text-green-500" : "text-muted-foreground"}`}
                                                >
                                                    {item.amount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Wallet Overview</h3>
                                        <Button variant="ghost" size="sm">
                                            Manage
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                                            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                                            <p className="text-3xl font-bold">₦2,435,890</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg bg-accent/50">
                                                <p className="text-xs text-muted-foreground">Pending</p>
                                                <p className="text-lg font-semibold">₦125,000</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-accent/50">
                                                <p className="text-xs text-muted-foreground">Reserved</p>
                                                <p className="text-lg font-semibold">₦50,000</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA below dashboard */}
                <div
                    className={`text-center mt-16 transition-all duration-700 delay-1200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    <Link href={"/dashboard"}>
                        <Button
                            size="lg"
                            className="velo-gradient text-white font-semibold shadow-xl hover:shadow-2xl text-lg px-8 py-6 cursor-pointer"
                        >
                            Try the Dashboard Now
                            <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
