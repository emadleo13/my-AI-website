'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Bot } from 'lucide-react';
import { DotMap } from '@/components/ui/dot-map';
import { SignInForm } from '@/components/forms/SignInForm';
import { SignUpForm } from '@/components/forms/SignUpForm';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { toast } from 'sonner';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.7h5.2c-.2 1.4-1.6 4.1-5.2 4.1-3.1 0-5.7-2.6-5.7-5.8s2.6-5.8 5.7-5.8c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.8 14.6 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c6.9 0 9.4-4.8 9.4-7.4 0-.5-.1-.9-.1-1.3L12 10.2z" />
    </svg>
  );
}

export function AuthTabs() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const params = useSearchParams();
  const next = params.get('next');
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  const handleGoogle = async () => {
    const supa = getSupabaseBrowser();
    if (!supa) { toast.error(t('errors.demo')); return; }
    const callback = new URL(`/${locale}/auth/callback`, window.location.origin);
    if (next) callback.searchParams.set('next', next);
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callback.toString() },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl flex bg-[#090b13] text-white shadow-2xl min-h-[600px]">

      {/* Left — DotMap */}
      <div className="hidden md:block w-1/2 relative border-r border-[#1f2130]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1120] to-[#151929]">
          <DotMap />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-5"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="text-white h-6 w-6" />
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500"
            >
              Emad AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm text-center text-gray-400 max-w-xs"
            >
              {t('signin.subtitle')}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-[#13151f] border border-[#2a2d3a] p-1 mb-8">
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                tab === 'signin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                tab === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('signUp')}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-1">
            {tab === 'signin' ? t('signin.title') : t('signup.title')}
          </h1>
          <p className="text-gray-400 mb-7 text-sm">
            {tab === 'signin' ? t('signin.subtitle') : t('signup.subtitle')}
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg p-3 hover:bg-[#1a1d2b] transition-all duration-300 mb-6"
          >
            <GoogleIcon />
            <span className="text-sm">{t('google')}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2d3a]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#090b13] text-gray-400">{t('or')}</span>
            </div>
          </div>

          {/* Forms — dark style overrides */}
          <div className="[&_label]:text-gray-300 [&_input]:bg-[#13151f] [&_input]:border-[#2a2d3a] [&_input]:text-gray-200 [&_input]:placeholder:text-gray-500 [&_input]:focus-visible:ring-blue-500 [&_a]:text-blue-400 [&_button[type=submit]]:bg-gradient-to-r [&_button[type=submit]]:from-blue-600 [&_button[type=submit]]:to-indigo-600 [&_button[type=submit]]:hover:from-blue-500 [&_button[type=submit]]:hover:to-indigo-500 [&_button[type=submit]]:border-0">
            {tab === 'signin' ? <SignInForm /> : <SignUpForm />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
