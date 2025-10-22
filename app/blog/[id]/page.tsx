import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { blogPosts } from "@/lib/blogPosts"

export default function BeautifiedBlogPost() {
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
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Image */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-blue-600 to-purple-600">
          <img 
            src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&h=480&fit=crop" 
            alt="VELO — Speed Without Limits" 
            className="w-full h-auto max-h-96 object-cover opacity-90 mix-blend-overlay"
          />
        </div>

        {/* Article Header */}
        <header className="mb-12">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-4 py-1.5 bg-blue-600/10 text-blue-400 text-sm font-semibold rounded-full border border-blue-600/20">
              Industry Insights
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            💎 Are You Tired of Wallet Seed Phrases and Juggling Apps? Meet VELO.
          </h1>

          {/* Meta Information */}
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
              <span>5 min read</span>
            </div>
            <button className="ml-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            Are you tired of writing down <strong className="text-white">12-word seed phrases</strong> every time you create a wallet? Tired of switching between multiple apps just to manage different tokens, send funds, or buy airtime?
          </p>

          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            We get it — crypto was supposed to make life easier, but for most people, it's still <strong className="text-white">too complicated</strong>.
          </p>

          <p className="text-lg text-slate-400 leading-relaxed mb-12">
            That's why we built <strong className="text-white">VELO</strong> — a new kind of payments platform designed to make <strong className="text-white">Web3 feel as simple as Web2</strong>.
          </p>

          {/* Section: What Is VELO */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              What Is VELO?
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-4">
              <strong className="text-white">VELO</strong> is a <strong className="text-white">smart payments platform</strong> that lets you send, receive, and spend digital money instantly — <strong className="text-white">without dealing with wallet complexities</strong>. It blends the convenience of everyday fintech apps with the power of blockchain technology.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              In short: VELO gives you <strong className="text-white">the speed of crypto</strong> and <strong className="text-white">the simplicity of mobile money</strong> — all in one place.
            </p>
          </div>

          {/* Section: The Problem */}
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 mt-12">
            <span className="text-4xl">🚫</span>
            The Problem
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-6">
            Let's face it — the current payment experience is broken.
          </p>
          <ul className="space-y-3 mb-12">
            <li className="text-lg text-slate-400 leading-relaxed flex items-start gap-3">
              <span className="text-blue-400 mt-1.5">•</span>
              <span>You need one app for your local currency.</span>
            </li>
            <li className="text-lg text-slate-400 leading-relaxed flex items-start gap-3">
              <span className="text-blue-400 mt-1.5">•</span>
              <span>Another app for your crypto wallet.</span>
            </li>
            <li className="text-lg text-slate-400 leading-relaxed flex items-start gap-3">
              <span className="text-blue-400 mt-1.5">•</span>
              <span>Yet another to buy airtime or pay bills. And if you ever lose your seed phrase… good luck getting your funds back.</span>
            </li>
          </ul>
          <p className="text-lg text-slate-400 leading-relaxed mb-12">
            This complexity keeps millions of people from fully participating in the digital economy.
          </p>

          {/* Section: The VELO Solution */}
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            The VELO Solution
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-6">
            VELO simplifies everything.
          </p>
          <div className="grid gap-4 mb-12">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-6">
              <p className="text-lg text-slate-300 leading-relaxed">
                No more <strong className="text-white">seed phrases</strong> — your wallet is smart, secure, and recoverable.
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/20 rounded-xl p-6">
              <p className="text-lg text-slate-300 leading-relaxed">
                No more <strong className="text-white">multiple apps</strong> — everything you need lives in one ecosystem.
              </p>
            </div>
            <div className="bg-gradient-to-r from-pink-600/10 to-blue-600/10 border border-pink-600/20 rounded-xl p-6">
              <p className="text-lg text-slate-300 leading-relaxed">
                No more <strong className="text-white">slow, expensive transfers</strong> — payments happen instantly, across borders.
              </p>
            </div>
          </div>
          <p className="text-lg text-slate-400 leading-relaxed mb-12">
            Under the hood, VELO uses <strong className="text-white">blockchain technology</strong> for trust and transparency. But you never have to see it. You just tap, send, and go.
          </p>

          {/* Section: Why It Matters */}
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">💸</span>
            Why It Matters
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-6">
            For the next billion users coming online, simplicity is everything. VELO is making Web3 accessible — turning complex crypto infrastructure into <strong className="text-white">a smooth, everyday payment experience</strong>.
          </p>
          <p className="text-lg text-slate-400 leading-relaxed mb-12">
            It's not just about wallets or tokens. It's about giving people <strong className="text-white">freedom to move money anywhere</strong>, without limits.
          </p>

          {/* Final CTA Section */}
          <div className="relative rounded-2xl overflow-hidden p-12 text-center my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <span>🚀</span>
                VELO — Speed Without Limits
              </h2>
              <p className="text-xl text-white/90 mb-2">
                Fast. Simple. Borderless.
              </p>
              <p className="text-xl text-white/90">
                That's the future of payments. That's <strong>VELO</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="border-t border-slate-800 pt-12 mt-16">
          <h3 className="text-2xl font-bold text-white mb-8">More from the blog</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts
              .filter((p) => p.id !== 1)
              .slice(0, 2)
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group block bg-velo-card rounded-xl card-border overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-6">
                    <span className="velo-badge mb-3 inline-block">{post.category}</span>
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-sm text-slate-400">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  )
}