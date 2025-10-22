import { ArrowLeft, Calendar, Clock, User, Share2, Code, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PolkadotPost() {
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
          <div className="mb-12 rounded-2xl overflow-hidden border border-slate-800 h-96 flex items-center justify-center relative">
            <Image src="/polkadot1.png" alt="Polkadot" fill className="object-cover opacity-80" />
            {/* <div className="absolute inset-0 bg-gradient-to-br from-pink-600/40 to-purple-600/40" /> */}
            <div className="relative z-10 text-center text-white">
              {/* <svg viewBox="0 0 100 100" className="w-32 h-32 mb-4 mx-auto">
                <circle cx="50" cy="50" r="45" fill="white" opacity="0.9"/>
                <circle cx="50" cy="20" r="8" fill="#E6007A"/>
                <circle cx="80" cy="50" r="8" fill="#E6007A"/>
                <circle cx="50" cy="80" r="8" fill="#E6007A"/>
                <circle cx="20" cy="50" r="8" fill="#E6007A"/>
              </svg> */}
              {/* <h2 className="text-3xl font-bold">Polkadot</h2> */}
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-pink-600/10 text-pink-400 text-sm font-semibold rounded-full border border-pink-600/20">
                Engineering
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Polkadot Support: Design & Implementation
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Blockchain Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Oct 20, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>9 min read</span>
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
              Polkadot brings a powerful substrate-based multi-chain model. At VELO we implemented Polkadot support to enable parachain-native assets, cross-chain messaging, and more flexible settlement primitives.
            </p>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">🏗️</span>
              High-level architecture
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-6">
              We treat Polkadot as one of several settlement rails. Key components include:
            </p>
            <ul className="space-y-4 mb-12">
              <li className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-pink-400 mt-1 text-lg">•</span>
                  <span className="text-lg text-slate-300 leading-relaxed">
                    A substrate node client to observe events and finalize balances.
                  </span>
                </div>
              </li>
              <li className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-pink-400 mt-1 text-lg">•</span>
                  <span className="text-lg text-slate-300 leading-relaxed">
                    An off-chain worker layer to prepare and sign extrinsics (via polkadot-js).
                  </span>
                </div>
              </li>
              <li className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-pink-400 mt-1 text-lg">•</span>
                  <span className="text-lg text-slate-300 leading-relaxed">
                    A bridge layer for XCMP/HRMP routing when moving value across parachains.
                  </span>
                </div>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">📨</span>
              XCMP and messaging
            </h2>
            <div className="bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-600/20 rounded-xl p-8 mb-12">
              <p className="text-lg text-slate-300 leading-relaxed">
                Cross-chain messaging on Polkadot is powerful but introduces ordering and reorg complexity. We isolate message handlers, implement idempotency, and rely on finalization confirmations before marking customer balances as settled.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">👨‍💻</span>
              Developer example (polkadot-js)
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-6">
              Here's a tiny snippet showing how to submit a balance transfer using polkadot-js (high-level):
            </p>
            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mb-12">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-400 font-mono">polkadot-transfer.js</span>
                <Code className="h-4 w-4 text-slate-500" />
              </div>
              <pre className="p-6 overflow-x-auto">
                <code className="text-sm text-slate-300 font-mono leading-relaxed">
{`import { ApiPromise, WsProvider } from '@polkadot/api'

const provider = new WsProvider('wss://rpc.polkadot.io')
const api = await ApiPromise.create({ provider })
const transfer = api.tx.balances.transfer(destination, amount)
const hash = await transfer.signAndSend(signer)
console.log('Submitted with hash', hash.toHex())`}
                </code>
              </pre>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
              <span className="text-4xl">🔒</span>
              Security & testing
            </h2>
            <div className="grid gap-4 mb-12">
              <div className="bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-600/20 rounded-xl p-6 flex items-start gap-4">
                <Shield className="h-6 w-6 text-pink-400 flex-shrink-0 mt-1" />
                <p className="text-lg text-slate-300 leading-relaxed">
                  We thoroughly test cross-chain flows with mocks and testnets
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/20 rounded-xl p-6 flex items-start gap-4">
                <Shield className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                <p className="text-lg text-slate-300 leading-relaxed">
                  Enforce rate limits on signing endpoints
                </p>
              </div>
              <div className="bg-gradient-to-r from-pink-600/10 to-blue-600/10 border border-pink-600/20 rounded-xl p-6 flex items-start gap-4">
                <Shield className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-lg text-slate-300 leading-relaxed">
                  Use hardware security modules for production signing keys
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="relative rounded-2xl overflow-hidden p-12 text-center my-16">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-90" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <span>📝</span>
                  Summary
                </h2>
                <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                  Supporting Polkadot at VELO expanded our settlement options and unlocked on-chain features for parachain-native assets. The trade-offs require careful engineering — especially around messaging guarantees and finality handling.
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
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                    VELO Launch — 27 September
                  </h4>
                  <p className="text-sm text-slate-400">
                    We launched VELO on 27 September — here's what that means for our roadmap.
                  </p>
                </div>
              </a>
              <a href="#" className="group block bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-purple-600/10 text-purple-400 text-xs font-semibold rounded-full border border-purple-600/20 mb-3">
                    Integrations
                  </span>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                    Integrating Stellar with VELO
                  </h4>
                  <p className="text-sm text-slate-400">
                    A practical guide to why we chose Stellar for fast, low-cost payments.
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