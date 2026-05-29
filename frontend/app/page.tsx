'use client';

import { useMemo, useState } from 'react';
import LanguageLanding from '../components/HackerTerminal/LanguageLanding';
import HackerTerminal from '../components/HackerTerminal/HackerTerminal';


export default function HomePage() {
  const [mode, setMode] = useState<'idle' | 'fa' | 'en'>('idle');
  const dir = mode === 'fa' ? 'rtl' : 'ltr';

  const langLabel = useMemo(() => {
    if (mode === 'fa') return 'فارسی';
    if (mode === 'en') return 'English';
    return '';
  }, [mode]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden" dir={dir}>
      {mode === 'idle' && <LanguageLanding onPick={(m) => setMode(m)} />}

      {mode !== 'idle' && <HackerTerminal languageLabel={langLabel} />}
    </div>
  );
}

