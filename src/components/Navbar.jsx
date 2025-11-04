import { Music, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/50 dark:bg-black/40 border-b border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-amber-400 text-white shadow-sm">
            <Music size={18} />
          </span>
          <span>VibeTune AI</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#home" className="hover:text-purple-600 transition-colors">Home</a>
          <a href="#chat" className="hover:text-purple-600 transition-colors flex items-center gap-1">
            <Sparkles size={16} /> Chat
          </a>
          <a href="#karaoke" className="hover:text-purple-600 transition-colors">Karaoke</a>
        </nav>
      </div>
    </header>
  );
}
