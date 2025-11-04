import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

function BotSuggestion({ onPick }) {
  const suggestions = [
    "Make me a focus playlist with chill synths",
    "Find upbeat pop similar to Dua Lipa",
    "Suggest karaoke-friendly 80s classics",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="text-sm px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! I’m your AI music buddy. Ask me for recommendations, moods, or karaoke picks.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // Simulated AI response for now
    setTimeout(() => {
      const reply = {
        role: "assistant",
        content:
          "Here are three tracks you might like: 1) Starlit Drive — Neon Echoes 2) Lucid Avenue — Night Runner 3) Auralyn — Violet Skies. Want me to queue them?",
      };
      setMessages((m) => [...m, reply]);
      setLoading(false);
    }, 700);
  };

  return (
    <section id="chat" className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-amber-400 text-white">
          <Sparkles size={16} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">AI Music Chat</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur flex flex-col h-[480px]">
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${
                  m.role === "assistant"
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-white/5 dark:to-white/0"
                    : "bg-black/5 dark:bg-white/10 ml-auto"
                } max-w-[85%] md:max-w-[70%] rounded-xl px-3.5 py-2.5`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-white/5 dark:to-white/0 max-w-[85%] md:max-w-[70%] rounded-xl px-3.5 py-2.5">
                <div className="text-sm">Thinking…</div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-black/10 dark:border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for a mood, genre, or karaoke picks"
                className="flex-1 rounded-xl bg-black/5 dark:bg-white/10 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-amber-500 text-white px-3.5 py-2.5 disabled:opacity-60"
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-white/5 backdrop-blur">
          <div className="text-sm text-black/70 dark:text-white/70 mb-2">Try one:</div>
          <BotSuggestion onPick={(s) => sendMessage(s)} />
          <div className="mt-6 text-xs text-black/60 dark:text-white/60">
            The assistant currently runs on-device as a demo. We can hook this to a live backend later for real recommendations and playlists.
          </div>
        </div>
      </div>
    </section>
  );
}
