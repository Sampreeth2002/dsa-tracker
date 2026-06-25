'use client';
import { useState, useEffect, useMemo } from 'react';
import DailyStats from './components/DailyStats';
import { dataset, type Problem } from './lib/dataset';

// Best-effort fire-and-forget event log; failures don't block UI.
function logEvent(problemId: string, eventType: string, eventDate?: string) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, eventType, eventDate }),
  }).catch(() => {});
}

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const revisionNotes: Record<string, string> = {
  "Fri, Jun 5": "🔁 Revision (1h): DP Intro — Fibonacci, Climbing Stairs, Frog Jump (re-derive recurrences)",
  "Sat, Jun 6": "🔁 Revision (3h): Full DP recap — House Robber, Grid DP, Subset Sum, 0/1 Knapsack, Coin Change (re-solve 3 weakest)",
  "Sun, Jun 7": "🔁 Revision (3h): DP Strings + Stocks + LIS — re-solve LCS, Edit Distance, Best Time IV, LIS optimal",
  "Mon, Jun 8": "🔁 Revision (1h): DP on Stocks (Buy/Sell I–IV) — re-derive states",
  "Tue, Jun 9": "🔁 Revision (1h): DP on LIS — print LIS, longest bitonic, longest string chain",
  "Wed, Jun 10": "🔁 Revision (1h): MCM / Partition DP — re-solve Burst Balloons + Palindrome Part II",
  "Thu, Jun 11": "🔁 Revision (1h): DP on Squares + Egg Drop + Job Scheduling",
  "Fri, Jun 12": "🔁 Revision (1h): Tries — re-implement Trie I + XOR Max + Distinct Substrings",
  "Sat, Jun 13": "🔁 Revision (3h): Graph BFS/DFS — re-solve Islands, Rotten Oranges, Bipartite, Topo Sort",
  "Sun, Jun 14": "🔁 Revision (3h): Shortest Path — Dijkstra, Bellman-Ford, Floyd Warshall, Cheapest Flights",
  "Mon, Jun 15": "🔁 Revision (1h): MST + DSU — Prim, Kruskal, Network Connected, Accounts Merge",
  "Tue, Jun 16": "🔁 Revision (1h): Graph Hard — Bridges, Articulation Points, Kosaraju",
  "Wed, Jun 17": "🔁 Revision (1h): Graph traversal — Word Ladder I/II, Number of Distinct Islands",
  "Thu, Jun 18": "🔁 Revision (1h): BT Traversals — pre/in/post (rec + iter) + Morris",
  "Fri, Jun 19": "🔁 Revision (1h): BT Medium — LCA, Diameter, Max Path Sum, Boundary",
  "Sat, Jun 20": "🔁 Revision (3h): BT Hard — Serialize/Deserialize, Flatten, Construct BT (Pre+In, Post+In)",
  "Sun, Jun 21": "🔁 Revision (3h): BST — Validate, LCA, Kth Smallest, BST Iterator, Largest BST in BT",
  "Mon, Jun 22": "🔁 Revision (1h): Adv Strings — KMP, Z-algo, Rabin-Karp templates",
  "Tue, Jun 23": "🔁 Revision (1h): Stack basics — Implement Stack/Queue Arrays + LL + Balanced Parens",
  "Wed, Jun 24": "🔁 Revision (1h): Expression conversions (all 6) — drill once",
  "Thu, Jun 25": "🔁 Revision (1h): NGE family — re-solve NGE I/II + Next Smaller + Trapping Rain Water",
  "Fri, Jun 26": "🔁 Revision (1h): Stack hard — Stock Span, Asteroid, Largest Rect Histogram",
  "Sat, Jun 27": "🔁 Revision (3h): Stack Hard + Cache — Largest Rect, Sliding Window Max, LRU, LFU",
  "Sun, Jun 28": "🔁 Revision (3h): BT + BST full sweep — re-solve 5 weakest from views/LCA/BST iterator",
  "Mon, Jun 29": "🔁 Revision (1h): Heaps medium — Kth Largest, Sort K Sorted, Merge K Sorted",
  "Tue, Jun 30": "🔁 Revision (1h): Heaps hard — Median Stream, Top K Freq, Task Scheduler",
  "Wed, Jul 1": "🔁 Revision (1h): Recursion patterns — pick/not-pick, subset generation",
  "Thu, Jul 2": "🔁 Revision (1h): Combination Sum I/II/III, Subset Sum I/II",
  "Fri, Jul 3": "🔁 Revision (1h): Backtracking templates — N-Queens, Sudoku, Permutations",
  "Sat, Jul 4": "🔁 Revision (3h): Recursion + Backtracking full sweep — Combo Sum I/II/III, Subset Sum, Palindrome Part, M-Coloring",
  "Sun, Jul 5": "🔁 Revision (3h): Word Break, Word Search, Rat in Maze + LL Insertion/Deletion drills",
  "Mon, Jul 6": "🔁 Revision (1h): Reverse LL (iter + rec), Floyd's cycle detection, Find Middle",
  "Tue, Jul 7": "🔁 Revision (1h): Palindrome LL, Intersection, Add Two Numbers, Reverse K-Group",
  "Wed, Jul 8": "🔁 Revision (1h): LL Hard — Flatten, Clone Random, Merge K Sorted",
  "Thu, Jul 9": "🔁 Revision (1h): LL Medium — Find Middle, Detect Cycle, Reverse K-Group",
  "Fri, Jul 10": "🔁 Revision (1h): Greedy classics — N Meetings, Job Sequencing, Min Platforms",
  "Sat, Jul 11": "🔁 Revision (3h): Stack/Queue full sweep — Min Stack, Largest Rect, LRU, Sliding Window Max",
  "Sun, Jul 12": "🔁 Revision (3h): Heaps full sweep — Median Stream, Top K Freq, Kth Largest Stream, Connect Sticks",
  "Mon, Jul 13": "🔁 Revision (1h): Arrays easy — Two Sum, Kadane, Dutch Flag, Best Time Buy Sell",
  "Tue, Jul 14": "🔁 Revision (1h): Greedy + Intervals — Merge Intervals, N Meetings, Job Sequencing",
  "Wed, Jul 15": "🔁 Revision (1h): LL Hard — Flatten, Clone Random, Merge K Sorted",
  "Thu, Jul 16": "🔁 Revision (1h): Arrays hard — 3-Sum, 4-Sum, Merge Overlapping, Count Inversions",
  "Fri, Jul 17": "🔁 Revision (1h): Recursion / Backtracking — N-Queens, Sudoku, Combo Sum",
  "Sat, Jul 18": "🔁 Revision (3h): Trees + BST full sweep — Serialize/Deserialize, LCA, Validate BST, BST Iterator, Largest BST",
  "Sun, Jul 19": "🔁 Revision (3h): Graphs full sweep — Dijkstra, Bellman-Ford, Prim, Kruskal, Kosaraju, Bridges",
  "Mon, Jul 20": "🔁 Revision (1h): BS on Answers — Aggressive Cows, Book Allocation, Koko, Smallest Divisor",
  "Tue, Jul 21": "🔁 Revision (1h): BS rotated — Rotated I/II, Find Min, Single Element, How Many Rotations",
  "Wed, Jul 22": "🔁 Revision (1h): 2D BS — Search Matrix I/II, Peak 2D, Median Row-wise",
  "Thu, Jul 23": "🔁 Revision (1h): Strings basic — LCP, Reverse Words, Roman/Int, Isomorphic",
  "Fri, Jul 24": "🔁 Revision (1h): Strings hard — Longest Palindromic Substring, Atoi, KMP/Z-algo",
  "Sat, Jul 25": "🔁 Revision (3h): Arrays full sweep — Kadane, Dutch Flag, 3-Sum, 4-Sum, Repeating/Missing, Reverse Pairs, Max Product Subarray",
  "Sun, Jul 26": "🔁 Final Revision (3h): Re-solve ALL 🔴 flagged + 🟡 flagged from DP/Graphs/Trees/Backtracking + Mock Interview",
};

// Stage-based spaced repetition.
// review_count in DB = which stage the problem is at (0-4).
// A problem only appears in the revision queue when daysAgo >= SR_STAGES[review_count].nextInterval.
// After "Recalled ✓": review_count++ → problem disappears until the NEXT stage's interval.
// This means clicking recalled on Jun 7 (stage 0, 1-day) won't show it on Jun 8 again;
// it shows next on Jun 10 (stage 1, 3-day from Jun 7).
const SR_STAGES = [
  { nextInterval: 1,  label: '1-day'   },  // stage 0 → first review, 1 day after solving
  { nextInterval: 3,  label: '3-day'   },  // stage 1 → 3 days after 1st recall
  { nextInterval: 7,  label: '1-week'  },  // stage 2 → 7 days after 2nd recall
  { nextInterval: 14, label: '2-week'  },  // stage 3 → 14 days after 3rd recall
  { nextInterval: 30, label: '1-month' },  // stage 4 → 30 days after 4th recall
  // review_count ≥ 5 → fully learned, no more scheduled reviews
];
const SR_COLOR      = 'bg-slate-800/70 border-slate-600/50 text-slate-300';
const OVERDUE_COLOR = 'bg-rose-950/50 border-rose-700/50 text-rose-300';
const OVERDUE_DAILY_CAP = 10;

type DailyCount = { date: string; completed: number; revised: number };

export default function Tracker() {
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [updatedAt, setUpdatedAt] = useState<Record<string, string>>({});
  const [reviewCount, setReviewCount] = useState<Record<string, number>>({});
  const [view, setView] = useState<'phase' | 'day' | 'revision' | 'completed' | 'stats'>('stats');
  const [activePhase, setActivePhase] = useState('HARD GRAPHS');
  const [activeDayKey, setActiveDayKey] = useState(() => {
    const n = new Date();
    const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${DN[n.getDay()]}, ${MN[n.getMonth()]} ${n.getDate()}`;
  });
  const [last7, setLast7] = useState<DailyCount[]>([]);
  const [eventsRefresh, setEventsRefresh] = useState(0);

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then(data => {
        if (data.status) {
          setProgress(data.status);
          setUpdatedAt(data.updatedAt || {});
          setReviewCount(data.reviewCount || {});
        } else {
          setProgress(data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch last 7 days of completed/revised counts; re-runs after each toggle/recall.
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    const from = toLocalISODate(start);
    const to   = toLocalISODate(end);
    fetch(`/api/events?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(data => {
        const map = new Map<string, DailyCount>(
          (data.days || []).map((d: DailyCount) => [d.date, d])
        );
        const out: DailyCount[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(end.getDate() - i);
          const iso = toLocalISODate(d);
          out.push(map.get(iso) ?? { date: iso, completed: 0, revised: 0 });
        }
        setLast7(out);
      })
      .catch(() => {});
  }, [eventsRefresh]);

  const toggle = async (id: string, target: string) => {
    const cur = progress[id] || 'unsolved';
    const next = cur === target ? 'unsolved' : target;
    setProgress(p => ({ ...p, [id]: next }));
    // Keep updatedAt in sync so revisionDueForDay can schedule this problem correctly.
    // Without this, problems marked in the current session never appear in the revision queue.
    if (next !== 'unsolved') {
      setUpdatedAt(u => ({ ...u, [id]: new Date().toISOString() }));
      setReviewCount(rc => ({ ...rc, [id]: 0 })); // reset SR stage on re-solve
    }
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: id, status: next, reviewCount: 0 }),
    });
    logEvent(id, next, toLocalISODate(new Date()));
    setEventsRefresh(n => n + 1);
  };

  const allProblems = useMemo(() => Object.values(dataset).flat() as Problem[], []);
  const total = allProblems.length;
  const solved = useMemo(() => allProblems.filter(p => progress[p.id] === 'solved').length, [allProblems, progress]);
  const hinted = useMemo(() => allProblems.filter(p => progress[p.id] === 'hint').length, [allProblems, progress]);
  const toRevise = useMemo(() => allProblems.filter(p => progress[p.id] === 'revisit').length, [allProblems, progress]);

  const problemsByDay = useMemo(() => {
    const map: Record<string, Problem[]> = {};
    for (const p of allProblems) {
      if (!map[p.day]) map[p.day] = [];
      map[p.day].push(p);
    }
    return map;
  }, [allProblems]);

  const revisionByPhase = useMemo(() => {
    const map: Record<string, Problem[]> = {};
    for (const [ph, probs] of Object.entries(dataset)) {
      const r = (probs as Problem[]).filter(p => progress[p.id] === 'revisit');
      if (r.length > 0) map[ph] = r;
    }
    return map;
  }, [progress]);

  const completedByPhase = useMemo(() => {
    const map: Record<string, Problem[]> = {};
    for (const [ph, probs] of Object.entries(dataset)) {
      const c = (probs as Problem[]).filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint');
      if (c.length > 0) map[ph] = c;
    }
    return map;
  }, [progress]);

  // ── Calendar helpers ──────────────────────────────────────────────────
  const MONTH_IDX: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const _now = new Date();
  const TODAY_DATE = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate());
  const STUDY_START = new Date(2026, 3, 27);
  const STUDY_END   = new Date(2026, 11, 31);

  function parseDayKey(key: string): Date | null {
    const m = key.match(/\w+, (\w+) (\d+)/);
    if (!m || !(m[1] in MONTH_IDX)) return null;
    return new Date(2026, MONTH_IDX[m[1]], +m[2]);
  }

  function dayStatus(dayKey: string): string {
    const date = parseDayKey(dayKey);
    const probs = problemsByDay[dayKey] || [];
    if (!date || probs.length === 0) return 'empty';
    const done = probs.filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length;
    const isToday = date.getTime() === TODAY_DATE.getTime();
    const isPast  = date < TODAY_DATE;
    if (isToday) return done === probs.length ? 'todayDone' : 'today';
    if (!isPast)  return 'future';
    if (done === probs.length) return 'done';
    if (done > 0) return 'partial';
    return 'overdue';
  }

  function buildDayKey(month: number, day: number): string {
    const d = new Date(2026, month, day);
    const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${DN[d.getDay()]}, ${MN[d.getMonth()]} ${day}`;
  }

  function buildMonthGrid(month: number, days: number): (number | null)[] {
    const offset = (new Date(2026, month, 1).getDay() + 6) % 7;
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function isInStudyRange(month: number, day: number) {
    const d = new Date(2026, month, day);
    return d >= STUDY_START && d <= STUDY_END;
  }

  const calMonths = [
    { name: 'April 2026',     month: 3,  days: 30 },
    { name: 'May 2026',       month: 4,  days: 31 },
    { name: 'June 2026',      month: 5,  days: 30 },
    { name: 'July 2026',      month: 6,  days: 31 },
    { name: 'August 2026',    month: 7,  days: 31 },
    { name: 'September 2026', month: 8,  days: 30 },
    { name: 'October 2026',   month: 9,  days: 31 },
    { name: 'November 2026',  month: 10, days: 30 },
    { name: 'December 2026',  month: 11, days: 31 },
  ];

  const cellStyle: Record<string, string> = {
    overdue:  'bg-rose-950/70 border border-rose-600/60 text-rose-300',
    today:    'bg-blue-950/60 ring-2 ring-blue-400 text-blue-200',
    todayDone:'bg-emerald-950/50 ring-2 ring-emerald-400 text-emerald-300',
    future:   'bg-slate-800/30 border border-slate-700/20 text-slate-500',
    done:     'bg-emerald-950/50 border border-emerald-700/40 text-emerald-400',
    partial:  'bg-amber-950/50 border border-amber-600/40 text-amber-400',
    empty:    'text-slate-700 cursor-default',
  };

  // ── Spaced Repetition helpers ─────────────────────────────────────────

  // Map problem id → short phase label (e.g. "DYNAMIC PROGRAMMING")
  const problemPhase = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [ph, probs] of Object.entries(dataset)) {
      const short = ph.split(':')[1]?.trim() ?? ph;
      for (const p of probs as Problem[]) map[p.id] = short;
    }
    return map;
  }, []);

  // Returns problems due for review on dayKey.
  // Logic: daysAgo >= SR_STAGES[review_count].nextInterval → due.
  // After "Recalled ✓", review_count++ so the problem won't show again until the NEXT interval.
  // Missed reviews persist (still show next day, next week) until recalled — never silently drop.
  function revisionDueForDay(dayKey: string): Array<{ problem: Problem; stage: number; daysAgo: number; overdue: boolean }> {
    const date = parseDayKey(dayKey);
    if (!date) return [];
    const result: Array<{ problem: Problem; stage: number; daysAgo: number; overdue: boolean }> = [];
    for (const p of allProblems) {
      const s  = progress[p.id];
      const ua = updatedAt[p.id];
      const stage = reviewCount[p.id] ?? 0;
      if (!ua || (s !== 'solved' && s !== 'hint')) continue;
      if (stage >= SR_STAGES.length) continue; // fully learned
      const d    = new Date(ua);
      const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const daysAgo = Math.round((date.getTime() - dOnly.getTime()) / (1000 * 60 * 60 * 24));
      const nextInterval = SR_STAGES[stage].nextInterval;
      if (daysAgo >= nextInterval) {
        // Overdue = 30+ days past the scheduled interval (severely missed)
        const overdue = (daysAgo - nextInterval) >= 30 && date >= TODAY_DATE;
        result.push({ problem: p, stage, daysAgo, overdue });
      }
    }
    result.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      if (a.stage  !== b.stage)   return a.stage - b.stage;
      if (a.problem.sde !== b.problem.sde) return a.problem.sde ? -1 : 1;
      return b.daysAgo - a.daysAgo;
    });
    return result;
  }

  // Increments review_count (advances SR stage) and stamps selected calendar date.
  const markReviewed = async (id: string) => {
    const s = progress[id];
    if (!s || s === 'unsolved') return;
    const recallDate = parseDayKey(activeDayKey) ?? new Date();
    const isoDate = new Date(recallDate.getFullYear(), recallDate.getMonth(), recallDate.getDate(), 12).toISOString();
    const nextStage = Math.min((reviewCount[id] ?? 0) + 1, SR_STAGES.length);
    setUpdatedAt(u => ({ ...u, [id]: isoDate }));
    setReviewCount(rc => ({ ...rc, [id]: nextStage }));
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: id, status: s, updatedAt: isoDate, reviewCount: nextStage }),
    });
    logEvent(id, 'reviewed', toLocalISODate(recallDate));
    setEventsRefresh(n => n + 1);
  };

  // ── RevisionRow component ─────────────────────────────────────────────
  const RevisionRow = ({ p, stage, daysAgo, overdue }: { p: Problem; stage: number; daysAgo: number; overdue: boolean }) => {
    const s = progress[p.id] || 'unsolved';
    const stageInfo = SR_STAGES[stage];
    const colorCls = overdue ? OVERDUE_COLOR : SR_COLOR;
    const label    = overdue ? 'Overdue' : (stageInfo?.label ?? 'Review');
    const stageNum = `${stage + 1}/${SR_STAGES.length}`;
    return (
      <div className="px-4 py-2.5 flex items-center gap-3 border-b border-slate-800/40 last:border-0 hover:bg-slate-800/10 transition-colors">
        {/* Stage badge */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${colorCls}`}>
            {label}
          </span>
          <span className="text-[8px] text-slate-700 font-mono">{stageNum}</span>
        </div>
        {/* Title + phase */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-300 font-medium">{p.title}</span>
            {p.sde && (
              <span className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide">SDE</span>
            )}
            {p.company && (
              <span className="shrink-0 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide">{p.company}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-600 font-mono">{daysAgo}d ago · {problemPhase[p.id]}</span>
        </div>
        {/* Status + action */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
            s === 'solved' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-amber-950/60 text-amber-400'
          }`}>
            {s === 'solved' ? '✓ solved' : '~ hint'}
          </span>
          <button
            onClick={() => markReviewed(p.id)}
            title={`Recalled — advances to stage ${stage + 2}/${SR_STAGES.length}`}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-700/60 text-slate-500 hover:border-emerald-600/50 hover:text-emerald-400 hover:bg-emerald-950/20 transition-all">
            Recalled ✓
          </button>
        </div>
      </div>
    );
  };

  // ── Row component ─────────────────────────────────────────────────────
  const Row = ({ p }: { p: Problem }) => {
    const s = progress[p.id] || 'unsolved';
    return (
      <div className={`px-4 py-3 flex items-center gap-3 border-b border-slate-800/40 last:border-0 transition-colors ${
        s === 'solved' ? 'bg-emerald-950/10' : s === 'revisit' ? 'bg-rose-950/10' : 'hover:bg-slate-800/20'
      }`}>
        {/* Status dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          s === 'solved' ? 'bg-emerald-500' : s === 'hint' ? 'bg-amber-400' : s === 'revisit' ? 'bg-rose-500' : 'bg-slate-700'
        }`} />
        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${
              s === 'solved' ? 'text-slate-500 line-through' : s === 'revisit' ? 'text-rose-200' : s === 'hint' ? 'text-amber-200' : 'text-slate-200'
            }`}>{p.title}</span>
            {p.sde && <span className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide">SDE</span>}
            {p.company && <span className="shrink-0 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide">{p.company}</span>}
          </div>
          <span className="text-[10px] text-slate-600 font-mono">{p.day}</span>
        </div>
        {/* Buttons */}
        <div className="flex gap-1 shrink-0">
          <button onClick={() => toggle(p.id, 'solved')} title="Solved"
            className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
              s === 'solved'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'border-slate-700/60 text-slate-600 hover:border-emerald-600/50 hover:text-emerald-500 hover:bg-emerald-950/20'
            }`}>✓</button>
          <button onClick={() => toggle(p.id, 'hint')} title="Needed hint"
            className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
              s === 'hint'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'border-slate-700/60 text-slate-600 hover:border-amber-600/50 hover:text-amber-500 hover:bg-amber-950/20'
            }`}>~</button>
          <button onClick={() => toggle(p.id, 'revisit')} title="Need to revise"
            className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
              s === 'revisit'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'border-slate-700/60 text-slate-600 hover:border-rose-600/50 hover:text-rose-500 hover:bg-rose-950/20'
            }`}>↺</button>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Striver A2Z DSA</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Apr 27 – Dec 17, 2026 · 676 problems</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-400 leading-none">
                  {total > 0 ? Math.round(((solved + hinted) / total) * 100) : 0}%
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">complete</div>
              </div>
            </div>
          </div>
          {/* Segmented progress bar */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div className="h-full flex rounded-full overflow-hidden">
              <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(solved / total) * 100}%` }} />
              <div className="bg-amber-400 transition-all duration-500" style={{ width: `${(hinted / total) * 100}%` }} />
            </div>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: 'Total',   val: total,    cls: 'text-slate-300',  bg: 'bg-slate-800/60' },
              { label: 'Solved',  val: solved,   cls: 'text-emerald-400', bg: 'bg-emerald-950/40 border border-emerald-900/30' },
              { label: 'Hint',    val: hinted,   cls: 'text-amber-400',  bg: 'bg-amber-950/30 border border-amber-900/20' },
              { label: 'Revise',  val: toRevise, cls: 'text-rose-400',   bg: 'bg-rose-950/30 border border-rose-900/20' },
            ].map(({ label, val, cls, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-2.5`}>
                <div className={`text-xl font-black ${cls}`}>{val}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{label}</div>
              </div>
            ))}
          </div>

          {/* Last 7 days mini-chart */}
          {last7.length > 0 && (() => {
            const max = Math.max(1, ...last7.map(d => d.completed));
            const total7 = last7.reduce((sum, d) => sum + d.completed, 0);
            const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            return (
              <div className="mt-3 pt-3 border-t border-slate-800/60">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
                    Last 7 days · completed
                  </span>
                  <span className="text-[10px] text-slate-500">
                    <strong className="text-emerald-400 font-black">{total7}</strong> total
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-16">
                  {last7.map((d, i) => {
                    const isToday = i === last7.length - 1;
                    const h = (d.completed / max) * 100;
                    const [, mo, da] = d.date.split('-');
                    const dt = new Date(Number(d.date.slice(0, 4)), Number(mo) - 1, Number(da));
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 group">
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-200 leading-none h-3">
                          {d.completed > 0 ? d.completed : ''}
                        </span>
                        <div
                          title={`${d.date} · ${d.completed} completed`}
                          className={`w-full rounded-t-sm transition-colors ${
                            d.completed > 0
                              ? (isToday ? 'bg-emerald-400' : 'bg-emerald-500/70 hover:bg-emerald-400')
                              : 'bg-slate-800/60'
                          }`}
                          style={{ height: `${Math.max(h, d.completed > 0 ? 6 : 3)}%` }}
                        />
                        <span className={`text-[9px] font-mono leading-none ${isToday ? 'text-emerald-300 font-bold' : 'text-slate-600'}`}>
                          {DN[dt.getDay()][0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-xl">
          {([['stats','Stats'], ['phase','Phase'], ['day','Calendar'], ['completed','Done'], ['revision','Revise']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === v ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}>
              {label}
              {v === 'revision' && toRevise > 0 && (
                <span className="absolute -top-1 -right-0.5 min-w-[14px] h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
                  {toRevise > 9 ? '9+' : toRevise}
                </span>
              )}
              {v === 'completed' && (solved + hinted) > 0 && (
                <span className="absolute -top-1 -right-0.5 min-w-[14px] h-3.5 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
                  {(solved + hinted) > 99 ? '99+' : solved + hinted}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── STATS VIEW ─────────────────────────────────────────── */}
        {view === 'stats' && <DailyStats />}

        {/* ─── PHASE VIEW ─────────────────────────────────────────── */}
        {view === 'phase' && (
          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.keys(dataset).map(ph => {
                const phProbs = dataset[ph] as Problem[];
                const phDone = phProbs.filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length;
                const pct = Math.round((phDone / phProbs.length) * 100);
                return (
                  <button key={ph} onClick={() => setActivePhase(ph)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all ${
                      activePhase === ph
                        ? 'bg-slate-700 text-white border-slate-600'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}>
                    {ph.replace('PHASE ', 'P').split(':')[0]}
                    <span className={`ml-1.5 font-normal text-[9px] ${pct === 100 ? 'text-emerald-400' : pct > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{pct}%</span>
                  </button>
                );
              })}
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-100 text-sm">{activePhase}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'solved').length} solved
                    {' · '}{(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'hint').length} hint
                    {' · '}{(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'revisit').length} revise
                  </div>
                </div>
                <span className="text-sm font-black text-slate-300">
                  {(dataset[activePhase] as Problem[])?.filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length}
                  <span className="text-slate-600 font-normal text-xs">/{(dataset[activePhase] as Problem[])?.length}</span>
                </span>
              </div>
              <div>{(dataset[activePhase] as Problem[])?.map(p => <Row key={p.id} p={p} />)}</div>
            </div>
          </div>
        )}

        {/* ─── CALENDAR VIEW ──────────────────────────────────────── */}
        {view === 'day' && (
          <div className="flex flex-col md:flex-row gap-4 items-start">

            {/* LEFT: compact calendar sidebar */}
            <div className="w-full md:w-56 shrink-0 space-y-2 md:sticky md:top-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] text-slate-500 px-0.5 pb-1">
                {[
                  { color: 'bg-rose-700/70',    label: 'Overdue' },
                  { color: 'bg-amber-700/60',   label: 'Partial' },
                  { color: 'bg-emerald-700/60', label: 'Done' },
                  { color: 'ring-1 ring-blue-400', label: 'Today' },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-sm ${color} inline-block shrink-0`} />
                    {label}
                  </span>
                ))}
              </div>

              {calMonths.map(({ name, month, days }) => {
                const grid = buildMonthGrid(month, days);
                const hasStudyDays = grid.some(d => d !== null && isInStudyRange(month, d));
                if (!hasStudyDays) return null;
                return (
                  <div key={name} className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-3 py-1.5 bg-slate-800/30 border-b border-slate-800">
                      <h3 className="font-bold text-slate-300 text-[11px]">{name}</h3>
                    </div>
                    <div className="p-2">
                      {/* Day-of-week headers */}
                      <div className="grid grid-cols-7 mb-1">
                        {['M','T','W','T','F','S','S'].map((d, i) => (
                          <div key={i} className="text-center text-[8px] font-bold text-slate-700">{d}</div>
                        ))}
                      </div>
                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {grid.map((day, idx) => {
                          if (day === null) return <div key={idx} className="h-7" />;
                          if (!isInStudyRange(month, day)) {
                            return <div key={idx} className="h-7 flex items-center justify-center text-[10px] text-slate-800 font-medium">{day}</div>;
                          }
                          const dk = buildDayKey(month, day);
                          const probs = problemsByDay[dk] || [];
                          const status = probs.length > 0 ? dayStatus(dk) : 'empty';
                          const isSelected = activeDayKey === dk;
                          return (
                            <button key={idx}
                              onClick={() => probs.length > 0 && setActiveDayKey(dk)}
                              className={`h-7 rounded-md flex flex-col items-center justify-center transition-all text-[10px] font-bold ${
                                probs.length > 0 ? 'cursor-pointer' : 'cursor-default'
                              } ${cellStyle[status] || 'text-slate-700'} ${
                                isSelected && probs.length > 0 ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-slate-900' : ''
                              }`}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Selected day problems + revision */}
            <div className="flex-1 min-w-0 space-y-4">
              {activeDayKey && (problemsByDay[activeDayKey] || []).length > 0 ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100">{activeDayKey}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {(problemsByDay[activeDayKey] || []).filter(p => progress[p.id] === 'solved' || progress[p.id] === 'hint').length}
                        /{(problemsByDay[activeDayKey] || []).length} done
                        {(problemsByDay[activeDayKey] || []).filter(p => progress[p.id] === 'revisit').length > 0 &&
                          ` · ${(problemsByDay[activeDayKey] || []).filter(p => progress[p.id] === 'revisit').length} to revise`}
                      </div>
                    </div>
                    {(() => {
                      const st = dayStatus(activeDayKey);
                      const cfg: Record<string, [string, string]> = {
                        overdue:  ['bg-rose-950/60 text-rose-400',       'Overdue'],
                        partial:  ['bg-amber-950/50 text-amber-400',     'In Progress'],
                        done:     ['bg-emerald-950/50 text-emerald-400', 'Complete'],
                        today:    ['bg-blue-950/50 text-blue-400',       'Today'],
                        todayDone:['bg-emerald-950/50 text-emerald-400', 'Today ✓'],
                        future:   ['bg-slate-800 text-slate-400',        'Upcoming'],
                      };
                      const [style, label] = cfg[st] || ['bg-slate-800 text-slate-400', ''];
                      return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${style}`}>{label}</span>;
                    })()}
                  </div>
                  <div>{(problemsByDay[activeDayKey] || []).map(p => <Row key={p.id} p={p} />)}</div>
                  {revisionNotes[activeDayKey] && (
                    <div className="px-4 py-3 border-t border-amber-900/30 bg-amber-950/10 flex gap-2.5 items-start">
                      <span className="text-amber-500 shrink-0 mt-0.5">🔁</span>
                      <span className="text-[11px] text-amber-300/80 leading-relaxed">{revisionNotes[activeDayKey]}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center">
                  <p className="text-slate-500 text-sm">Select a day from the calendar.</p>
                </div>
              )}

              {/* ── Spaced Revision Queue ──────────────────────────────────── */}
              {(() => {
                if (!activeDayKey) return null;
                const revList = revisionDueForDay(activeDayKey);
                // If nothing is due, check if some of this day's problems were solved today
                // → show a hint that revision starts tomorrow (1-day interval)
                if (revList.length === 0) {
                  const dayProbs = problemsByDay[activeDayKey] || [];
                  const solvedToday = dayProbs.filter(p => {
                    const s = progress[p.id];
                    if (s !== 'solved' && s !== 'hint') return false;
                    const ua = updatedAt[p.id];
                    if (!ua) return false;
                    const d = new Date(ua);
                    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    return dOnly.getTime() === parseDayKey(activeDayKey)?.getTime();
                  });
                  if (solvedToday.length === 0) return null;
                  return (
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-slate-500 text-base">🕐</span>
                      <p className="text-[11px] text-slate-500">
                        <strong className="text-slate-400">{solvedToday.length} problem{solvedToday.length !== 1 ? 's' : ''} solved today</strong>
                        {' — '}first revision appears <strong className="text-slate-400">tomorrow</strong> (1-day interval). Select tomorrow in the calendar to see them.
                      </p>
                    </div>
                  );
                }
                const overdueList = revList.filter(x => x.overdue);
                const scheduledList = revList.filter(x => !x.overdue);
                const overdueShown = overdueList.slice(0, OVERDUE_DAILY_CAP);
                const overdueHidden = overdueList.length - overdueShown.length;
                const displayList = [...overdueShown, ...scheduledList];
                const groupedByStage: Record<number, typeof scheduledList> = {};
                for (const item of scheduledList) {
                  if (!groupedByStage[item.stage]) groupedByStage[item.stage] = [];
                  groupedByStage[item.stage].push(item);
                }
                return (
                  <div className="bg-slate-900/80 border border-indigo-900/30 rounded-xl overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="px-4 py-3 bg-indigo-950/20 border-b border-indigo-900/20 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-indigo-300 text-sm flex items-center gap-2">
                          🧠 Spaced Revision Due
                          <span className="text-[10px] font-normal text-indigo-400/70 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded-full">
                            ~{Math.ceil(displayList.length * 2)} min
                          </span>
                        </div>
                        <div className="text-[10px] text-indigo-400/50 mt-0.5">
                          {displayList.length} problem{displayList.length !== 1 ? 's' : ''}
                          {' · '}
                          recall intuition + pseudocode + O(n) — don&apos;t re-code
                        </div>
                      </div>
                      {/* Summary badges */}
                      <div className="flex gap-1 flex-wrap justify-end shrink-0">
                        {overdueShown.length > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${OVERDUE_COLOR}`}>
                            {overdueHidden > 0
                              ? `Overdue ${overdueShown.length} of ${overdueList.length}`
                              : `Overdue ×${overdueShown.length}`}
                          </span>
                        )}
                        {SR_STAGES.map((s, i) => groupedByStage[i]?.length > 0 ? (
                          <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${SR_COLOR}`}>
                            {s.label} ×{groupedByStage[i].length}
                          </span>
                        ) : null)}
                      </div>
                    </div>
                    {/* Problem rows */}
                    <div>
                      {displayList.map(({ problem, stage, daysAgo, overdue }) => (
                        <RevisionRow key={problem.id} p={problem} stage={stage} daysAgo={daysAgo} overdue={overdue} />
                      ))}
                    </div>
                    {/* "N more overdue" separator shown between overdue and SR batches */}
                    {overdueHidden > 0 && (
                      <div className="px-4 py-2.5 border-t border-rose-900/20 bg-rose-950/10 flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${OVERDUE_COLOR}`}>+{overdueHidden} more</span>
                        <span className="text-[10px] text-rose-400/60">
                          Mark today’s {overdueShown.length} as recalled to reveal the next batch.
                        </span>
                      </div>
                    )}
                    {/* Method reminder */}
                    <div className="px-4 py-2.5 border-t border-indigo-900/20 bg-indigo-950/10">
                      <p className="text-[10px] text-indigo-400/60 leading-relaxed">
                        <strong className="text-indigo-300/70">💡 Mental solve:</strong>
                        {' '}look at title → state pattern &amp; intuition aloud → sketch pseudocode → state time/space complexity.
                        {' '}Click <strong className="text-indigo-300/70">&quot;Recalled ✓&quot;</strong> to advance the review timer to the next interval.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* ─── COMPLETED VIEW ─────────────────────────────────────── */}
        {view === 'completed' && (
          Object.keys(completedByPhase).length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-14 text-center">
              <p className="text-slate-400 font-medium">No problems completed yet.</p>
              <p className="text-slate-600 text-xs mt-2">Mark ✓ (solved) or ~ (needed hint) on any problem.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 px-1">{solved + hinted} done — {solved} solved, {hinted} with hint — across {Object.keys(completedByPhase).length} phases</p>
              {Object.entries(completedByPhase).map(([ph, probs]) => (
                <div key={ph} className="bg-slate-900/80 border border-emerald-900/25 rounded-xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-emerald-950/15 border-b border-emerald-900/20 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-emerald-300 text-sm">{ph}</div>
                      <div className="text-[10px] text-emerald-600/70 mt-0.5">
                        {probs.filter(p => progress[p.id] === 'solved').length} solved · {probs.filter(p => progress[p.id] === 'hint').length} hint
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400">{probs.length}<span className="text-slate-600 font-normal">/{(dataset[ph] as Problem[]).length}</span></span>
                  </div>
                  <div>{probs.map(p => <Row key={p.id} p={p} />)}</div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ─── REVISION VIEW ──────────────────────────────────────── */}
        {view === 'revision' && (
          Object.keys(revisionByPhase).length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-14 text-center">
              <p className="text-slate-400 font-medium">No problems marked for revision.</p>
              <p className="text-slate-600 text-xs mt-2">Mark ↺ on any problem to add it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 px-1">{toRevise} to revise across {Object.keys(revisionByPhase).length} phases — mark ✓ or ~ to remove.</p>
              {Object.entries(revisionByPhase).map(([ph, probs]) => (
                <div key={ph} className="bg-slate-900/80 border border-rose-900/25 rounded-xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-rose-950/15 border-b border-rose-900/20 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-rose-300 text-sm">{ph}</div>
                      <div className="text-[10px] text-rose-600/70 mt-0.5">{probs.length} to revise</div>
                    </div>
                  </div>
                  <div>{probs.map(p => <Row key={p.id} p={p} />)}</div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
}