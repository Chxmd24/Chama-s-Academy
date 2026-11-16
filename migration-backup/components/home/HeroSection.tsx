import Link from "next/link";
import { ArrowRight, Clock, Activity } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-[#0B1426]"
    >
      {/* Background Stadium Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gold Glow Top Left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-[130px]" />
        {/* Deep Navy/Cyan Light Top Right */}
        <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#1E2D4A]/50 blur-[140px]" />
        {/* Subtle Pitch Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2D4A15_1px,transparent_1px),linear-gradient(to_bottom,#1E2D4A15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Hero Copy & CTA (7 cols) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#111D32] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#D4AF37] uppercase">
                Premier Indoor Sports Stadium
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">&bull;</span>
              <span className="text-slate-300 text-xs hidden sm:inline font-medium">Cricket &amp; Football</span>
            </div>

            {/* Main Headings */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                Where Champions <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]">
                  Train &amp; Play
                </span>
              </h1>
              
              <h2 className="text-lg sm:text-2xl font-semibold text-slate-200">
                Premium Indoor Cricket &amp; Football Experience
              </h2>
            </div>

            {/* Description */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Book your next game at Chama&apos;s Academy. Enjoy professional indoor facilities, 
              exciting matches, and live sports experiences with dedicated scorecards and tournament management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="#booking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-[#0B1426] bg-[#D4AF37] hover:bg-[#E5C358] shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all duration-300 active:scale-95 group"
              >
                <span>Book Your Slot</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="#facilities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#111D32] hover:bg-[#152238] border border-[#1E2D4A] hover:border-[#D4AF37]/50 transition-all duration-300"
              >
                Explore Facilities
              </Link>
            </div>

            {/* Facility Highlights / Value Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1E2D4A]/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37]">100%</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Weatherproof Indoor</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">60 Min</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Minimum Slot Booking</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37]">Live</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Digital Scoreboard</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Visual Stadium Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Decorative Glow Card */}
              <div className="relative rounded-3xl bg-gradient-to-b from-[#1E2D4A] to-[#111D32] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#D4AF37]/30">
                <div className="rounded-[22px] bg-[#0E192D] p-5 sm:p-6 overflow-hidden">
                  
                  {/* Top Bar of the Visual Container */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-white tracking-wide uppercase">
                        Center Arena &bull; Active Turf
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                      Chama&apos;s Match Ground
                    </span>
                  </div>

                  {/* Main Sports Graphic Illustration (Indoor Cricket Focus + Football) */}
                  <div className="relative my-4 aspect-[4/3] rounded-2xl bg-[#091120] border border-[#1E2D4A] flex items-center justify-center overflow-hidden group">
                    
                    {/* Indoor Stadium Lighting Rays */}
                    <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#D4AF37]/15 to-transparent pointer-events-none" />
                    
                    {/* Cricket Pitch Illustration SVG */}
                    <svg
                      className="w-full h-full p-4"
                      viewBox="0 0 400 300"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Indoor Cricket and Football Facility Diagram"
                    >
                      {/* Stadium Turf Floor */}
                      <rect x="20" y="20" width="360" height="260" rx="20" fill="#0C1D2D" stroke="#1E3352" strokeWidth="2" />
                      
                      {/* Football Markings Subtle Overlay */}
                      <circle cx="200" cy="150" r="50" stroke="#1A334B" strokeWidth="1.5" strokeDasharray="4 4" />
                      <line x1="20" y1="150" x2="380" y2="150" stroke="#1A334B" strokeWidth="1.5" strokeDasharray="4 4" />

                      {/* Main Indoor Cricket Pitch (Strip) */}
                      <rect x="150" y="35" width="100" height="230" rx="8" fill="#172F47" stroke="#D4AF37" strokeWidth="1.5" />
                      
                      {/* Bowling Crease Top */}
                      <line x1="160" y1="70" x2="240" y2="70" stroke="#FFFFFF" strokeWidth="2" />
                      <line x1="175" y1="65" x2="225" y2="65" stroke="#D4AF37" strokeWidth="3" />
                      {/* Top Wickets */}
                      <circle cx="190" cy="65" r="2.5" fill="#D4AF37" />
                      <circle cx="200" cy="65" r="2.5" fill="#D4AF37" />
                      <circle cx="210" cy="65" r="2.5" fill="#D4AF37" />

                      {/* Batting Crease Bottom */}
                      <line x1="160" y1="230" x2="240" y2="230" stroke="#FFFFFF" strokeWidth="2" />
                      <line x1="175" y1="235" x2="225" y2="235" stroke="#D4AF37" strokeWidth="3" />
                      {/* Bottom Wickets */}
                      <circle cx="190" cy="235" r="2.5" fill="#D4AF37" />
                      <circle cx="200" cy="235" r="2.5" fill="#D4AF37" />
                      <circle cx="210" cy="235" r="2.5" fill="#D4AF37" />

                      {/* Ball Trajectory Arc */}
                      <path d="M 200 75 Q 220 150 200 225" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" />
                      <circle cx="206" cy="170" r="6" fill="#D4AF37" />

                      {/* Cricket Bat Silhouette */}
                      <path d="M 194 220 L 198 210 L 202 210 L 200 230 Z" fill="#FFFFFF" />

                      {/* Floodlight Beam Indicator */}
                      <polygon points="40,30 140,90 80,140" fill="#D4AF37" fillOpacity="0.04" />
                      <polygon points="360,30 260,90 320,140" fill="#D4AF37" fillOpacity="0.04" />
                    </svg>

                    {/* Overlay Tag */}
                    <div className="absolute bottom-3 left-3 bg-[#0B1426]/90 border border-[#D4AF37]/40 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-xs font-semibold text-white">Indoor Pitch 01 &bull; Ready</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-[#111D32]/90 border border-[#1E2D4A] backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-slate-300">
                      Standard Crease &bull; Pro Turf
                    </div>
                  </div>

                  {/* Dual Sport Badges at Bottom of Card */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111D32] border border-[#1E2D4A]">
                      <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-lg">
                        🏏
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Indoor Cricket</p>
                        <p className="text-[11px] text-slate-400">Limited-Overs &amp; Test</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111D32] border border-[#1E2D4A]">
                      <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-lg">
                        ⚽
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Indoor Football</p>
                        <p className="text-[11px] text-slate-400">Turf Match Field</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Pill: Live Availability */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-[#111D32]/95 border border-[#D4AF37] px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Next Available Slot</p>
                  <p className="text-[11px] text-[#D4AF37]">Slots open 7 days a week</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
