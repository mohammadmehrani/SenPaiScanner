'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

declare global {
  interface Window {
    scannerAPI?: {
      start: (payload: { binaryPath: string; args: string[] }) => Promise<{ ok: boolean }>;
      cancel: () => Promise<{ ok: boolean }>;
      onStdout: (cb: (chunk: string) => void) => void;
      onStderr: (cb: (chunk: string) => void) => void;
      onExit: (cb: (data: { code: number }) => void) => void;
    };
  }
}

export default function Terminal({
  languageLabel,
  helpText,
  running,
  onAppend,
  logs,
  onRun,
  onCancel
}: {
  languageLabel: string;
  helpText: string[];
  running: boolean;
  onAppend: (line: string) => void;
  logs: string[];
  onRun: () => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState('help');
  const outEl = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    gsap.to(cursorRef.current, {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.9,
      ease: 'power1.inOut'
    });
  }, []);

  useEffect(() => {
    if (!outEl.current) return;
    outEl.current.scrollTop = outEl.current.scrollHeight;
  }, [logs]);

  // Stream backend output from Electron -> terminal logs.
  useEffect(() => {
    if (!window.scannerAPI || startedRef.current) return;
    startedRef.current = true;

    let stdoutBuf = '';
    let stderrBuf = '';

    const handleLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Backend may already print formatted text.
      if (trimmed.startsWith('[') || trimmed.includes('ALIVE') || trimmed.includes('SCANNING') || trimmed.includes('[RESULT]')) {
        onAppend(trimmed);
        return;
      }

      // JSONL fallback: parse {type,message,result}
      try {
        const obj = JSON.parse(trimmed);
        if (obj.type === 'log' && typeof obj.message === 'string') {
          onAppend(obj.message);
          return;
        }
        if (obj.type === 'error' && typeof obj.message === 'string') {
          onAppend(`[ERROR] ${obj.message}`);
          return;
        }
        if (obj.type === 'result' && obj.result?.ip) {
          const r = obj.result;
          const ip = r.ip;
          const colo = r.colo || '';
          const avg = r.avg_ms ?? r.avg_ms_ms ?? '';
          const loss = r.loss_pct ?? '';
          const dl = r.throughput_kbps ?? r.download_kbps ?? '';
          onAppend(`[RESULT] ${ip} colo=${colo} avg=${avg}ms loss=${loss}% dl=${dl}kbps`);
          return;
        }
      } catch {
        // ignore parse errors
      }

      onAppend(trimmed);
    };

    window.scannerAPI.onStdout((chunk) => {
      stdoutBuf += chunk;
      let idx;
      while ((idx = stdoutBuf.indexOf('\n')) !== -1) {
        const line = stdoutBuf.slice(0, idx);
        stdoutBuf = stdoutBuf.slice(idx + 1);
        handleLine(line);
      }
    });

    window.scannerAPI.onStderr((chunk) => {
      stderrBuf += chunk;
      let idx;
      while ((idx = stderrBuf.indexOf('\n')) !== -1) {
        const line = stderrBuf.slice(0, idx);
        stderrBuf = stderrBuf.slice(idx + 1);
        const t = line.trim();
        if (t) onAppend(`[STDERR] ${t}`);
      }
    });

    window.scannerAPI.onExit((data) => {
      onAppend(`[DONE] scanner exited code=${data.code}`);
      onCancel();
    });
  }, [onAppend, onCancel]);

  const helpString = useMemo(() => helpText.join('\n'), [helpText]);

  function printPrompt() {
    onAppend(`${languageLabel === 'فارسی' ? 'دستور' : 'command'}: ${input}`);
  }

  async function handleCommand(cmdRaw: string) {
    const cmd = cmdRaw.trim();
    if (!cmd) return;

    if (cmd === 'help') {
      onAppend('');
      helpText.forEach((l) => onAppend(l));
      onAppend('');
      return;
    }

    if (!window.scannerAPI) {
      onAppend('[ERROR] scannerAPI not available. Run inside Electron desktop app.');
      return;
    }

    if (cmd.startsWith('start')) {
      const mode = cmd.includes('custom') ? 'custom' : 'quick';
      onRun();
      printPrompt();

      const binaryPath = 'senpaiscanner';
      const args = ['--jsonl-server', `-mode=${mode}`];

      onAppend(`[BOOT] ${mode.toUpperCase()} scan requested`);
      try {
        await window.scannerAPI.start({ binaryPath, args });
      } catch (e: any) {
        onAppend(`[ERROR] start failed: ${e?.message ?? String(e)}`);
        onCancel();
      }
      return;
    }

    if (cmd === 'cancel') {
      onCancel();
      printPrompt();
      try {
        await window.scannerAPI?.cancel();
      } catch {}
      onAppend('[CANCEL] scan cancelled by user');
      return;
    }

    onAppend(`Unknown command: ${cmd}`);
  }

  function submit() {
    const cmd = input;
    setInput('');
    void handleCommand(cmd);
    setInput('help');
  }

  return (
    <div className="relative">
      <div className="rounded-2xl border border-cyan-400/20 bg-black/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-cyan-400/10 flex items-center justify-between">
          <div className="text-cyan-100 font-semibold">SenPaiScanner // Hacker Terminal</div>
          <div className="text-cyan-200/80 text-xs">{running ? 'LIVE' : 'IDLE'} • {languageLabel}</div>
        </div>

        <div ref={outEl} className="h-[520px] overflow-auto px-5 py-4 font-mono text-[13px] text-cyan-100/90">
          {logs.length === 0 ? (
            <div className="text-cyan-200/70">
              Type <span className="text-cyan-100">help</span> and press Enter.
            </div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {l}
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-cyan-400/10 flex items-center gap-3">
          <span className="text-cyan-100/90">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-cyan-100 placeholder:text-cyan-100/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Escape' && running) {
                void handleCommand('cancel');
              }
            }}
            placeholder="help"
          />
          <span ref={cursorRef} className="text-cyan-200/80">▍</span>
        </div>
      </div>
    </div>
  );
}

