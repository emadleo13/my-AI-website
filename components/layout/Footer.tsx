import { useTranslations } from 'next-intl';
import { Github, Linkedin, Twitter, Sparkles } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background/40 mt-24">
      <div className="container py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>{t('common.brand')}</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            {t('footer.tagline')}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm">
            {t('footer.links.navigation')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(['home', 'about', 'services', 'blog', 'consultant', 'booking', 'contact'] as const).map(
              (key) => (
                <li key={key}>
                  <Link
                    href={key === 'home' ? '/' : `/${key}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm">{t('footer.links.social')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
                {t('footer.social.github')}
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
                {t('footer.social.linkedin')}
              </a>
            </li>
            <li>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
                {t('footer.social.twitter')}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4">
        <p className="container text-xs text-muted-foreground text-center">
          © {year} {t('common.brand')}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
