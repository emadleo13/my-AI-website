import './globals.css';

// The locale-specific layout in app/[locale]/layout.tsx provides <html> and <body>.
// This root layout exists only because Next.js requires one at the app/ level.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
