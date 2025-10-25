"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, X} from "lucide-react"
import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/buttons"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const productsMenu = [
    {
        title: "Payment Processing",
        description: "Fast, secure payment processing for your business",
        href: "#features",
    },
    {
        title: "Virtual Cards",
        description: "Issue virtual cards instantly for online purchases",
        href: "#features",
    },
    {
        title: "Expense Management",
        description: "Track and manage expenses in real-time",
        href: "#features",
    },
    {
        title: "Analytics Dashboard",
        description: "Powerful insights into your financial data",
        href: "#features",
    },
]

const resourcesMenu = [
    {
        title: "Documentation",
        description: "Learn how to integrate VELO into your workflow",
        href: "/",
    },
    {
        title: "Blog",
        description: "Latest news, updates, and fintech insights",
        href: "/blog",
    },
    {
        title: "API Reference",
        description: "Complete API documentation for developers",
        href: "/",
    },
    {
        title: "Support Center",
        description: "Get help from our support team",
        href: "/contact",
    },
]

export function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])


    const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        e.preventDefault()
        const element = document.getElementById(hash.replace("#", ""))
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
            setMobileMenuOpen(false)
        }
    }

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg"
                    : "bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm",
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 z-10">
                        <div className={cn("text-2xl font-bold transition-all", scrolled ? "velo-logo-gradient" : "text-white")}>
                            VELO.
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {/* Products Mega Menu */}
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger
                                        className={cn(
                                            "text-sm font-medium transition-colors bg-transparent hover:bg-white/10",
                                            scrolled ? "text-foreground" : "text-white hover:text-white",
                                        )}
                                    >
                                        Products
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid gap-3 p-6 w-[500px] md:grid-cols-2">
                                            {productsMenu.map((item) => (
                                                <NavigationMenuLink key={item.title} asChild>
                                                    <a
                                                        href={item.href}
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                                                    >
                                                        <div className="text-sm font-medium leading-none group-hover:velo-text-gradient transition-all">
                                                            {item.title}
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </a>
                                                </NavigationMenuLink>
                                            ))}
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                {/* How It Works Link */}
                                <NavigationMenuItem>
                                    <a
                                        href="#how-it-works"
                                        onClick={(e) => handleHashClick(e, "#how-it-works")}
                                        className={cn(
                                            "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                                            scrolled ? "text-foreground hover:text-foreground" : "text-white hover:text-white",
                                        )}
                                    >
                                        How It Works
                                    </a>
                                </NavigationMenuItem>

                                {/* Resources Mega Menu */}
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger
                                        className={cn(
                                            "text-sm font-medium transition-colors bg-transparent hover:bg-white/10",
                                            scrolled ? "text-foreground" : "text-white hover:text-white",
                                        )}
                                    >
                                        Resources
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid gap-3 p-6 w-[500px] md:grid-cols-2">
                                            {resourcesMenu.map((item) => (
                                                <NavigationMenuLink key={item.title} asChild>
                                                    <Link
                                                        href={item.href}
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                                                    >
                                                        <div className="text-sm font-medium leading-none group-hover:velo-text-gradient transition-all">
                                                            {item.title}
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            ))}
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                {/* Pricing Link */}
                                <NavigationMenuItem>
                                    <Link
                                        href="/blog"
                                        className={cn(
                                            "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                                            scrolled ? "text-foreground hover:text-foreground" : "text-white hover:text-white",
                                        )}
                                    >
                                        blog
                                    </Link>
                                </NavigationMenuItem>
                                 <NavigationMenuItem>
                                    <Link
                                        href="/stats"
                                        className={cn(
                                            "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                                            scrolled ? "text-foreground hover:text-foreground" : "text-white hover:text-white",
                                        )}
                                    >
                                        Stats
                                    </Link>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        <Link href="/auth/login">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    scrolled ? " hover:bg-velo-gradient" : "text-white hover:bg-white/10 hover:text-white",
                                )}
                            >
                                Log in
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="velo-gradient text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={cn(
                            "md:hidden p-2 rounded-lg transition-colors",
                            scrolled ? "hover:bg-accent/20" : "text-white hover:bg-white/10",
                        )}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border/50 animate-in slide-in-from-top duration-300">
                    <div className="px-4 py-6 space-y-4">
                        {/* Products Section */}
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</div>
                            {productsMenu.map((item) => (
                                <a
                                    key={item.title}
                                    href={item.href}
                                    onClick={(e) => {
                                        handleHashClick(e, item.href)
                                        setMobileMenuOpen(false)
                                    }}
                                    className="block text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                                >
                                    {item.title}
                                </a>
                            ))}
                        </div>

                        {/* How It Works */}
                        <a
                            href="#how-it-works"
                            onClick={(e) => handleHashClick(e, "#how-it-works")}
                            className="block text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            How It Works
                        </a>

                        {/* Resources Section */}
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</div>
                            {resourcesMenu.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="block text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>

                        {/* Pricing */}
                        <Link
                            href="/pricing"
                            className="block text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Pricing
                        </Link>

                        <div className="pt-4 space-y-3 border-t border-border/50">
                            <ThemeToggle />
                            <Link href="/auth/login" className="block">
                                <Button variant="outline" className="w-full bg-transparent">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/auth/signup" className="block">
                                <Button className="w-full velo-gradient text-white">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
