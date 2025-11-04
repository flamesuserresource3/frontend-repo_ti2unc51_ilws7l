import React, { useEffect, useRef, useState } from 'react';
import { Radio, Youtube, Volume2, Pause, Play, SkipForward, SkipBack } from 'lucide-react';

// Unified player for YouTube (Iframe API) and radio streams.
export default function MediaPlayer({ queue = [], currentIndex = -1, onPrev, onNext, onSeekTo }) {
  const current = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
  const audioRef = useRef(null);
  const ytContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isYouTube = current?.type === 'youtube';
  const isRadio = current?.type === 'radio';

  // Load YouTube Iframe API when needed
  useEffect(() => {
    if (!isYouTube) return;
    if (window.YT && window.YT.Player) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }, [isYouTube]);

  // Create/destroy YT player on track changes
  useEffect(() => {
    if (!isYouTube) {
      // Cleanup YT when switching away
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
      return;
    }

    const setup = () => {
      if (!ytContainerRef.current || !current?.id) return;
      ytContainerRef.current.innerHTML = '';
      const div = document.createElement('div');
      div.id = `yt-player-${Date.now()}`;
      ytContainerRef.current.appendChild(div);

      ytPlayerRef.current = new window.YT.Player(div.id, {
        videoId: current.id,
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            try { e.target.playVideo(); setIsPlaying(true); } catch {}
          },
          onStateChange: (e) => {
            // 0 = ended, 1 = playing, 2 = paused, 5 = cued
            if (e.data === 0) {
              setIsPlaying(false);
              onNext && onNext();
            } else if (e.data === 1) {
              setIsPlaying(true);
            } else if (e.data === 2) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    const waitForYT = () => {
      if (window.YT && window.YT.Player) {
        setup();
      } else {
        setTimeout(waitForYT, 100);
      }
    };
    waitForYT();

    return () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [isYouTube, current?.id, onNext]);

  // Handle radio playback
  useEffect(() => {
    if (!isRadio) return;
    const el = audioRef.current;
    if (!el) return;

    const onEnded = () => {
      setIsPlaying(false);
      onNext && onNext();
    };

    el.addEventListener('ended', onEnded);

    // Load and play
    el.pause();
    el.load();
    el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

    return () => {
      el.removeEventListener('ended', onEnded);
      try { el.pause(); } catch {}
    };
  }, [isRadio, current?.stream_url, onNext]);

  const togglePlay = () => {
    if (isYouTube && ytPlayerRef.current) {
      const state = ytPlayerRef.current.getPlayerState?.();
      if (state === 1) {
        try { ytPlayerRef.current.pauseVideo(); setIsPlaying(false); } catch {}
      } else {
        try { ytPlayerRef.current.playVideo(); setIsPlaying(true); } catch {}
      }
      return;
    }

    if (isRadio && audioRef.current) {
      const el = audioRef.current;
      if (!el.paused) {
        el.pause();
        setIsPlaying(false);
      } else {
        el.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  return (
    <section id="player" className="mx-auto w-full max-w-5xl px-4 py-6 text-white">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            {isYouTube ? <Youtube className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
            <span className="text-sm">Now Playing</span>
          </div>
          <div className="text-xs text-white/60">{queue.length} in queue</div>
        </div>

        {!current && (
          <div className="text-white/60">Pick a YouTube track from suggestions or start a radio stream.</div>
        )}

        {isYouTube && (
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <div ref={ytContainerRef} className="h-full w-full" />
          </div>
        )}

        {isRadio && (
          <div className="flex flex-col gap-3">
            <div className="text-lg font-medium">{current.title}</div>
            <audio ref={audioRef} controls className="w-full">
              <source src={current.stream_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Volume2 className="h-4 w-4" /> Live radio stream
            </div>
          </div>
        )}

        {current && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{current.title || (isYouTube ? 'YouTube Track' : 'Radio')}</div>
              <div className="text-xs text-white/60">{current.source || (isYouTube ? 'YouTube' : 'Radio')}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onPrev} disabled={queue.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-50"><SkipBack className="h-4 w-4" /></button>
              <button onClick={togglePlay} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-500">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={onNext} disabled={queue.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-50"><SkipForward className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* Mini queue list */}
        {queue.length > 0 && (
          <div className="mt-4 max-h-56 overflow-auto rounded-lg border border-white/10">
            {queue.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSeekTo && onSeekTo(idx)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left ${idx === currentIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div className="truncate">
                  <span className="text-xs text-white/50 mr-2">{idx === currentIndex ? '▶' : idx + 1}</span>
                  <span className="truncate">{item.title || (item.type === 'youtube' ? 'YouTube Track' : 'Radio')}</span>
                </div>
                <div className="text-xs text-white/50">{item.type === 'youtube' ? 'YT' : 'FM'}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
