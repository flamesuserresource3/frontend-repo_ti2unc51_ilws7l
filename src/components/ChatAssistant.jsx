import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Music2, ThumbsUp, Mic, Plus, ListPlus } from 'lucide-react';

export default function ChatAssistant({ onPlayNow, onEnqueue, onEnqueueMany }) {
  const [mood, setMood] = useState('chill');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [listening, setListening] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL || '';

  // ---------- Voice recognition ----------
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setMessage(transcript);
      setListening(false);
      ask(transcript);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const speak = (text) => {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  // ---------- Local fallback suggestions (no backend needed) ----------
  const moodBank = {
    chill: [
      { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', source: 'youtube' },
      { id: 'DWcJFNfaw9c', title: '4 A.M Study Session - lofi hip hop/chill beats', source: 'youtube' },
      { id: '7NOSDKb0HlU', title: 'cozy lofi beats', source: 'youtube' },
    ],
    happy: [
      { id: 'pRpeEdMmmQ0', title: 'Shakira - Waka Waka', source: 'youtube' },
      { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito', source: 'youtube' },
      { id: '3AtDnEC4zak', title: 'Maroon 5 - Sugar', source: 'youtube' },
    ],
    focus: [
      { id: 'f02mOEt11OQ', title: 'alpha waves for focus', source: 'youtube' },
      { id: 'e3L1PIY1pN8', title: 'coding music to focus', source: 'youtube' },
      { id: 'WPni755-Krg', title: 'Deep Focus — 2 hours', source: 'youtube' },
    ],
    party: [
      { id: '2Vv-BfVoq4g', title: 'Ed Sheeran - Perfect (Remix)', source: 'youtube' },
      { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', source: 'youtube' },
      { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', source: 'youtube' },
    ],
    sad: [
      { id: 'hLQl3WQQoQ0', title: 'Adele - Someone Like You', source: 'youtube' },
      { id: 'RBumgq5yVrA', title: 'Passenger - Let Her Go', source: 'youtube' },
      { id: 'YQHsXMglC9A', title: 'Adele - Hello', source: 'youtube' },
    ],
  };

  const buildThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const localSuggest = (qMood, qText) => {
    const key = (qText || '').toLowerCase();
    let picks = moodBank[qMood] || moodBank.chill;
    // lightweight keyword routing
    if (key.includes('lofi') || key.includes('study')) picks = moodBank.chill;
    if (key.includes('focus') || key.includes('deep')) picks = moodBank.focus;
    if (key.includes('happy') || key.includes('dance') || key.includes('party')) picks = moodBank.party;
    if (key.includes('sad') || key.includes('slow')) picks = moodBank.sad;

    // add one radio option for variety
    const list = picks.map((p) => ({
      source: 'youtube',
      id: p.id,
      title: p.title,
      thumbnail: buildThumb(p.id),
    }));
    list.push({
      source: 'radio',
      title: 'Lofi Girl Radio',
      stream_url: 'https://stream-icy.bauermedia.co.uk/lofigirl.mp3',
    });
    return list;
  };

  // ---------- Ask flow ----------
  const ask = async (overrideMessage) => {
    const msg = typeof overrideMessage === 'string' ? overrideMessage : message;
    setLoading(true);
    try {
      if (backend) {
        const res = await fetch(`${backend}/api/agent/suggest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood, message: msg })
        });
        if (res.ok) {
          const data = await res.json();
          const list = (data?.suggestions || []).map((s) => s.source === 'youtube'
            ? { ...s, source: 'youtube', thumbnail: s.thumbnail || buildThumb(s.id) }
            : { ...s, source: 'radio' }
          );
          if (list.length) {
            setSuggestions(list);
            speak(`I found ${list.length} suggestions for ${mood}.`);
            return;
          }
        }
      }
      // fallback if backend not set or empty result
      const local = localSuggest(mood, msg);
      setSuggestions(local);
      speak(`Here are some ${mood} picks I can play right away.`);
    } catch (e) {
      console.error(e);
      const local = localSuggest(mood, msg);
      setSuggestions(local);
      speak('I had trouble reaching the server, so I queued up some local picks.');
    } finally {
      setLoading(false);
    }
  };

  const quickMoods = ['happy', 'chill', 'focus', 'party', 'sad'];

  const startListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      speak('Voice recognition is not supported in this browser.');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      if (listening) rec.stop();
      rec.start();
      setListening(true);
    } catch {}
  };

  const enqueueAll = () => {
    const items = suggestions.map((s) => s.source === 'youtube'
      ? { type: 'youtube', id: s.id, title: s.title, thumbnail: s.thumbnail, source: 'YouTube' }
      : { type: 'radio', stream_url: s.stream_url, title: s.title, source: 'Radio' }
    );
    onEnqueueMany && onEnqueueMany(items);
    speak('Added all suggestions to your queue.');
  };

  return (
    <section id="assistant" className="mx-auto w-full max-w-5xl px-4 py-8 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Bot className="h-5 w-5" />
            <span className="text-sm">Voice Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startListening} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${listening ? 'bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}>
              <Mic className="h-4 w-4" /> {listening ? 'Listening…' : 'Speak'}
            </button>
            <button onClick={enqueueAll} disabled={suggestions.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-50">
              <ListPlus className="h-4 w-4" /> Add all to queue
            </button>
          </div>
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
            placeholder="Tell me what you want to hear or say it aloud"
          />
          <button onClick={() => ask()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500 disabled:opacity-60">
            <Send className="h-4 w-4" />
            {loading ? 'Thinking…' : 'Ask'}
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
              <div className="flex-1 min-w-0">
                <div className="font-medium leading-tight truncate" title={s.title}>{s.title}</div>
                <div className="text-xs text-white/60">{s.source === 'youtube' ? 'YouTube Track' : 'Live Radio'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEnqueue && onEnqueue(s.source === 'youtube' ? { type: 'youtube', id: s.id, title: s.title, thumbnail: s.thumbnail } : { type: 'radio', stream_url: s.stream_url, title: s.title })}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                >
                  <Plus className="h-4 w-4" /> Queue
                </button>
                <button
                  onClick={() => onPlayNow && onPlayNow(s.source === 'youtube' ? { type: 'youtube', id: s.id, title: s.title, thumbnail: s.thumbnail } : { type: 'radio', stream_url: s.stream_url, title: s.title })}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm hover:bg-purple-500"
                >
                  <Music2 className="h-4 w-4" /> Play
                </button>
              </div>
            </div>
          ))}
        </div>

        {suggestions.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-white/10 p-4 text-white/70">
            Tell me your mood and I will queue some YouTube tracks and radios you might like. Use the mic to speak hands‑free.
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <ThumbsUp className="h-4 w-4" /> Tip: Click Play once to grant autoplay permissions. The queue will advance automatically after that.
        </div>
      </div>
    </section>
  );
}
