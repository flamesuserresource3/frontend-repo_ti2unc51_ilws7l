import React, { useCallback, useMemo, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatAssistant from './components/ChatAssistant';
import RadioDirectory from './components/RadioDirectory';
import MediaPlayer from './components/MediaPlayer';

export default function App() {
  const [queue, setQueue] = useState([]); // [{type:'youtube'|'radio', id?, title, thumbnail?, stream_url?}]
  const [currentIndex, setCurrentIndex] = useState(-1);

  const hasCurrent = currentIndex >= 0 && currentIndex < queue.length;
  const current = hasCurrent ? queue[currentIndex] : null;

  const playNow = useCallback((item) => {
    setQueue([item]);
    setCurrentIndex(0);
  }, []);

  const addToQueue = useCallback((item) => {
    setQueue((q) => [...q, item]);
    if (currentIndex === -1) {
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  const addManyToQueue = useCallback((items) => {
    setQueue((q) => [...q, ...items]);
    if (currentIndex === -1 && items.length > 0) setCurrentIndex(0);
  }, [currentIndex]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1 < queue.length ? i + 1 : -1));
  }, [queue.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  // Manual YouTube input
  const [manualUrl, setManualUrl] = useState('');
  const parseVideoId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
      return null;
    } catch { return null; }
  };
  const playManual = () => {
    const vid = parseVideoId(manualUrl);
    if (vid) playNow({ type: 'youtube', id: vid, title: 'YouTube Track' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <ChatAssistant onPlayNow={playNow} onEnqueue={addToQueue} onEnqueueMany={addManyToQueue} />
      <RadioDirectory onPlay={playNow} />

      {/* Manual YouTube input */}
      <section className="mx-auto w-full max-w-5xl px-4 py-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm text-white/70">Play a YouTube link</div>
          <div className="flex gap-2">
            <input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} className="w-full flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2" placeholder="Paste a YouTube URL (e.g. https://www.youtube.com/watch?v=jfKfPfyJRdk)" />
            <button onClick={playManual} className="rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500">Play</button>
          </div>
        </div>
      </section>

      <MediaPlayer
        queue={queue}
        currentIndex={currentIndex}
        onPrev={prev}
        onNext={next}
        onSeekTo={(idx) => setCurrentIndex(idx)}
      />

      <footer className="mt-8 border-t border-white/10 py-6 text-center text-white/60">
        Built with an AI music assistant, voice control, YouTube playback, auto-queue, and live radios.
      </footer>
    </div>
  );
}
