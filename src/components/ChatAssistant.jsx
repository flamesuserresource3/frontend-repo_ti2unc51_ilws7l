import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Music2, Mic, Plus, ListPlus } from 'lucide-react';

export default function ChatAssistant({ onPlayNow, onEnqueue, onEnqueueMany }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [listening, setListening] = useState(false);

  // ---------- Voice recognition ----------
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const isFinal = event.results[event.results.length - 1].isFinal;
      setMessage(transcript.trim());
      if (isFinal) {
        setListening(false);
        ask(transcript.trim());
      }
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

  // ---------- Local suggestions (keyword-based, no dropdown) ----------
  const moodBank = {
    chill: [
      { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to' },
      { id: 'DWcJFNfaw9c', title: '4 A.M Study Session - lofi hip hop/chill beats' },
      { id: '7NOSDKb0HlU', title: 'cozy lofi beats' },
    ],
    happy: [
      { id: 'pRpeEdMmmQ0', title: 'Shakira - Waka Waka' },
      { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito' },
      { id: '3AtDnEC4zak', title: 'Maroon 5 - Sugar' },
    ],
    focus: [
      { id: 'f02mOEt11OQ', title: 'alpha waves for focus' },
      { id: 'e3L1PIY1pN8', title: 'coding music to focus' },
      { id: 'WPni755-Krg', title: 'Deep Focus — 2 hours' },
    ],
    party: [
      { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You' },
      { id: '60ItHLz5WEA', title: 'Alan Walker - Faded' },
      { id: 'oC-GflRB0y4', title: 'David Guetta - Titanium' },
    ],
    sad: [
      { id: 'hLQl3WQQoQ0', title: 'Adele - Someone Like You' },
      { id: 'RBumgq5yVrA', title: 'Passenger - Let Her Go' },
      { id: 'YQHsXMglC9A', title: 'Adele - Hello' },
    ],
  };

  const buildThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const localSuggest = (qText) => {
    const key = (qText || '').toLowerCase();
    let picks = moodBank.chill;
    if (key.includes('lofi') || key.includes('chill') || key.includes('relax')) picks = moodBank.chill;
    else if (key.includes('focus') || key.includes('deep') || key.includes('study')) picks = moodBank.focus;
    else if (key.includes('happy') || key.includes('dance') || key.includes('party') || key.includes('upbeat')) picks = moodBank.party;
    else if (key.includes('sad') || key.includes('slow') || key.includes('melancholy')) picks = moodBank.sad;
    else if (key.includes('pop') || key.includes('hit')) picks = moodBank.happy;

    const list = picks.map((p) => ({
      source: 'youtube',
      id: p.id,
      title: p.title,
      thumbnail: buildThumb(p.id),
    }));

    // one optional radio for variety
    list.push({
      source: 'radio',
      title: 'Lofi Girl Radio',
      stream_url: 'https://stream-icy.bauermedia.co.uk/lofigirl.mp3',
    });
    return list;
  };

  const ask = async (overrideMessage) => {
    const msg = typeof overrideMessage === 'string' ? overrideMessage : message;
    const q = msg && msg.trim().length > 0 ? msg.trim() : 'chill lofi';
    setLoading(true);
    try {
      const local = localSuggest(q);
      setSuggestions(local);
      const spoken = local.slice(0, 3).map((x) => x.title).join(', ');
      speak(`Here are some picks for ${q}: ${spoken}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
            Tell me your mood with text or voice and I will queue YouTube tracks and a radio to match. Use the mic to speak hands‑free.
          </div>
        )}

      </div>
    </section>
  );
}
