import Footer from '@/components/landingpage/landing/Footer';
import { Navigation } from '@/components/landingpage/landing/navigation';
import { Button } from '@/components/ui/buttons';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { NewTwitterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import ContactForm from './contactForm';

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <main className='pt-24 pb-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Hero Section */}
          <div className='text-center mb-16 space-y-6'>
            <h1 className='text-5xl md:text-6xl font-bold tracking-tight text-balance'>
              Get in <span className='velo-text-gradient'>Touch</span>
            </h1>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto text-pretty'>
              Have questions? We&#39;re here to help. Reach out to us through
              any of these channels.
            </p>
          </div>

          {/* Contact Methods */}
          <div className='grid md:grid-cols-2 gap-6 mb-16'>
            <div className='bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all'>
              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4'>
                <Mail className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Email Us</h3>
              <p className='text-muted-foreground mb-4'>
                Send us an email and we&#39;ll respond within 24 hours.
              </p>
              <a
                href='mailto:partnership@connectvelo.com'
                className='text-primary hover:underline font-medium'
              >
                partnership@connectvelo.com
              </a>
            </div>

            <div className='bg-card border pointer-events-none opacity-50 border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all'>
              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4'>
                <MessageSquare className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Discord Community</h3>
              <p className='text-muted-foreground mb-4'>
                Join our community for instant support and discussions.
              </p>
              <a
                href='https://discord.gg/velo'
                className='text-primary  hover:underline font-medium'
              >
                Join Discord
              </a>
            </div>

            <div className='bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all'>
              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4'>
                <HugeiconsIcon icon={NewTwitterIcon} />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Twitter/X</h3>
              <p className='text-muted-foreground mb-4'>
                Follow us for updates and quick responses.
              </p>
              <a
                href='https://twitter.com/Connectvelo'
                className='text-primary hover:underline font-medium'
              >
                @Connectvelo
              </a>
            </div>

            <div className='bg-card pointer-events-none opacity-50  border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all'>
              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4'>
                <Send className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Telegram</h3>
              <p className='text-muted-foreground mb-4'>
                Chat with us directly on Telegram.
              </p>
              <Link
                href='/'
                className='text-primary hover:underline font-medium'
              >
                Join Telegram
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
