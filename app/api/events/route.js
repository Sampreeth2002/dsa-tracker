import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns rows aggregated by event_date with:
//   - completed: distinct problems marked solved or hint that day
//   - revised:   distinct problems where a 'reviewed' event was logged that day
//   - flagged:   distinct problems marked revisit that day
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');

  let q = supabase.from('problem_events').select('problem_id,event_type,event_date');
  if (from) q = q.gte('event_date', from);
  if (to)   q = q.lte('event_date', to);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // date -> { completed:Set, revised:Set, flagged:Set }
  const byDate = {};
  for (const row of data) {
    const d = row.event_date;
    if (!byDate[d]) byDate[d] = { completed: new Set(), revised: new Set(), flagged: new Set() };
    if (row.event_type === 'solved' || row.event_type === 'hint') byDate[d].completed.add(row.problem_id);
    else if (row.event_type === 'reviewed')                       byDate[d].revised.add(row.problem_id);
    else if (row.event_type === 'revisit')                        byDate[d].flagged.add(row.problem_id);
  }

  const days = Object.entries(byDate)
    .map(([date, sets]) => ({
      date,
      completed: sets.completed.size,
      revised:   sets.revised.size,
      flagged:   sets.flagged.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ days });
}

// POST /api/events  body: { problemId, eventType, eventDate? }
// eventDate is YYYY-MM-DD; defaults to today (server-side UTC date).
export async function POST(request) {
  const { problemId, eventType, eventDate } = await request.json();
  if (!problemId || !eventType) {
    return NextResponse.json({ error: 'problemId and eventType required' }, { status: 400 });
  }
  const date = eventDate || new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('problem_events')
    .insert({ problem_id: problemId, event_type: eventType, event_date: date })
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
