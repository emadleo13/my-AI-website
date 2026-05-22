import { useTranslations } from 'next-intl';
import { MARKETPLACE_SERVICES } from '@/lib/marketplace-services';
import { ServiceToolCard } from './ServiceToolCard';

export function MarketplaceGrid() {
  const t = useTranslations('marketplace');

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {MARKETPLACE_SERVICES.map((service) => (
        <ServiceToolCard
          key={service.key}
          service={service}
          title={t(`services.${service.key}.title`)}
          description={t(`services.${service.key}.desc`)}
          bullets={[
            t(`services.${service.key}.bullet1`),
            t(`services.${service.key}.bullet2`),
            t(`services.${service.key}.bullet3`),
          ]}
          freeLabel={t(`services.${service.key}.freeDemo`)}
          ctaLabel={t('cta.tryFree')}
        />
      ))}
    </div>
  );
}
