import React from 'react';
import { motion } from 'framer-motion';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import Logo from './Logo';

const Footer = () => {
  const socialLinks = [
    { icon: LinkedInIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: GitHubIcon, href: 'https://github.com', label: 'GitHub' },
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' }
  ];

  const contactInfo = {
    name: 'Rohit',
    email: 'rohitmandal0804@gmail.com',
    phone: '+91 9378093270'
  };

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-gradient-to-b from-transparent to-black/20 backdrop-blur-sm">
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          {/* Left - Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <Logo size="md" clickable={true} />
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect Anyone. Anywhere.
            </p>
          </motion.div>

          {/* Center - Contact Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">
              Contact
            </h3>
            <div className="space-y-3">
              <motion.a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors group"
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <PersonIcon className="text-sm" />
                </div>
                <span className="text-sm">{contactInfo.name}</span>
              </motion.a>
              
              <motion.a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors group"
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <EmailIcon className="text-sm" />
                </div>
                <span className="text-sm break-all">{contactInfo.email}</span>
              </motion.a>
              
              <motion.a
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors group"
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <PhoneIcon className="text-sm" />
                </div>
                <span className="text-sm">{contactInfo.phone}</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Right - Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">
              Connect
            </h3>
            <div className="flex items-center gap-3 sm:gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group touch-manipulation"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="text-base sm:text-lg group-hover:scale-110 transition-transform" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 pt-8 border-t border-white/5 text-center text-gray-500 text-xs"
        >
          <p>© {new Date().getFullYear()} Streamify. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

