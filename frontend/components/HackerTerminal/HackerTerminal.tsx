'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import BackgroundMatrix from './BackgroundMatrix';
import Terminal from './Terminal';

export default function HackerTerminal({ languageLabel }: { languageLabel: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const termRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initial cinematic intro
    if (!termRef.current) return;
    gsap.fromTo(
      termRef.current,
      { opacity: 0, y: 20, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }
    );
  }, []);

  const helpText = useMemo(() => {
    if (languageLabel === 'فارسی') {
      return [
        'help — نمایش دستورات',
        'start quick — شروع اسکن سریع',
        'start custom — شروع اسکن سفارشی',
        'cancel — لغو اسکن'
      ];
    }
    return [
      'help — list available commands',
      'start quick — start quick scan',
      'start custom — start custom scan',
      'cancel — cancel scan'
    ];
  }, [languageLabel]);

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundMatrix />

      <div className="relative z-10 flex items-center justify-center px-4 pt-16">
        <div ref={termRef} className="w-full max-w-5xl">
          <Terminal
            languageLabel={languageLabel}
            helpText={helpText}
            running={running}
            onAppend={(line) => {
              setLogs((prev) => [...prev, line]);
            }}
            logs={logs}
            onRun={() => setRunning(true)}
            onCancel={() => setRunning(false)}
          />
        </div>
      </div>
    </div>
  );
}

