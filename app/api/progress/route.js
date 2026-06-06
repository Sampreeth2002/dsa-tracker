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
const statusMap = {};
const updatedAtMap = {};
const reviewCountMap = {};
data.forEach(row => {
    if (!statusMap[row.problem_id]) {
        statusMap[row.problem_id]     = row.status;
        updatedAtMap[row.problem_id]  = row.updated_at;
        reviewCountMap[row.problem_id] = row.review_count ?? 0;
    }
});
return NextResponse.json({ status: statusMap, updatedAt: updatedAtMap, reviewCount: reviewCountMap });
}

export async function POST(request) {
const { problemId, status, updatedAt, reviewCount } = await request.json();
const { data, error } = await supabase
    .from('problem_progress')
    .upsert(
        {
            problem_id:   problemId,
            status:       status,
            updated_at:   updatedAt ? new Date(updatedAt) : new Date(),
            review_count: reviewCount ?? 0,
        },
        { onConflict: 'problem_id' }
    )
    .select();
if (error) return NextResponse.json({ error: error.message }, { status: 500 });
return NextResponse.json({ success: true, data });
}