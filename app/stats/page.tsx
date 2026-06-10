'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type DayRow = { date: string; completed: number; revised: number; flagged: number };

const RANGE_OPTIONS = [
  { label: '7d',  days: 7  },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 0  },
];

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Fill missing dates in range so the table has continuous rows including zeros.
function fillRange(rows: DayRow[], from: string, to: string): DayRow[] {
  const map = new Map(rows.map(r => [r.date, r]));
  const out: DayRow[] = [];
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const start = new Date(fy, fm - 1, fd);
  const end   = new Date(ty, tm - 1, td);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toLocalISODate(d);
    out.push(map.get(iso) ?? { date: iso, completed: 0, revised: 0, flagged: 0 });
  }
  return out;
}

export default function StatsPage() {
  const [rows, setRows] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let from: string | undefined;
    let to: string | undefined;
    if (rangeDays > 0) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (rangeDays - 1));
      from = toLocalISODate(start);
      to   = toLocalISODate(end);
    }
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to)   qs.set('to', to);
    fetch(`/api/events?${qs.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setRows([]);
        } else {
          const raw: DayRow[] = data.days || [];
          if (from && to) {
            setRows(fillRange(raw, from, to));
          } else if (raw.length > 0) {
            setRows(fillRange(raw, raw[0].date, raw[raw.length - 1].date));
          } else {
            setRows([]);
          }
        }
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [rangeDays]);

  const totals = useMemo(() => {
    const t = { completed: 0, revised: 0, flagged: 0, activeDays: 0 };
    for (const r of rows) {
      t.completed += r.completed;
      t.revised   += r.revised;
      t.flagged   += r.flagged;
      if (r.completed > 0 || r.revised > 0) t.activeDays++;
    }
    return t;
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Daily Activity</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Problems completed and revised per day</p>
            </div>
            <Link
              href="/"
              className="text-[11px] font-bold text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-slate-600 rounded-lg px-2.5 py-1 transition-colors shrink-0"
            >
              ← Back
            </Link>
          </div>

          {/* Range tabs */}
          <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-xl mb-4">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => setRangeDays(opt.days)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  rangeDays === opt.days ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: 'Completed', val: totals.completed, cls: 'text-emerald-400', bg: 'bg-emerald-950/40 border border-emerald-900/30' },
              { label: 'Revised',   val: totals.revised,   cls: 'text-indigo-300',  bg: 'bg-indigo-950/40 border border-indigo-900/30' },
              { label: 'Flagged',   val: totals.flagged,   cls: 'text-rose-400',    bg: 'bg-rose-950/30 border border-rose-900/20' },
              { label: 'Days',      val: totals.activeDays, cls: 'text-slate-300',  bg: 'bg-slate-800/60' },
            ].map(({ label, val, cls, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-2.5`}>
                <div className={`text-xl font-black ${cls}`}>{val}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-sm">
            Loading…
          </div>
        )}

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/40 rounded-xl p-4 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-14 text-center">
            <p className="text-slate-400 font-medium">No activity recorded yet.</p>
            <p className="text-slate-600 text-xs mt-2">
              Mark a problem solved or click <strong className="text-slate-400">Recalled ✓</strong> on the Calendar tab to start logging events.
            </p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <DailyTable rows={rows} />
        )}
      </div>
    </div>
  );
}

function DailyTable({ rows }: { rows: DayRow[] }) {
  // newest first; only days with any activity collapse onto the same view
  const sorted = useMemo(() => [...rows].sort((a, b) => b.date.localeCompare(a.date)), [rows]);
  const todayISO = toLocalISODate(new Date());

  const fmtCell = (n: number, accent: 'emerald' | 'indigo' | 'rose') => {
    if (n === 0) return <span className="text-slate-700">—</span>;
    const cls =
      accent === 'emerald' ? 'text-emerald-400' :
      accent === 'indigo'  ? 'text-indigo-300'  : 'text-rose-400';
    return <span className={`font-bold ${cls}`}>{n}</span>;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800">
        <div className="font-bold text-sm text-slate-100">Daily breakdown</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          {sorted.length} days · newest first
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wide text-slate-500 bg-slate-800/20">
            <tr>
              <th className="text-left  px-4 py-2 font-semibold">Date</th>
              <th className="text-left  px-2 py-2 font-semibold">Day</th>
              <th className="text-right px-3 py-2 font-semibold text-emerald-400/80">Completed</th>
              <th className="text-right px-3 py-2 font-semibold text-indigo-300/80">Revised</th>
              <th className="text-right px-3 py-2 font-semibold text-rose-400/80">Flagged</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => {
              const [y, m, d] = r.date.split('-').map(Number);
              const dt = new Date(y, m - 1, d);
              const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const isToday = r.date === todayISO;
              const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
              const empty = r.completed === 0 && r.revised === 0 && r.flagged === 0;
              return (
                <tr
                  key={r.date}
                  className={`border-t border-slate-800/40 transition-colors ${
                    isToday ? 'bg-emerald-950/20' : empty ? 'opacity-50 hover:opacity-100' : 'hover:bg-slate-800/20'
                  }`}
                >
                  <td className="px-4 py-2 font-mono text-slate-300 whitespace-nowrap">
                    {r.date}
                    {isToday && (
                      <span className="ml-2 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-1.5 py-0.5 rounded-full">
                        TODAY
                      </span>
                    )}
                  </td>
                  <td className={`px-2 py-2 text-xs ${isWeekend ? 'text-amber-500/80' : 'text-slate-500'}`}>
                    {DN[dt.getDay()]}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtCell(r.completed, 'emerald')}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtCell(r.revised, 'indigo')}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtCell(r.flagged, 'rose')}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-800/30 border-t border-slate-700/40 text-xs font-bold">
            <tr>
              <td className="px-4 py-2 text-slate-400" colSpan={2}>Total</td>
              <td className="px-3 py-2 text-right text-emerald-400 tabular-nums">
                {sorted.reduce((s, r) => s + r.completed, 0)}
              </td>
              <td className="px-3 py-2 text-right text-indigo-300 tabular-nums">
                {sorted.reduce((s, r) => s + r.revised, 0)}
              </td>
              <td className="px-3 py-2 text-right text-rose-400 tabular-nums">
                {sorted.reduce((s, r) => s + r.flagged, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
