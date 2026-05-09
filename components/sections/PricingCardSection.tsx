"use client";

import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/ui/pricing-card';

export function PricingCardSection() {
  const router = useRouter();

  return (
    <PricingCard
      title="Premium Plan"
      description="Your dedicated AI partner — ongoing strategy, implementation, and support."
      price={500}
      originalPrice={800}
      features={[
        {
          title: "Consulting & Strategy",
          items: [
            "Weekly working sessions",
            "AI adoption roadmap",
            "Build vs buy analysis",
            "Quarterly roadmap review",
          ],
        },
        {
          title: "Implementation & Support",
          items: [
            "Architecture & code reviews",
            "Dedicated Slack channel",
            "Priority response",
            "Evals & monitoring",
          ],
        },
      ]}
      buttonText="Book Intro Call"
      onButtonClick={() => router.push('/booking')}
    />
  );
}
