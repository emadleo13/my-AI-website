'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/lib/i18n-routing';
import { TextHoverEffect, FooterBackgroundGradient } from '@/components/ui/hover-footer';
import { SERVICE_CATEGORIES } from '@/lib/services';

// 'services' is intentionally omitted here — it has its own dedicated column
// (the hover flyout) below, so listing it under Navigation too would duplicate it.
const NAV_LINKS = ['home', 'about', 'blog', 'contact'] as const;

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0f1a] relative rounded-3xl overflow-hidden mx-4 mb-4 mt-16 border border-white/10">
      <FooterBackgroundGradient />

      <div className="max-w-7xl mx-auto px-8 pt-14 pb-6 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8 pb-10">

          {/* Brand */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-dark.png" alt="EmadAI" width={80} height={80} className="object-contain" />
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

          {/* Services — hover the heading to reveal a flyout panel that opens to
              the side (absolutely positioned, so it overlays instead of pushing
              the footer taller). On mobile/touch (no hover) it renders inline. */}
          <div className="group relative">
            <Link
              href="/services"
              className="mb-5 flex items-center gap-1.5 text-white text-sm font-semibold uppercase tracking-widest hover:text-[#3ca2fa] transition-colors"
            >
              {t('nav.services')}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:-rotate-90 rtl:group-hover:rotate-90" />
            </Link>

            {/* Desktop: side flyout overlay (opens to the right via left-full). */}
            <div className="hidden lg:block pointer-events-none invisible opacity-0 translate-x-1 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto absolute top-0 left-full ml-4 z-50 w-[30rem] rounded-2xl border border-white/10 bg-[#0d0f1a]/95 backdrop-blur-md p-5 shadow-2xl">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {SERVICE_CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <Link
                      href={`/contact?service=${cat.key}`}
                      className="text-sm font-semibold text-white hover:text-[#3ca2fa] transition-colors"
                    >
                      {t(`services.categories.${cat.key}.title`)}
                    </Link>
                    <ul className="mt-1.5 space-y-1">
                      {cat.sub.map((s) => (
                        <li key={s}>
                          <Link
                            href={`/contact?service=${cat.key}`}
                            className="text-xs text-gray-400 hover:text-[#3ca2fa] transition-colors"
                          >
                            {t(`services.categories.${cat.key}.sub.${s}.title`)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile/touch: inline list (no hover available). */}
            <ul className="space-y-2.5 lg:hidden">
              {SERVICE_CATEGORIES.map((cat) => (
                <li key={cat.key}>
                  <Link
                    href={`/contact?service=${cat.key}`}
                    className="text-sm font-medium text-gray-300 hover:text-[#3ca2fa] transition-colors"
                  >
                    {t(`services.categories.${cat.key}.title`)}
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
                <a href="https://www.linkedin.com/in/emadleo13-b42882236" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#3ca2fa] transition-colors">
                  <Linkedin className="h-4 w-4" />
                  {t('footer.social.linkedin')}
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
            <a href="https://www.linkedin.com/in/emadleo13-b42882236" target="_blank" rel="noreferrer"
              aria-label="LinkedIn" className="hover:text-[#3ca2fa] transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          <p className="text-xs text-gray-500 text-center">
            © {year} EMAD AI Consultant. {t('footer.rights')}
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
          </div>
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
