'use client';

import { useTranslations } from 'next-intl';
import { Github, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/lib/i18n-routing';
import { TextHoverEffect, FooterBackgroundGradient } from '@/components/ui/hover-footer';

const NAV_LINKS = ['home', 'about', 'services', 'blog', 'consultant', 'booking', 'contact'] as const;

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0f1a] relative rounded-3xl overflow-hidden mx-4 mb-4 mt-16 border border-white/10">
      <FooterBackgroundGradient />

      <div className="max-w-7xl mx-auto px-8 pt-14 pb-6 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 pb-10">

          {/* Brand */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/BLUE AI.png" alt="Emad AI" width={80} height={95} className="object-contain" />
            </Link>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 uppercase tracking-widest">
              {t('footer.links.navigation')}
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((key) => (
                <li key={key}>
                  <Link
                    href={key === 'home' ? '/' : `/${key}`}
                    className="text-sm text-gray-400 hover:text-[#3ca2fa] transition-colors"
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 uppercase tracking-widest">
              {t('footer.links.social')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/emadleo13" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#3ca2fa] transition-colors">
                  <Github className="h-4 w-4" />
                  {t('footer.social.github')}
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#3ca2fa] transition-colors">
                  <Linkedin className="h-4 w-4" />
                  {t('footer.social.linkedin')}
                </a>
              </li>
              <li>
                <a href="https://x.com" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#3ca2fa] transition-colors">
                  <Twitter className="h-4 w-4" />
                  {t('footer.social.twitter')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 uppercase tracking-widest">
              {t('contact.title')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#3ca2fa] flex-shrink-0" />
                <a href="mailto:hamidleo1984@gmail.com"
                  className="text-sm text-gray-400 hover:text-[#3ca2fa] transition-colors break-all">
                  hamidleo1984@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#3ca2fa] flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  {t('contact.info.locationValue')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar — social + copyright above the text effect */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pb-4">
          <div className="flex gap-5 text-gray-500">
            <a href="https://github.com/emadleo13" target="_blank" rel="noreferrer"
              aria-label="GitHub" className="hover:text-[#3ca2fa] transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"
              aria-label="LinkedIn" className="hover:text-[#3ca2fa] transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer"
              aria-label="Twitter" className="hover:text-[#3ca2fa] transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
          <p className="text-xs text-gray-500 text-center">
            © {year} EMAD AI Consultant. {t('footer.rights')}
          </p>
        </div>

        <hr className="border-t border-gray-600/60" />
      </div>

      {/* Text hover effect — smaller */}
      <div className="lg:flex hidden h-[18rem] -mb-16 z-10 relative">
        <TextHoverEffect text="EMAD AI" />
      </div>
    </footer>
  );
}
