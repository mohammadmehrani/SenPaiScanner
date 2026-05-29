'use client';

export default function LanguageLanding({
  onPick
}: {
  onPick: (m: 'fa' | 'en') => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-cyan-200/90 tracking-widest text-xs uppercase mb-5">
          SenPaiScanner // Hacker Terminal
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-cyan-100 drop-shadow mb-10">
          Enter the Node Matrix
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-10 py-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20 transition"
            onClick={() => onPick('fa')}
          >
            فارسی
          </button>

          <button
            className="px-10 py-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20 transition"
            onClick={() => onPick('en')}
          >
            English
          </button>
        </div>

        <div className="mt-10 text-cyan-200/70 text-sm">
          Local-first UI — no external server processing.
        </div>
      </div>
    </div>
  );
}

