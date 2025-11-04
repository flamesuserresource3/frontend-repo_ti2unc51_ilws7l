import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ChatAssistant from "./components/ChatAssistant";
import KaraokeStudio from "./components/KaraokeStudio";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0b0b0c] dark:text-white">
      <Navbar />
      <Hero />
      <ChatAssistant />
      <KaraokeStudio />
      <footer className="border-t border-black/10 dark:border-white/10 py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-sm text-black/60 dark:text-white/60">
          © {new Date().getFullYear()} VibeTune AI — Built for music lovers. This is a demo UI. Add your backend to power real streaming, recommendations, and authentication.
        </div>
      </footer>
    </div>
  );
}
