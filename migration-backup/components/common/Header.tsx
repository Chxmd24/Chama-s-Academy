"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, ShieldCheck } from "lucide-react";
import Logo from "./Logo";

interface NavItem {
  label: string;
  href: string;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Facilities", href: "#facilities" },
  { label: "Book Now", href: "#booking" },
  { label: "Availability", href: "#availability" },
  { label: "Live Scores", href: "#live-scores" },
  { label: "Tournaments", href: "#tournaments" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  // Handle scroll detection for sticky navbar background and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = [
        "home",
        "facilities",
        "booking",
        "availability",
        "live-scores",
        "tournaments",
        "about",
        "contact",
      ];

      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setModalNotice(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const handlePlaceholderClick = (featureName: string) => {
    setModalNotice(featureName);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0B1426]/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)] border-b border-[#1E2D4A]"
            : "bg-[#0B1426]/80 backdrop-blur-sm border-b border-[#1E2D4A]/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* LEFT: Branding */}
            <div className="flex-shrink-0">
              <Logo size="md" />
            </div>

            {/* CENTER: Desktop Navigation Links */}
            <nav
              className="hidden xl:flex items-center space-x-1"
              aria-label="Main Navigation"
            >
              {navItems.map((item) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;

                // For Tournaments & Availability, if separate section exists, scroll; otherwise provide informative notice
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-[#D4AF37] font-semibold bg-[#111D32]"
                        : "text-slate-300 hover:text-white hover:bg-[#111D32]/70"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: Login & Register CTA */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePlaceholderClick("User Login")}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#111D32] rounded-lg transition-colors border border-transparent hover:border-[#1E2D4A]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handlePlaceholderClick("User Registration")}
                className="relative group overflow-hidden px-5 py-2 text-sm font-semibold text-[#0B1426] bg-[#D4AF37] hover:bg-[#E5C358] rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-200 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Register
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex xl:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => handlePlaceholderClick("User Registration")}
                className="sm:hidden px-3 py-1.5 text-xs font-semibold text-[#0B1426] bg-[#D4AF37] rounded-md"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#111D32] border border-[#1E2D4A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0B1426] border-b border-[#1E2D4A] px-4 pt-3 pb-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? "text-[#D4AF37] bg-[#111D32] border-l-4 border-[#D4AF37]"
                        : "text-slate-300 hover:text-white hover:bg-[#111D32]/60"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Actions */}
            <div className="mt-6 pt-5 border-t border-[#1E2D4A] flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handlePlaceholderClick("User Login")}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-200 bg-[#111D32] border border-[#1E2D4A] rounded-lg hover:border-[#D4AF37]/50"
              >
                Login to Account
              </button>
              <button
                type="button"
                onClick={() => handlePlaceholderClick("User Registration")}
                className="w-full py-2.5 text-center text-sm font-bold text-[#0B1426] bg-[#D4AF37] hover:bg-[#E5C358] rounded-lg shadow-md"
              >
                Register for Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Feature Preview Modal for non-implemented actions */}
      {modalNotice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-md bg-[#111D32] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-[0_0_35px_rgba(0,0,0,0.8)] text-center">
            <button
              onClick={() => setModalNotice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{modalNotice}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              This module will be connected in an upcoming milestone. Authentication,
              role assignment (Admin, Umpire, User), and secure profiles are configured in the next phase.
            </p>

            <button
              type="button"
              onClick={() => setModalNotice(null)}
              className="w-full py-2.5 px-4 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B1426] font-semibold rounded-lg transition-colors text-sm"
            >
              Got it, continue exploring
            </button>
          </div>
        </div>
      )}
    </>
  );
}
