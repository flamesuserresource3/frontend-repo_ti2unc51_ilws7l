import React from 'react';
import { Headphones, Youtube, Bot } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Headphones className="h-6 w-6 text-purple-400" />
          <span className="font-semibold">VibePilot</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <a href="#assistant" className="hover:text-white flex items-center gap-2"><Bot className="h-4 w-4" />Assistant</a>
          <a href="#player" className="hover:text-white flex items-center gap-2"><Youtube className="h-4 w-4" />Player</a>
        </nav>
      </div>
    </header>
  );
}
