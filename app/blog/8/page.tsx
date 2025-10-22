import { ArrowLeft, Calendar, Clock, User, Share2, Network } from "lucide-react"
import Link from "next/link"

export default function StellarPost() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Blog</span>
          </button>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          {/* Hero Image */}
          <div className="mb-12 rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-purple-600 to-blue-600 h-96 flex items-center justify-center relative">
            <Network className="h-40 w-40 text-white opacity-30 absolute" />
            <div className="relative z-10 text-center text-white">
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-4xl font-bold">Stellar Network</h2>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-purple-600/10 text-purple-400 text-sm font-semibold rounded-full border border-purple-600/20">
                Integrations
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Integrating Stellar with VELO
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Oct 10, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>7 min read</span>
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
              We chose Stellar for specific use-cases: predictable transaction pricing, sub-second finality for simple payments, and mature anchors for fiat rails. In this post we'll explain why Stellar fits into VELO's architecture and provide a high-level integration guide.
            </p>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">🎯</span>
              Why Stellar?
            </h2>
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 rounded-xl p-8 mb-12">
              <p className="text-lg text-slate-300 leading-relaxed">
                Stellar's consensus and fee model make it ideal for <strong className="text-white">micropayments</strong> and <strong className="text-white">frequent settlement flows</strong>. Anchors translate on-chain balances to fiat rails, which simplifies on/off ramp integrations.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">⚙️</span>
              How we use it at VELO
            </h2>
            <div className="space-y-4 mb-12">
              <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Settlement layer for specific corridors where Stellar anchors are available.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Tokenized representations for stable assets and partner-issued tokens.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Off-chain order book + on-chain settlement hybrid for cost efficiency.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">✅</span>
              Quick integration notes
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-6">
              For teams integrating Stellar with VELO or using Stellar directly, here's a minimal checklist:
            </p>
            <ul className="space-y-4 mb-12">
              <li className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1 text-lg">•</span>
                  <span className="text-lg text-slate-300 leading-relaxed">
                    Use the Stellar SDK (js-stellar-sdk) to build and sign transactions server-side.
                  </span>
                </div>
              </li>
              <li className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1 text-lg">•</span>
                  <span className="text-lg text-slate-300 leading-relaxed">
                    Design idempotent payment endpoints: store transaction hashes and reconcile using horizon queries.
                  </span>
                </div>
              </li>
              <li className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1 text-lg">•</span>
                  <span className="text-lg text-slate-300 leading-relaxed">
                    Use anchors' webhooks to observe inbound/outbound fiat movements and reconcile with on-chain events.
                  </span>
                </div>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">🔄</span>
              Sample flow (high level)
            </h2>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-slate-300 text-base">User initiates payment via VELO API</p>
                  </div>
                </div>
                <div className="ml-5 border-l-2 border-slate-700 h-6"></div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-slate-300 text-base">VELO constructs a Stellar payment transaction</p>
                  </div>
                </div>
                <div className="ml-5 border-l-2 border-slate-700 h-6"></div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-slate-300 text-base">Sign and submit to Horizon</p>
                  </div>
                </div>
                <div className="ml-5 border-l-2 border-slate-700 h-6"></div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-slate-300 text-base">Listen for successful ledger inclusion and notify merchant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="relative rounded-2xl overflow-hidden p-12 text-center my-16">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-90" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <span>💡</span>
                  Takeaways
                </h2>
                <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                  Stellar is a pragmatic choice for fast, cheap settlements in corridors where anchors provide liquidity. For teams evaluating Stellar: focus on robust reconciliation and anchor integration to avoid edge-case failures.
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
                  <span className="inline-block px-3 py-1 bg-blue-600/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-600/20 mb-3">
                    Company
                  </span>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    VELO Launch — 27 September
                  </h4>
                  <p className="text-sm text-slate-400">
                    We launched VELO on 27 September — here's what that means for our roadmap.
                  </p>
                </div>
              </a>
              <a href="#" className="group block bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-pink-600/10 text-pink-400 text-xs font-semibold rounded-full border border-pink-600/20 mb-3">
                    Engineering
                  </span>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
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