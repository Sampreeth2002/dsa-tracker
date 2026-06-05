'use client';
import { useState, useEffect } from 'react';

const dataset = {
  "PHASE 1: DYNAMIC PROGRAMMING": [
    { id: "fibonacci", title: "Fibonacci Number", day: "Apr 27" },
    { id: "climbing-stairs", title: "Climbing Stairs", day: "Apr 27" },
    { id: "frog-jump", title: "Frog Jump (DP-3)", day: "Apr 27" }
  ],
  "PHASE 2: TRIES": [
    { id: "implement-trie", title: "Implement Trie", day: "May 11" }
  ]
};

export default function Tracker() {
  const [progress, setProgress] = useState({});
  const [activePhase, setActivePhase] = useState("PHASE 1: DYNAMIC PROGRAMMING");

  useEffect(() => {
    fetch('/api/progress').then(res => res.json()).then(data => setProgress(data));
  }, []);

  const handleStatusChange = async (problemId, currentStatus, targetStatus) => {
    const newStatus = currentStatus === targetStatus ? 'unsolved' : targetStatus;
    setProgress(prev => ({ ...prev, [problemId]: newStatus }));
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, status: newStatus }),
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400">Striver A2Z DSA Tracker</h1>

      <div className="flex gap-2 mb-6">
        {Object.keys(dataset).map(phase => (
          <button key={phase} onClick={() => setActivePhase(phase)} className={`px-4 py-2 rounded ${activePhase === phase ? 'bg-emerald-500' : 'bg-slate-800'}`}>
            {phase}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-700">
        {dataset[activePhase].map((problem) => {
          const currentStatus = progress[problem.id] || 'unsolved';
          return (
            <div key={problem.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{problem.title}</div>
                <div className="text-sm text-slate-400">{problem.day}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleStatusChange(problem.id, currentStatus, 'solved')} className={`w-10 h-10 rounded text-xl ${currentStatus === 'solved' ? 'bg-green-500/30 border-2 border-green-500' : 'bg-slate-700'}`}>🟢</button>
                <button onClick={() => handleStatusChange(problem.id, currentStatus, 'hint')} className={`w-10 h-10 rounded text-xl ${currentStatus === 'hint' ? 'bg-yellow-500/30 border-2 border-yellow-500' : 'bg-slate-700'}`}>🟡</button>
                <button onClick={() => handleStatusChange(problem.id, currentStatus, 'revisit')} className={`w-10 h-10 rounded text-xl ${currentStatus === 'revisit' ? 'bg-red-500/30 border-2 border-red-500' : 'bg-slate-700'}`}>🔴</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}