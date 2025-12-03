import { Link } from "react-router-dom";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                Surat<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-secondary-foreground/70 mb-6 max-w-md">
              Platform persuratan digital berbasis AI untuk instansi modern. 
              Kelola surat lebih cerdas, cepat, dan aman.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                <Twitter className="w-5 h-5 text-secondary-foreground/70 hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                <Linkedin className="w-5 h-5 text-secondary-foreground/70 hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                <Github className="w-5 h-5 text-secondary-foreground/70 hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-3">
              {["Fitur", "Harga", "Demo AI", "Dokumentasi", "API"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-3">
              {["Tentang Kami", "Blog", "Karir", "Kontak", "Syarat & Ketentuan", "Kebijakan Privasi"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-sidebar-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} SuratAI. All rights reserved.
          </p>
          <p className="text-sm text-secondary-foreground/50">
            Made with ❤️ in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
