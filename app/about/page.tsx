
import Footer from "@/components/landingpage/landing/Footer"
import { Navigation } from "@/components/landingpage/landing/navigation"
import { Target, Users, Zap, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
              About <span className="velo-text-gradient">VELO</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Simplifying crypto payments for Nigerian businesses. Accept crypto payments that feel as easy as cash.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16 space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              VELO is on a mission to make crypto payments accessible to every Nigerian business, regardless of size or
              technical expertise. We believe that the future of payments is decentralized, transparent, and instant.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              By leveraging Starknet's account abstraction technology, we've eliminated the complexity of blockchain
              transactions. No seed phrases, no gas fees, no technical knowledge required. Just simple, secure payments
              that work.
            </p>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Simplicity First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe powerful technology should be simple to use. Every feature is designed with the user in
                  mind.
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built for Nigerian businesses, by people who understand the local payment challenges.
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Speed & Efficiency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Instant settlements, real-time analytics, and automated processes save you time and money.
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Security & Trust</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bank-grade security with blockchain transparency. Your funds are always safe and verifiable.
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              VELO was born from a simple observation: Nigerian businesses struggle with traditional payment systems.
              High fees, slow settlements, and limited access to international payments hold businesses back.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We saw an opportunity to leverage blockchain technology to solve these problems. By building on Starknet
              and integrating with the Nigerian Naira Stablecoin, we created a payment solution that combines the best
              of both worlds: the speed and transparency of crypto with the familiarity of local currency.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Today, VELO serves merchants, SMEs, and customers across Nigeria, processing thousands of transactions and
              helping businesses grow without payment barriers.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
