import React, { useEffect, useRef } from 'react';
import { Radio, Youtube, Volume2 } from 'lucide-react';

export default function MediaPlayer({ current, onEnded }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (current?.type === 'radio' && audioRef.current) {
      audioRef.current.load();
      const play = async () => {
        try { await audioRef.current.play(); } catch {}
      };
      play();
    }
  }, [current]);

  return (
    <section id="player" className="mx-auto w-full max-w-5xl px-4 py-6 text-white">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center gap-2 text-white/80">
          {current?.type === 'youtube' ? <Youtube className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
          <span className="text-sm">Now Playing</span>
        </div>
        {!current && (
          <div className="text-white/60">Pick a YouTube track from suggestions or start a radio stream.</div>
        )}
        {current?.type === 'youtube' && (
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <iframe
              title={current.title}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${current.id}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}
        {current?.type === 'radio' && (
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
      </div>
    </section>
  );
}
