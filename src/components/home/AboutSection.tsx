import Link from "next/link";
import { Target, HeartHandshake, Award, Shield, ArrowRight } from "lucide-react";

export default function AboutSection() {
  const pillars = [
    {
      icon: <Target className="w-5 h-5 text-[#D4AF37]" />,
      title: "Passionate Community",
      text: "Bringing indoor cricket and football enthusiasts together in a welcoming, sporting environment.",
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#D4AF37]" />,
      title: "Fair & Organized Play",
      text: "Dedicated umpire management, structured team fixtures, and impartial live match scoring.",
    },
    {
      icon: <Award className="w-5 h-5 text-[#D4AF37]" />,
      title: "Convenient Access",
      text: "Transparent hourly bookings, real-time availability calendar, and rapid reservation confirmations.",
    },
    {
      icon: <Shield className="w-5 h-5 text-[#D4AF37]" />,
      title: "Safety & Standards",
      text: "Well-maintained indoor facilities designed for high-intensity play with player safety as top priority.",
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-[#0B1426] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Story & Mission (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111D32] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
              About Chama&apos;s Academy
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">
                Chama&apos;s Academy
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Chama&apos;s Academy is dedicated to bringing indoor cricket and football enthusiasts together through 
              top-tier sporting facilities, convenient online bookings, and professionally organized competitions.
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Whether you are preparing for competitive tournaments, organizing friendly weekend matches with friends, 
              or tracking team statistics ball by ball, our academy provides the ideal indoor sports arena. 
              Our integrated digital platform connects players, umpires, and administrators for a seamless sporting journey.
            </p>

            {/* Pillar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-4 rounded-2xl bg-[#111D32] border border-[#1E2D4A] hover:border-[#D4AF37]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0B1426] border border-[#D4AF37]/30 flex items-center justify-center">
                      {pillar.icon}
                    </div>
                    <h3 className="font-bold text-white text-sm">{pillar.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{pillar.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="#booking"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:text-[#E5C358] transition-colors group"
              >
                <span>Reserve a session at Chama&apos;s Academy</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Brand Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#1E2D4A] to-[#111D32] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#D4AF37]/30">
              <div className="rounded-[22px] bg-[#0E192D] p-8 text-center space-y-6">
                
                {/* Brand Badge */}
                <div className="mx-auto w-20 h-20 rounded-2xl bg-[#111D32] border-2 border-[#D4AF37] flex items-center justify-center text-3xl font-extrabold text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)]">
                  CA
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-white">Chama&apos;s Academy</h3>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mt-1">
                    Where Champions Train &amp; Play
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#091120] border border-[#1E2D4A] text-left text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E2D4A]">
                    <span className="text-slate-400">Primary Sports:</span>
                    <span className="font-semibold text-white">Cricket &bull; Football</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E2D4A]">
                    <span className="text-slate-400">Access Roles:</span>
                    <span className="font-semibold text-white">Admin &bull; Umpire &bull; User</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Digital Features:</span>
                    <span className="font-semibold text-[#D4AF37]">Live Scorecard &bull; Tournaments</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 italic">
                  &ldquo;Empowering teams with precision facilities and real-time live digital scores.&rdquo;
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
