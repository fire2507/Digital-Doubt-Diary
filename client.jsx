import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Sparkles, Trash2, ThumbsUp, ThumbsDown, Moon, Sun, ShieldAlert, BarChart2, BookOpen } from 'lucide-react';

export default function App() {
  const [tab, setTab] = useState('journal');
  const [dark, setDark] = useState(false);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ streak: 0, totalEntries: 0 });
  const [thought, setThought] = useState('');
  const [mood, setMood] = useState(3);
  const [challenge, setChallenge] = useState('Balanced');
  const [loading, setLoading] = useState(false);
  const [crisis, setCrisis] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [eRes, sRes] = await Promise.all([fetch('/api/entries'), fetch('/api/stats')]);
      setEntries(await eRes.json());
      setStats(await sRes.json());
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!thought.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought, mood, challengeLevel: challenge })
      });
      const data = await res.json();
      if (data.crisisDetected) setCrisis(data.message);
      else { setThought(''); loadData(); }
    } catch { alert('Failed to connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans p-4 sm:p-8`}>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <h1 className="font-bold text-lg">Digital Doubt Diary</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 px-3 py-1 rounded-full font-semibold">🔥 {stats.streak} day streak</span>
            <button onClick={() => setDark(!dark)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}</button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-sm flex items-center space-x-1.5"><Sparkles className="w-4 h-4 text-emerald-600" /><span>Log Anxious Thought</span></h2>
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              {['Gentle', 'Balanced', 'Rigorous'].map(l => (
                <button key={l} type="button" onClick={() => setChallenge(l)} className={`px-2.5 py-1 rounded-lg ${challenge === l ? 'bg-emerald-600 text-white font-medium' : ''}`}>{l}</button>
              ))}
            </div>
          </div>
          <textarea
            value={thought} onChange={e => setThought(e.target.value)}
            placeholder="What's on your mind right now? e.g., I messed up my presentation..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} type="button" onClick={() => setMood(v)} className={`py-1.5 px-3 rounded-xl border text-base ${mood === v ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-slate-200 dark:border-slate-700'}`}>{['😢','😕','😐','🙂','🌟'][v-1]}</button>
              ))}
            </div>
            <button type="submit" disabled={loading || !thought.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm disabled:opacity-50">
              {loading ? 'Reframing...' : 'Reframe'}
            </button>
          </div>
        </form>

        {/* Entries Feed */}
        <div className="space-y-4">
          {entries.map(e => (
            <div key={e.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="text-lg">{['😢','😕','😐','🙂','🌟'][e.mood-1]}</span>
                  <span className="font-semibold text-emerald-600">{e.challenge_level}</span>
                  <span>{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
                <button onClick={async () => { await fetch(`/api/entries/${e.id}`, { method: 'DELETE' }); loadData(); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="font-semibold text-sm">"{e.thought}"</p>
              {e.analysis?.balanced_thought && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px] block">Balanced Perspective</span>
                  <p className="font-medium text-slate-800 dark:text-slate-100">"{e.analysis.balanced_thought}"</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Crisis Modal */}
        {crisis && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-red-500 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-red-600"><ShieldAlert className="w-6 h-6" /><h3 className="font-bold text-lg">Support Is Available</h3></div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{crisis}</p>
              <a href="tel:988" className="block text-center bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium text-sm">Call 988 Helpline</a>
              <button onClick={() => setCrisis(null)} className="block w-full text-center text-xs text-slate-400 mt-2">Dismiss</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Mount React
ReactDOM.createRoot(document.getElementById('root')).render(<App />);