import React from 'react';
import Spline from '@splinetool/react-spline';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      {/* Soft gradient overlay for contrast, doesn't block interactions */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-6">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
          <Sparkles className="h-4 w-4 text-purple-300" />
          <span className="text-xs text-white/90">AI Voice Agent • Mood-Based Mixes</span>
        </div>
        <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
          Your personal music copilot
        </h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Tell the assistant your mood and instantly get YouTube tracks and live radio stations to match.
        </p>
      </div>
    </section>
  );
}
