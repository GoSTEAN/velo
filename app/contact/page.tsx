
import Footer from "@/components/landingpage/landing/Footer"
import { Navigation } from "@/components/landingpage/landing/navigation"
import { Button } from "@/components/ui/buttons"
import { Mail, MessageSquare, Send } from "lucide-react"
import {
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";


export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
              Get in <span className="velo-text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Have questions? We&#39;re here to help. Reach out to us through any of these channels.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">Send us an email and we&#39;ll respond within 24 hours.</p>
              <a href="mailto:support@velo.app" className="text-primary hover:underline font-medium">
                support@velo.app
              </a>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discord Community</h3>
              <p className="text-muted-foreground mb-4">Join our community for instant support and discussions.</p>
              <a href="https://discord.gg/velo" className="text-primary hover:underline font-medium">
                Join Discord
              </a>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <HugeiconsIcon icon={NewTwitterIcon} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Twitter/X</h3>
              <p className="text-muted-foreground mb-4">Follow us for updates and quick responses.</p>
              <a href="https://twitter.com/velo" className="text-primary hover:underline font-medium">
                @velo
              </a>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Telegram</h3>
              <p className="text-muted-foreground mb-4">Chat with us directly on Telegram.</p>
              <Link href="/" className="text-primary hover:underline font-medium">
                @velo
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              <Button className="w-full velo-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
