import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Facilities", href: "#facilities" },
    { label: "Book Now", href: "#booking" },
    { label: "Availability", href: "#availability" },
    { label: "Live Scores", href: "#live-scores" },
    { label: "Tournaments", href: "#tournaments" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const sportsLinks = [
    { label: "Indoor Cricket Arena", href: "#facilities" },
    { label: "Indoor Turf Football", href: "#facilities" },
    { label: "Limited-Overs & Test Formats", href: "#facilities" },
    { label: "Ball-by-Ball Live Scoring", href: "#live-scores" },
    { label: "Leagues & Knockout Fixtures", href: "#tournaments" },
  ];

  const socialLinks = [
    { name: "Instagram", href: "#", icon: "📸" },
    { name: "Facebook", href: "#", icon: "🌐" },
    { name: "YouTube", href: "#", icon: "▶️" },
    { name: "X (Twitter)", href: "#", icon: "𝕏" },
  ];

  return (
    <footer className="bg-[#070D18] border-t border-[#1E2D4A] text-slate-300 relative overflow-hidden">
      {/* Top Gold Accent Border Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Col 1: Brand & Tagline (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Logo size="lg" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              &ldquo;Where Champions Train &amp; Play&rdquo;
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Experience premium indoor cricket and football facilities at Chama&apos;s Academy. 
              Book your game, compete with friends, and follow live match scores.
            </p>
            {/* Social Media Placeholders */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Connect With Us
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <span
                    key={social.name}
                    title={social.name}
                    className="w-9 h-9 rounded-xl bg-[#111D32] border border-[#1E2D4A] hover:border-[#D4AF37] hover:text-[#D4AF37] flex items-center justify-center text-sm cursor-pointer transition-all duration-200"
                  >
                    {social.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-l-2 border-[#D4AF37] pl-3">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-slate-600 group-hover:text-[#D4AF37]">&rsaquo;</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Sports & Formats (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-l-2 border-[#D4AF37] pl-3">
              Facilities
            </h4>
            <ul className="space-y-2.5 text-sm">
              {sportsLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 group text-xs sm:text-sm"
                  >
                    <span className="text-slate-600 group-hover:text-[#D4AF37]">&rsaquo;</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Facility Info Placeholders (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-l-2 border-[#D4AF37] pl-3">
              Stadium Hub
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Facility address to be officially announced</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Contact hotline to be announced</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>info@chamasacademy.com (placeholder)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Minimum booking: 1 Hour (60 Min)</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-[#0B1426] border border-[#1E2D4A] text-[11px] text-[#D4AF37]">
                🏟️ Indoor Stadium &bull; Climate Controlled
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-[#1E2D4A] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; 2026 <span className="text-slate-400">Chama&apos;s Academy</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Booking Guidelines</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
