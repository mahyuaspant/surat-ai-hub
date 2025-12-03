import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Mail, Sparkles } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Surat<span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Fitur
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Harga
            </a>
            <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Demo AI
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button variant="hero" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Mulai Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-down">
            <div className="flex flex-col gap-4">
              <a 
                href="#features" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Fitur
              </a>
              <a 
                href="#pricing" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Harga
              </a>
              <a 
                href="#demo" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Demo AI
              </a>
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border/50">
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Masuk</Button>
                </Link>
                <Link to="/auth?mode=register" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Mulai Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
