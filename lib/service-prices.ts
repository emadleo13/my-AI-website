export const SERVICE_PRICES: Record<string, number> = {
  ai:     49_00,
  agent:  49_00,
  career: 39_00,
  tech:   49_00,
};

// Scope-based pricing used when a specific engagement type is selected
export const SCOPE_PRICES: Record<string, number> = {
  session: 49_00,   // €49 — 1-2h focused session
  mini:    149_00,  // €149 — 1-2 week project
  full:    349_00,  // €349 — ongoing engagement
};

export const PACKAGE_PRICES: Record<string, { amount: number; name: string }> = {
  standard: { amount: 49_00,  name: 'Standard Package' },
  premium:  { amount: 149_00, name: 'Premium Package'  },
};
