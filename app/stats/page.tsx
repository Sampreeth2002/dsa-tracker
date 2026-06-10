'use client';
import Link from 'next/link';
import DailyStats from '../components/DailyStats';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-white tracking-tight">Daily Activity</h1>
          <Link
            href="/"
            className="text-[11px] font-bold text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-slate-600 rounded-lg px-2.5 py-1 transition-colors shrink-0"
          >
            ← Back
          </Link>
        </div>
        <DailyStats />
      </div>
    </div>
  );
}
