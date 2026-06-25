// DEPRECATED — no longer needed.
// The dataset and its schedule now live in app/lib/dataset.ts, where each
// problem's date is computed at runtime by the cadence scheduler. app/lib/schedule.ts
// simply re-exports PROBLEM_SCHEDULE from there, so there is nothing to generate.
// This script is kept only for historical reference and intentionally does nothing.
console.log('build-schedule is deprecated: schedule is derived in app/lib/dataset.ts');
export {};

