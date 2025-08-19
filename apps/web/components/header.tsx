"use client"

import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className="glass-effect rounded-2xl px-6 py-4 flex items-center justify-between border border-primary/20 backdrop-blur-xl bg-white/95 hover:bg-white/98 transition-all duration-300">
        <div className="text-2xl font-bold gradient-text font-serif transition-transform duration-300 cursor-pointer relative group">
          Synoro
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-700 hover:text-primary transition-colors duration-300 relative group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-primary transition-colors duration-300 relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#about" className="text-gray-700 hover:text-primary transition-colors duration-300 relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button className="bg-gradient-to-r from-primary to-accent text-gray-900 font-semibold rounded-xl px-6 py-3 border-2 border-gray-800/20 hover:border-gray-800/40 transition-all duration-300 relative overflow-hidden group backdrop-blur-sm">
            <span className="relative z-10 drop-shadow-sm text-gray-900">Try Free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gray-800/10 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          </Button>
        </div>
      </div>
    </header>
  )
}
