import { ArrowLeft, Calendar, Clock, User, Share2, Rocket } from "lucide-react"
import Link from "next/link"

export default function LaunchPost() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          {/* Hero Image */}
          <div className="mb-12 rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-blue-600 to-purple-600 h-96 flex items-center justify-center relative">
            <Rocket className="h-40 w-40 text-white opacity-30 absolute" />
            <div className="relative z-10 text-center text-white">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-4xl font-bold">VELO Launch</h2>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-blue-600/10 text-blue-400 text-sm font-semibold rounded-full border border-blue-600/20">
                Company
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              VELO Launch — 27 September
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>The VELO Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Sep 27, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>4 min read</span>
              </div>
              <button className="ml-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </header>

          {/* Article Body */}
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-xl text-slate-300 leading-relaxed mb-12">
              On 27 September we officially launched VELO — our platform for modern, low-cost payments that empowers businesses to accept and manage digital payments across chains and rails.
            </p>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">📦</span>
              What we shipped
            </h2>
            <div className="space-y-4 mb-12">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                <p className="text-lg text-slate-300 leading-relaxed">
                  <strong className="text-white">Core payments API</strong> with idempotent, tokenized flows.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                <p className="text-lg text-slate-300 leading-relaxed">
                  <strong className="text-white">Merchant dashboard</strong> for quick onboarding and monitoring.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                <p className="text-lg text-slate-300 leading-relaxed">
                  Support for <strong className="text-white">stable, low-cost fiat on/off ramps</strong> and existing card flows.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">🤝</span>
              Early traction and partners
            </h2>
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-8 mb-12">
              <p className="text-lg text-slate-300 leading-relaxed">
                Since launch we've onboarded several pilot partners across e-commerce and marketplaces. Early feedback highlights <strong className="text-white">reduced reconciliation time</strong> and noticeably <strong className="text-white">lower processing costs</strong>.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">🗺️</span>
              What's next
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-6">
              Our near-term roadmap focuses on:
            </p>
            <div className="grid gap-4 mb-12">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-600/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Deeper multi-chain wallet support
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-600/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Programmable payouts
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-pink-600/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Improved analytics for merchants
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="relative rounded-2xl overflow-hidden p-12 text-center my-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <span>✨</span>
                  Join us
                </h2>
                <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                  If you'd like to pilot VELO or integrate our APIs, reach out via support or sign up for early access on our homepage.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div className="border-t border-slate-800 pt-12 mt-16">
            <h3 className="text-2xl font-bold text-white mb-8">Related Articles</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <a href="#" className="group block bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-purple-600/10 text-purple-400 text-xs font-semibold rounded-full border border-purple-600/20 mb-3">
                    Integrations
                  </span>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    Integrating Stellar with VELO
                  </h4>
                  <p className="text-sm text-slate-400">
                    A practical guide to why we chose Stellar for fast, low-cost payments.
                  </p>
                </div>
              </a>
              <a href="#" className="group block bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-pink-600/10 text-pink-400 text-xs font-semibold rounded-full border border-pink-600/20 mb-3">
                    Engineering
                  </span>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    Polkadot Support: Design & Implementation
                  </h4>
                  <p className="text-sm text-slate-400">
                    How we implemented Polkadot support at VELO — architecture and examples.
                  </p>
                </div>
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}