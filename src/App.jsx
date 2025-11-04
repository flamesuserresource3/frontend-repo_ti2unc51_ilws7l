import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatAssistant from './components/ChatAssistant';
import RadioDirectory from './components/RadioDirectory';
import MediaPlayer from './components/MediaPlayer';

export default function App() {
  const [current, setCurrent] = useState(null);

  // Allow manual YouTube URL input as fallback
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
    if (vid) setCurrent({ type: 'youtube', id: vid, title: 'YouTube Track' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <ChatAssistant onPlay={setCurrent} />
      <RadioDirectory onPlay={setCurrent} />

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

      <MediaPlayer current={current} />

      <footer className="mt-8 border-t border-white/10 py-6 text-center text-white/60">
        Built with an AI music assistant, YouTube playback, and live radios.
      </footer>
    </div>
  );
}
