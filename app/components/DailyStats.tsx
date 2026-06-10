'use client';
import { useEffect, useMemo, useState } from 'react';
import { PROBLEM_SCHEDULE } from '../lib/schedule';

type DayRow = { date: string; completed: number; revised: number; flagged: number };

// Mirror of SR_STAGES in app/page.tsx. If you change one, change both.
const SR_INTERVAL_DAYS = [1, 3, 7, 14, 30];

type ProgressState = {
  status: Record<string, string>;
  updatedAt: Record<string, string>;
  reviewCount: Record<string, number>;
};

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

export default function DailyStats() {
  const [rows, setRows] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState(30);
  const [progress, setProgress] = useState<ProgressState>({ status: {}, updatedAt: {}, reviewCount: {} });

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then(data => {
        if (data && data.status) {
          setProgress({
            status: data.status || {},
            updatedAt: data.updatedAt || {},
            reviewCount: data.reviewCount || {},
          });
        }
      })
      .catch(() => {});
  }, []);

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

  const backlog = useMemo(() => {
    const todayISO = toLocalISODate(new Date());
    let complete = 0;
    let revise = 0;
    for (const [pid, scheduledISO] of Object.entries(PROBLEM_SCHEDULE)) {
      if (scheduledISO < todayISO) {
        const st = progress.status[pid];
        if (st !== 'solved' && st !== 'hint') complete++;
      }
    }
    for (const [pid, st] of Object.entries(progress.status)) {
      if (st !== 'solved' && st !== 'hint') continue;
      const stage = progress.reviewCount[pid] ?? 0;
      if (stage >= SR_INTERVAL_DAYS.length) continue;
      const ua = progress.updatedAt[pid];
      if (!ua) continue;
      const last = new Date(ua);
      const due = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      due.setDate(due.getDate() + SR_INTERVAL_DAYS[stage]);
      if (toLocalISODate(due) < todayISO) revise++;
    }
    return { complete, revise };
  }, [progress]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-lg font-black text-white tracking-tight">Daily Activity</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Problems completed and revised per day</p>
        </div>

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

        <div className="grid grid-cols-2 gap-2 text-center text-xs mb-2">
          <div className="bg-rose-950/40 border border-rose-900/40 rounded-xl p-2.5">
            <div className="text-xl font-black text-rose-300">{backlog.complete}</div>
            <div className="text-[10px] text-rose-400/70 uppercase font-semibold tracking-wide">
              Backlog · to complete
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">scheduled before today, not yet solved</div>
          </div>
          <div className="bg-amber-950/30 border border-amber-900/30 rounded-xl p-2.5">
            <div className="text-xl font-black text-amber-300">{backlog.revise}</div>
            <div className="text-[10px] text-amber-400/70 uppercase font-semibold tracking-wide">
              Backlog · to revise
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">spaced reviews due before today</div>
          </div>
        </div>

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
          <DailyChart rows={rows} />
          <DailyTable rows={rows} />
        </>
      )}
    </div>
  );
}

function DailyChart({ rows }: { rows: DayRow[] }) {
  const chrono = useMemo(() => [...rows].sort((a, b) => a.date.localeCompare(b.date)), [rows]);
  const todayISO = toLocalISODate(new Date());
  const total = chrono.length;
  const xLabelStep = Math.max(1, Math.ceil(total / 10));

  const W = 800;
  const H = 220;
  const PAD_L = 32;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 24;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const dataMax = Math.max(1, ...chrono.map(r => Math.max(r.completed, r.revised)));
  const yMax = niceCeil(dataMax);
  const yTicks = buildYTicks(yMax);

  const x = (i: number) =>
    total <= 1 ? PAD_L + innerW / 2 : PAD_L + (i / (total - 1)) * innerW;
  const y = (v: number) => PAD_T + innerH - (v / yMax) * innerH;

  const completedPath = buildLinePath(chrono.map((r, i) => [x(i), y(r.completed)]));
  const revisedPath   = buildLinePath(chrono.map((r, i) => [x(i), y(r.revised)]));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-bold text-sm text-slate-100">Activity chart</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Lines: completed and revised per day
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 inline-block" /> Revised
          </span>
        </div>
      </div>

      <div className="p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-56"
          role="img"
          aria-label="Daily completed and revised line chart"
        >
          {yTicks.map(t => {
            const yy = y(t);
            return (
              <g key={t}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={yy}
                  y2={yy}
                  stroke="rgb(51 65 85 / 0.4)"
                  strokeDasharray="2 3"
                />
                <text
                  x={PAD_L - 6}
                  y={yy}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="rgb(100 116 139)"
                  fontFamily="ui-monospace, monospace"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {(() => {
            const todayIdx = chrono.findIndex(r => r.date === todayISO);
            if (todayIdx === -1) return null;
            const tx = x(todayIdx);
            return (
              <line
                x1={tx}
                x2={tx}
                y1={PAD_T}
                y2={H - PAD_B}
                stroke="rgb(52 211 153 / 0.35)"
                strokeDasharray="3 3"
              />
            );
          })()}

          <path d={revisedPath} fill="none" stroke="rgb(129 140 248)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <path d={completedPath} fill="none" stroke="rgb(52 211 153)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {chrono.map((r, i) => {
            const cx = x(i);
            const isToday = r.date === todayISO;
            return (
              <g key={r.date}>
                {r.revised > 0 && (
                  <circle
                    cx={cx}
                    cy={y(r.revised)}
                    r={isToday ? 3.5 : 2.5}
                    fill="rgb(129 140 248)"
                    stroke={isToday ? 'white' : 'rgb(15 23 42)'}
                    strokeWidth={isToday ? 1.2 : 1}
                  />
                )}
                {r.completed > 0 && (
                  <circle
                    cx={cx}
                    cy={y(r.completed)}
                    r={isToday ? 3.5 : 2.5}
                    fill="rgb(52 211 153)"
                    stroke={isToday ? 'white' : 'rgb(15 23 42)'}
                    strokeWidth={isToday ? 1.2 : 1}
                  />
                )}
                <rect
                  x={cx - 8}
                  y={PAD_T}
                  width={16}
                  height={innerH}
                  fill="transparent"
                >
                  <title>{`${r.date}\nCompleted: ${r.completed}\nRevised: ${r.revised}`}</title>
                </rect>
              </g>
            );
          })}

          {chrono.map((r, i) => {
            const show = i === 0 || i === total - 1 || i % xLabelStep === 0;
            if (!show) return null;
            const [, m, d] = r.date.split('-');
            const isToday = r.date === todayISO;
            return (
              <text
                key={r.date}
                x={x(i)}
                y={H - 6}
                textAnchor="middle"
                fontSize="10"
                fill={isToday ? 'rgb(52 211 153)' : 'rgb(100 116 139)'}
                fontWeight={isToday ? 700 : 400}
                fontFamily="ui-monospace, monospace"
              >
                {Number(m)}/{Number(d)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function niceCeil(n: number): number {
  if (n <= 1) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const norm = n / base;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * base;
}

function buildYTicks(max: number): number[] {
  const steps = max <= 5 ? max : max <= 10 ? 5 : 4;
  const out: number[] = [];
  for (let i = 0; i <= steps; i++) out.push(Math.round((max * i) / steps));
  return Array.from(new Set(out));
}

function buildLinePath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';
  return points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`).join(' ');
}

function DailyTable({ rows }: { rows: DayRow[] }) {
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
