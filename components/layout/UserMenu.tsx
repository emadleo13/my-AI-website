'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Link, useRouter } from '@/lib/i18n-routing';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ProfileMeta {
  full_name: string | null;
  avatar_url: string | null;
}

export function UserMenu() {
  const t = useTranslations('nav');
  const router = useRouter();
  const supa = getSupabaseBrowser();
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<ProfileMeta | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!supa) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const loadProfile = async (uid: string) => {
      const { data } = await supa
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', uid)
        .maybeSingle();
      if (!cancelled) setProfile((data as ProfileMeta | null) ?? null);
    };

    supa.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user);
      setReady(true);
      if (data.user) void loadProfile(data.user.id);
    });

    const {
      data: { subscription },
    } = supa.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) void loadProfile(u.id);
      else setProfile(null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supa]);

  if (!ready) return null;

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <Link href="/auth">{t('auth')}</Link>
      </Button>
    );
  }

  const name =
    profile?.full_name?.trim() ||
    user.email?.split('@')[0] ||
    'You';
  const initial = name.slice(0, 1).toUpperCase();

  const handleSignOut = async () => {
    if (!supa) return;
    await supa.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-border bg-muted text-xs font-medium transition hover:ring-2 hover:ring-primary/40"
          aria-label={name}
        >
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={cn(
          'z-50 min-w-[200px] rounded-md border border-border bg-popover p-1 text-sm shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 h-px bg-border" />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-accent/15"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {t('dashboard')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/admin"
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-accent/15"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('admin')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 h-px bg-border" />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-accent/15"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

