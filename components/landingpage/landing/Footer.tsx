import { HugeiconsIcon } from '@hugeicons/react';
import { NewTwitterIcon } from '@hugeicons/core-free-icons';
import { Mail } from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/buttons';

export const Footer = () => {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'FAQs', href: '#faq' },
        { name: 'Contacts', href: '/contact' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
                
        { name: 'Careers', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '#privacy' },
        { name: ' Terms of Service', href: '#terms' },
        { name: 'Security', href: '#' },
      ],
    },
  ];

  const socials = [
    {
      name: 'X',
      icon: <HugeiconsIcon icon={NewTwitterIcon} />,
      link: 'https://www.x.com',
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      link: 'mailto:partnership@connectvelo.com',
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" opacity="0.06"/>
          <path d="M6.94 9.5H4.5V19H6.94V9.5ZM5.72 8.24C6.5 8.24 7.06 7.67 7.06 6.95C7.06 6.24 6.5 5.67 5.72 5.67C4.94 5.67 4.38 6.24 4.38 6.95C4.38 7.67 4.94 8.24 5.72 8.24ZM19 19H16.56V13.25C16.56 11.9 15.93 10.98 14.72 10.98C13.86 10.98 13.34 11.49 13.12 11.98C13.04 12.15 13.02 12.45 13.02 12.75V19H10.58V9.5H13.02V10.54C13.5 9.8 14.48 9 15.98 9C17.9 9 19 10.28 19 12.7V19Z" fill="currentColor"/>
        </svg>
      ),
      link: 'https://www.linkedin.com/in/velo-connect/',
    },
  ];

  return (
    <footer className='border-t border-border/50 bg-muted/30'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid md:grid-cols-4 gap-8 mb-8'>
          <div className='space-y-4'>
            <Button className='text-2xl font-bold velo-logo-gradient'>
              <Link href='#hero'>VELO.</Link>
            </Button>
            <p className='text-sm text-muted-foreground'>
              Fast, secure, and borderless payments for Nigerian businesses.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className='font-semibold mb-4'>{section.title}</h4>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='hover:text-foreground transition-colors'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className='pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-muted-foreground'>
            © 2025 VELO. All rights reserved.
          </p>
          <div className='flex items-center gap-4'>
            {socials.map((social, index) => (
              <Link
                key={index}
                href={social.link}
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                <span className='sr-only'>{social.name}</span>
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
