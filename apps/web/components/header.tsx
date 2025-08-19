"use client";

import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-4 left-1/2 z-50 w-full max-w-6xl -translate-x-1/2 transform px-4">
      <div className="glass-effect border-primary/20 flex items-center justify-between rounded-2xl border bg-white/95 px-6 py-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/98">
        <div className="gradient-text group relative cursor-pointer font-serif text-2xl font-bold transition-transform duration-300">
          Synoro
          <div className="from-primary/20 to-accent/20 absolute -inset-2 -z-10 rounded-xl bg-gradient-to-r opacity-0 blur transition-opacity duration-300 group-hover:opacity-100"></div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="hover:text-primary group relative text-gray-700 transition-colors duration-300"
          >
            Features
            <span className="from-primary to-accent absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#pricing"
            className="hover:text-primary group relative text-gray-700 transition-colors duration-300"
          >
            Pricing
            <span className="from-primary to-accent absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#about"
            className="hover:text-primary group relative text-gray-700 transition-colors duration-300"
          >
            About
            <span className="from-primary to-accent absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button className="from-primary to-accent group relative overflow-hidden rounded-xl border-2 border-gray-800/20 bg-gradient-to-r px-6 py-3 font-semibold text-gray-900 backdrop-blur-sm transition-all duration-300 hover:border-gray-800/40">
            <span className="relative z-10 text-gray-900 drop-shadow-sm">
              Try Free
            </span>
            <div className="from-accent to-primary absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="absolute inset-0 rounded-xl bg-gray-800/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-50"></div>
          </Button>
        </div>
      </div>
    </header>
  );
}
