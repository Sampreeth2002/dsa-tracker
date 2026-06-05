import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
const { data, error } = await supabase
    .from('problem_progress')
    .select('*')
    .order('updated_at', { ascending: false });
if (error) return NextResponse.json({ error: error.message }, { status: 500 });
// Take the most-recent row per problem_id (handles any legacy duplicates)
const progressMap = data.reduce((acc, row) => {
    if (!acc[row.problem_id]) acc[row.problem_id] = row.status;
    return acc;
}, {});
return NextResponse.json(progressMap);
}

export async function POST(request) {
const { problemId, status } = await request.json();
const { data, error } = await supabase
    .from('problem_progress')
    .upsert(
        { problem_id: problemId, status: status, updated_at: new Date() },
        { onConflict: 'problem_id' }
    )
    .select();
if (error) return NextResponse.json({ error: error.message }, { status: 500 });
return NextResponse.json({ success: true, data });
}