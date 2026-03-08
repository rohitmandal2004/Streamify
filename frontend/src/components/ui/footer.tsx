// components/ui/footer.tsx

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Input } from './input';
import { Button } from './button';
// @ts-ignore
import logoImg from '../../assets/logo.png';

// Lucide-style SVG icons
const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
    </svg>
);

const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

/**
 * Streamify Footer – shadcn-styled, preserving all original information.
 */
export const Footer: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState('idle');

    const handleSubscribe = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);
        // Simulate subscription
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubscriptionStatus('success');
        setIsSubmitting(false);
        setEmail('');

        setTimeout(() => {
            setSubscriptionStatus('idle');
        }, 3000);
    };

    const socialLinks = [
        { label: 'LinkedIn', href: 'https://linkedin.com', icon: <LinkedInIcon /> },
        { label: 'GitHub', href: 'https://github.com/rohitmandal2004', icon: <GitHubIcon /> },
        { label: 'Instagram', href: 'https://www.instagram.com/i.am.rohit18/', icon: <InstagramIcon /> },
        { label: 'Facebook', href: 'https://facebook.com', icon: <FacebookIcon /> },
    ];

    const usefulLinks = [
        { label: 'Home', href: '/home' },
        { label: 'Start Meeting', href: '/auth' },
        { label: 'History', href: '/history' },
        { label: 'Privacy Policy', href: '#' },
    ];

    return (
        <footer className={cn('relative border-t border-white/10 bg-black/30 backdrop-blur-md text-white', className)} {...props}>
            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 px-4 py-12 sm:py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {/* Company Info */}
                <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                        <img src={logoImg} alt="Streamify Logo" className="h-10 w-10 rounded-xl object-cover" />
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200">
                            Streamify
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Connect Anyone. Anywhere. Experience ultra-low latency video calls with crystal clear audio.
                    </p>
                </div>

                {/* Useful Links */}
                <div className="md:justify-self-center">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Useful Links</h3>
                    <ul className="space-y-2">
                        {usefulLinks.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    className="text-sm text-gray-400 transition-colors hover:text-indigo-400"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact & Social */}
                <div className="md:justify-self-center">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
                    <ul className="space-y-3">
                        <li>
                            <a
                                href="mailto:rohitmandal0804@gmail.com"
                                className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-indigo-400"
                            >
                                <MailIcon />
                                <span className="break-all">rohitmandal0804@gmail.com</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="tel:+919378093270"
                                className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-indigo-400"
                            >
                                <PhoneIcon />
                                <span>+91 9378093270</span>
                            </a>
                        </li>
                    </ul>

                    <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-white">Follow Us</h3>
                    <div className="flex items-center gap-3">
                        {socialLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Subscribe to Newsletter</h3>
                    <p className="text-sm text-gray-400 mb-4">Stay updated with the latest features and releases.</p>
                    <form onSubmit={handleSubscribe} className="relative w-full max-w-sm">
                        <div className="relative">
                            <Input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting || subscriptionStatus !== 'idle'}
                                required
                                aria-label="Email for newsletter"
                                className="pr-28"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting || subscriptionStatus !== 'idle'}
                                className="absolute right-0 top-0 h-full rounded-l-none px-4"
                            >
                                {isSubmitting ? 'Sending...' : 'Subscribe'}
                            </Button>
                        </div>
                        {/* Status overlay */}
                        {(subscriptionStatus === 'success' || subscriptionStatus === 'error') && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/80 text-center backdrop-blur-sm">
                                {subscriptionStatus === 'success' ? (
                                    <span className="font-semibold text-green-400">Subscribed! 🎉</span>
                                ) : (
                                    <span className="font-semibold text-red-400">Failed. Try again.</span>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Bottom Copyright */}
            <div className="border-t border-white/5 py-6 text-center text-gray-500 text-xs">
                <p>© {new Date().getFullYear()} Streamify. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
