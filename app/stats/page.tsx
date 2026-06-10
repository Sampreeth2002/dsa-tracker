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

function formatShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${DN[dt.getDay()]} ${MN[dt.getMonth()]} ${dt.getDate()}`;
}

// Fill missing dates in range so the chart has continuous bars including zeros.
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

  const maxCompleted = Math.max(1, ...rows.map(r => r.completed));
  const maxRevised   = Math.max(1, ...rows.map(r => r.revised));

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
          <>
            {/* Completed per day */}
            <ChartCard
              title="Problems completed per day"
              subtitle="Counts each problem once per day where you marked it ✓ solved or ~ hint"
              accent="emerald"
              rows={rows}
              valueOf={r => r.completed}
              max={maxCompleted}
            />

            {/* Revised per day */}
            <ChartCard
              title="Problems revised per day"
              subtitle="Counts each problem once per day you clicked Recalled ✓"
              accent="indigo"
              rows={rows}
              valueOf={r => r.revised}
              max={maxRevised}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  accent,
  rows,
  valueOf,
  max,
}: {
  title: string;
  subtitle: string;
  accent: 'emerald' | 'indigo';
  rows: DayRow[];
  valueOf: (r: DayRow) => number;
  max: number;
}) {
  const accentClasses =
    accent === 'emerald'
      ? { bar: 'bg-emerald-500/80 hover:bg-emerald-400', border: 'border-emerald-900/30', header: 'text-emerald-300' }
      : { bar: 'bg-indigo-500/80 hover:bg-indigo-400',   border: 'border-indigo-900/30',  header: 'text-indigo-300' };

  return (
    <div className={`bg-slate-900/80 border ${accentClasses.border} rounded-xl overflow-hidden shadow-xl`}>
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800">
        <div className={`font-bold text-sm ${accentClasses.header}`}>{title}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{subtitle}</div>
      </div>

      {/* Bar chart */}
      <div className="p-4">
        <div className="flex items-end gap-1 h-40">
          {rows.map(r => {
            const v = valueOf(r);
            const h = max > 0 ? (v / max) * 100 : 0;
            return (
              <div key={r.date} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1 group">
                <span className="text-[9px] text-slate-500 group-hover:text-slate-200 font-mono leading-none h-3">
                  {v > 0 ? v : ''}
                </span>
                <div
                  title={`${formatShort(r.date)} · ${v}`}
                  className={`w-full rounded-t-sm transition-colors ${v > 0 ? accentClasses.bar : 'bg-slate-800/40'}`}
                  style={{ height: `${Math.max(h, v > 0 ? 4 : 2)}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels — sparse for readability */}
        <div className="flex gap-1 mt-2">
          {rows.map((r, i) => {
            const total = rows.length;
            const step = Math.max(1, Math.ceil(total / 10));
            const show = i === 0 || i === total - 1 || i % step === 0;
            const [, m, d] = r.date.split('-');
            return (
              <div key={r.date} className="flex-1 min-w-0 text-center">
                <span className="text-[8px] text-slate-600 font-mono">
                  {show ? `${Number(m)}/${Number(d)}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
