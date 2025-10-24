'use client';

import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/lib/blogPosts';
import { useRouter } from 'next/navigation';
import React from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

export default function BeautifiedBlogPost({ params }: Props) {
  const router = useRouter();
  const { slug } = React.use(params);

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-950 text-white'>
        <div className='max-w-xl text-center'>
          <h2 className='text-2xl font-bold mb-4'>Post not found</h2>
          <p className='mb-6 text-slate-400'>
            We couldn't find the blog post you're looking for.
          </p>
          <Link
            href='/blog'
            className='inline-flex items-center gap-2 px-4 py-2 bg-primary rounded text-white'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const related = [...blogPosts].filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className='min-h-screen bg-slate-950'>
      {/* Header */}
      <header className='border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <button
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push('/blog');
            }}
            className='flex items-center gap-2 text-slate-400 hover:text-white transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='text-sm font-medium'>Back to Blog</span>
          </button>
        </div>
      </header>

      {/* Article Content */}
      <article className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Hero Image */}
        {post.image && (
          <div className='mb-12 rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-blue-600 to-purple-600'>
            {/* Use Next.js Image for optimization; keep layout simple */}
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={480}
              className='w-full h-auto max-h-96 object-cover opacity-90 mix-blend-overlay'
            />
          </div>
        )}

        {/* Article Header */}
        <header className='mb-12'>
          {/* Category Badge */}
          <div className='mb-4'>
            <span className='inline-block px-4 py-1.5 bg-blue-600/10 text-blue-400 text-sm font-semibold rounded-full border border-blue-600/20'>
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight'>
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className='flex flex-wrap items-center gap-6 text-sm text-slate-400 pb-8 border-b border-slate-800'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              <span>{post.author ?? 'VELO Team'}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span>{post.date}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              <span>{post.readTime ?? '5 min read'}</span>
            </div>
            <button className='ml-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors'>
              <Share2 className='h-4 w-4' />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Article Body */}
        <div className='prose prose-invert prose-lg max-w-none'>
          <p className='text-lg text-slate-300 leading-relaxed mb-8'>
            {post.content}
          </p>
        </div>

        {/* Related Posts */}
        <div className='border-t border-slate-800 pt-12 mt-16'>
          <h3 className='text-2xl font-bold text-white mb-8'>
            More from the blog
          </h3>
          <div className='grid gap-6 md:grid-cols-2'>
            {related.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className='group block bg-velo-card rounded-xl card-border overflow-hidden hover:shadow-md transition-all'
              >
                <div className='p-6'>
                  <span className='velo-badge mb-3 inline-block'>
                    {post.category}
                  </span>
                  <h4 className='text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors'>
                    {post.title}
                  </h4>
                  <p className='text-sm text-slate-400'>{post.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
