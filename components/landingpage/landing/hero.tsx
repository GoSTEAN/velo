"use client"

import { Button } from "@/components/ui/buttons"
import { ArrowRight, ChevronDown, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export function Hero() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen font-sans flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              <span className="text-sm font-medium">Trusted by 100,000+ users worldwide</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Payments made{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                simple.
              </span>
              <br />
              Finance made{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                powerful.
              </span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
              Send, receive, and split payments instantly. Accept crypto that feels as easy as cash. All in one
              platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <Link href={"/dashboard"}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 h-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-auto">
            {/* Glow effect behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-3xl opacity-60 animate-pulse" />

            {/* 3D perspective container */}
            <div className="relative perspective-1000">
              <div className="transform rotate-y-12 rotate-x-2 transition-transform duration-500 hover:rotate-y-6">
                {/* Dashboard mockup */}
                <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Browser chrome */}
                  <div className="bg-slate-800/50 border-b border-white/10 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 mx-4 px-3 py-1 bg-slate-900/50 rounded text-xs text-slate-400 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>https://www.connectvelo.com/dashboard</span>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Image
                            src="/velo-og.png"
                            alt="Velo Logo"
                            width={120}
                            height={120}
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">VELO Dashboard</p>
                          <p className="text-xs text-slate-400">Welcome back</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Total Balance", value: "₦245,000", trend: "+12.5%" },
                        { label: "Transactions", value: "1,429", trend: "+8.2%" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                          <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                          <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
                          <p className="text-xs text-green-400">{stat.trend}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart placeholder with animation */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <div className="flex items-end justify-between h-32 gap-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end">
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t animate-grow"
                              style={{
                                height: `${height}%`,
                                animationDelay: `${i * 100}ms`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={scrollToFeatures}
            className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            aria-label="Scroll to features"
          >
            <span className="text-sm font-medium">Explore Features</span>
            <ChevronDown className="h-6 w-6 animate-bounce group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-12 {
          transform: rotateY(-12deg) rotateX(5deg);
        }
        .rotate-y-6 {
          transform: rotateY(-6deg) rotateX(3deg);
        }
        @keyframes grow {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }
        .animate-grow {
          animation: grow 0.6s ease-out forwards;
          transform-origin: bottom;
        }
      `}</style>
    </section>
  )
}