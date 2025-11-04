import React, { useState } from 'react';
import { Bot, Send, Music2, ThumbsUp } from 'lucide-react';

export default function ChatAssistant({ onPlay }) {
  const [mood, setMood] = useState('happy');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const backend = import.meta.env.VITE_BACKEND_URL || '';

  const ask = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backend}/api/agent/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, message })
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const quickMoods = ['happy', 'chill', 'focus', 'party', 'sad'];

  return (
    <section id="assistant" className="mx-auto w-full max-w-5xl px-4 py-8 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2 text-white/80">
          <Bot className="h-5 w-5" />
          <span className="text-sm">Virtual Assistant</span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 md:max-w-[180px]">
            {quickMoods.map((m) => (
              <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2"
            placeholder="Say something like: I'm in a great mood and want energetic tracks"
          />
          <button onClick={ask} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500 disabled:opacity-60">
            <Send className="h-4 w-4" />
            {loading ? 'Thinking...' : 'Ask' }
          </button>
        </div>

        {/* Quick mood chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickMoods.map((m) => (
            <button key={m} onClick={() => { setMood(m); setMessage(''); }} className={`rounded-full border px-3 py-1 text-sm ${mood===m ? 'border-purple-400 text-purple-300' : 'border-white/10 text-white/70 hover:text-white'}`}>
              {m}
            </button>
          ))}
        </div>

        {/* Suggestions */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {suggestions.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="h-14 w-14 overflow-hidden rounded-lg bg-white/10">
                {s.source === 'youtube' ? (
                  <img src={s.thumbnail} alt={s.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/70">FM</div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium leading-tight">{s.title}</div>
                <div className="text-xs text-white/60">{s.source === 'youtube' ? 'YouTube Track' : 'Live Radio'}</div>
              </div>
              <button
                onClick={() => onPlay(s.source === 'youtube' ? { type: 'youtube', id: s.id, title: s.title, thumbnail: s.thumbnail } : { type: 'radio', stream_url: s.stream_url, title: s.title })}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
              >
                <Music2 className="h-4 w-4" /> Play
              </button>
            </div>
          ))}
        </div>

        {suggestions.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-white/10 p-4 text-white/70">
            Tell me your mood and I will queue some YouTube tracks and radios you might like.
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <ThumbsUp className="h-4 w-4" /> Tips: paste a YouTube link below in the player to play a specific track.
        </div>
      </div>
    </section>
  );
}
