import React, { useEffect, useState } from 'react';
import { Radio, Play } from 'lucide-react';

export default function RadioDirectory({ onPlay }) {
  const [radios, setRadios] = useState([]);
  const backend = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${backend}/api/radios`);
        const data = await res.json();
        setRadios(data.radios || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, [backend]);

  return (
    <section id="radios" className="mx-auto w-full max-w-5xl px-4 py-6 text-white">
      <div className="mb-3 flex items-center gap-2 text-white/80">
        <Radio className="h-5 w-5" />
        <span className="text-sm">Live Radios</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {radios.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-white/60">{r.genre} • {r.country}</div>
            </div>
            <button onClick={() => onPlay({ type: 'radio', stream_url: r.stream_url, title: r.name })} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm hover:bg-purple-500">
              <Play className="h-4 w-4" /> Play
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
