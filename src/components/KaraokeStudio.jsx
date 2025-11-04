import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Pause, Play, SkipForward, Upload, Volume2 } from "lucide-react";

function parseLRC(text) {
  // Returns array of { time: seconds, line: string }
  const lines = text
    .split(/\r?\n/) 
    .map((l) => l.trim())
    .filter(Boolean);
  const entries = [];
  const timeRe = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]/g;
  for (const l of lines) {
    const content = l.replace(timeRe, "").trim();
    let match;
    while ((match = timeRe.exec(l))) {
      const m = Number(match[1]);
      const s = Number(match[2]);
      const cs = match[3] ? Number(match[3]) : 0;
      const t = m * 60 + s + cs / 100;
      entries.push({ time: t, line: content });
    }
  }
  return entries.sort((a, b) => a.time - b.time);
}

export default function KaraokeStudio() {
  const [audioUrl, setAudioUrl] = useState("");
  const [lyricsRaw, setLyricsRaw] = useState("");
  const [parsed, setParsed] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const audioRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setParsed(parseLRC(lyricsRaw));
  }, [lyricsRaw]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const currentIndex = useMemo(() => {
    if (!audioRef.current || parsed.length === 0) return -1;
    const t = audioRef.current.currentTime;
    let idx = -1;
    for (let i = 0; i < parsed.length; i++) {
      const nextTime = parsed[i + 1]?.time ?? Infinity;
      if (t >= parsed[i].time && t < nextTime) {
        idx = i;
        break;
      }
    }
    return idx;
  }, [parsed, audioRef.current?.currentTime]);

  useEffect(() => {
    if (!listRef.current || currentIndex < 0) return;
    const el = listRef.current.querySelector(`[data-idx="${currentIndex}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentIndex]);

  const onFile = (f) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    setIsPlaying(false);
  };

  const onTimeUpdate = () => {
    // trigger rerender by updating a dummy state if needed
  };

  const jumpTo = (t) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = t + 0.01; // nudge forward
  };

  return (
    <section id="karaoke" className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-amber-400 text-white">
          <Mic size={16} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">Karaoke Studio</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4">
          <div className="text-sm mb-2 font-medium">1) Upload an audio file</div>
          <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="hidden"
            />
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-amber-400 text-white">
              <Upload size={18} />
            </div>
            <div className="text-sm text-center text-black/70 dark:text-white/70">
              Drag & drop or click to choose a song (MP3, WAV, AAC...)
            </div>
          </label>

          {audioUrl && (
            <div className="mt-4">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={onTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full"
              />
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => {
                    if (!audioRef.current) return;
                    if (audioRef.current.paused) audioRef.current.play();
                    else audioRef.current.pause();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-black/90 text-white px-3.5 py-2.5 hover:bg-black"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />} {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={() => {
                    if (!audioRef.current) return;
                    audioRef.current.currentTime += 10;
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-3.5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <SkipForward size={16} /> +10s
                </button>
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <Volume2 size={16} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4 flex flex-col">
          <div className="text-sm mb-2 font-medium">2) Paste LRC lyrics (timestamped)</div>
          <textarea
            value={lyricsRaw}
            onChange={(e) => setLyricsRaw(e.target.value)}
            placeholder={"[00:05.00] Example line\n[00:12.30] Next lyric line"}
            className="min-h-[140px] rounded-xl bg-black/5 dark:bg-white/10 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />

          <div className="mt-4 text-sm text-black/70 dark:text-white/70">3) Click a line to jump</div>
          <div ref={listRef} className="mt-2 flex-1 overflow-y-auto max-h-[240px] rounded-xl bg-black/5 dark:bg-white/10 p-3">
            {parsed.length === 0 ? (
              <div className="text-sm text-black/60 dark:text-white/60">No lyrics yet. Paste LRC above to see synced lines.</div>
            ) : (
              <ul className="space-y-2">
                {parsed.map((row, idx) => (
                  <li
                    key={idx}
                    data-idx={idx}
                    onClick={() => jumpTo(row.time)}
                    className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                      idx === currentIndex
                        ? "bg-gradient-to-r from-purple-500/15 to-blue-500/15 border border-purple-500/30"
                        : "hover:bg-black/10"
                    }`}
                  >
                    <div className="text-xs text-black/50 dark:text-white/50">{new Date(row.time * 1000).toISOString().substring(14, 19)}</div>
                    <div className="leading-relaxed">{row.line || "♪"}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
