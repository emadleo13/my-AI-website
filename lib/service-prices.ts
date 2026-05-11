export const SERVICE_PRICES: Record<string, number> = {
  ai:     200_00,
  agent:  200_00,
  career: 200_00,
  tech:   200_00,
};

export const PACKAGE_PRICES: Record<string, { amount: number; name: string }> = {
  standard: { amount: 200_00, name: 'Standard Package' },
  premium:  { amount: 500_00, name: 'Premium Package'  },
};
