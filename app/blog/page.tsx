import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { blogPosts } from '@/lib/blogPosts';

export default function ImprovedBlogPage() {
  return (
    <div className='min-h-screen bg-velo-hero text-white'>
      {/* Header */}
      <header className='border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <Link
            href='/'
            className='flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='text-sm font-medium'>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative py-16 overflow-hidden bg-velo-hero'>
        <div className='absolute inset-0' />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='text-5xl md:text-6xl font-bold mb-6'>
              VELO <span className='velo-text-gradient'>Blog</span>
            </h1>
            <p className='text-xl text-slate-400'>
              Latest news, updates, and insights from the world of fintech
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts - Hero Grid */}
      <section className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-6 md:grid-cols-2 mb-16'>
            {blogPosts.slice(0, 2).map((post) => (
              <article key={post.id} className='group'>
                <Link href={`/blog/${post.slug}`} className='block h-full'>
                  <div className='bg-velo-card rounded-xl card-border overflow-hidden hover:shadow-lg hover:border-primary/60 transition-all duration-300 h-full'>
                    <div className='relative h-64 overflow-hidden'>
                      <Image
                        src={post.image ?? '/images/placeholder.jpg'}
                        alt={post.title}
                        fill={false}
                        width={1200}
                        height={700}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
                      <div className='absolute top-4 left-4'>
                        <span className='velo-badge'>{post.category}</span>
                      </div>
                      <div className='absolute bottom-0 left-0 right-0 p-6'>
                        <h3 className='text-2xl font-bold text-card-foreground mb-2 line-clamp-2'>
                          {post.title}
                        </h3>
                        <p className='text-muted-foreground text-sm line-clamp-2'>
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Recent Posts Section */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-white'>Recent Posts</h2>
          </div>

          {/* Recent Posts Grid - Improved Cards */}
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {blogPosts.map((post) => (
              <article key={post.id} className='group'>
                <Link href={`/blog/${post.slug}`} className='block h-full'>
                  <div className='bg-velo-card rounded-xl card-border overflow-hidden hover:shadow hover:border-primary/60 transition-all duration-300 h-full flex flex-col'>
                    {/* Image Section */}
                    <div className='relative h-48 overflow-hidden'>
                      <Image
                        src={post.image ?? '/images/placeholder.jpg'}
                        alt={post.title}
                        width={1200}
                        height={700}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                      />
                      <div className='absolute top-4 left-4'>
                        <span className='velo-badge'>{post.category}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className='p-6 flex-1 flex flex-col'>
                      <h3 className='text-xl font-bold text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors'>
                        {post.title}
                      </h3>
                      <p className='text-muted-foreground text-sm mb-4 line-clamp-3 flex-1'>
                        {post.content}
                      </p>

                      {/* Metadata */}
                      <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-4 border-t border-border'>
                        <div className='flex items-center gap-1.5'>
                          <User className='h-3.5 w-3.5' />
                          <span>{post.author}</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Calendar className='h-3.5 w-3.5' />
                          <span>{post.date}</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Clock className='h-3.5 w-3.5' />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className='py-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='relative rounded-2xl p-12 text-center overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600' />
            <div className='relative z-10'>
              <h2 className='text-3xl md:text-4xl font-bold mb-4 text-white'>
                Stay Updated
              </h2>
              <p className='text-lg mb-8 text-white/90'>
                Subscribe to our newsletter for the latest fintech insights and
                VELO updates
              </p>
              <div className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'>
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50'
                />
                <button className='px-8 py-3 bg-white text-purple-600 hover:bg-slate-100 font-semibold rounded-lg transition-colors whitespace-nowrap'>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
