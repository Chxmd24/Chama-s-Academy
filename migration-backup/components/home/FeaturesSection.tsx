import { ShieldCheck, CalendarCheck, Radio, Users2, Trophy } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />,
      title: "Indoor Cricket & Football",
      description:
        "High-grade indoor turf pitches with professional lighting and all-weather climate comfort 365 days a year.",
    },
    {
      icon: <CalendarCheck className="w-7 h-7 text-[#D4AF37]" />,
      title: "Convenient Online Booking",
      description:
        "Simple hourly slot reservations with live availability calendar and streamlined payment receipt verification.",
    },
    {
      icon: <Radio className="w-7 h-7 text-[#D4AF37]" />,
      title: "Live Match Scores",
      description:
        "Professional digital scoring for cricket and football with live ball-by-ball updates visible to players and fans.",
    },
    {
      icon: <Users2 className="w-7 h-7 text-[#D4AF37]" />,
      title: "Team Competitions",
      description:
        "Build your squad from registered players, compete in friendly match-ups, and track player performance statistics.",
    },
    {
      icon: <Trophy className="w-7 h-7 text-[#D4AF37]" />,
      title: "Tournament Management",
      description:
        "Complete structured tournament tracking featuring group leagues, knockout fixtures, semi-finals, and championship finals.",
    },
  ];

  return (
    <section id="why-us" className="py-20 lg:py-28 bg-[#111D32] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1426] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">
            The Chama&apos;s Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Why Choose Chama&apos;s Academy
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Built by sports enthusiasts for sports enthusiasts. We deliver an unmatched indoor 
            playing experience with modern technology and professional stadium management.
          </p>
        </div>

        {/* 5 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            // Give the last card spanning 2 columns on lg or keep balanced layout
            const isLast = index === 4;
            return (
              <div
                key={feature.title}
                className={`relative rounded-3xl bg-[#0B1426] border border-[#1E2D4A] p-8 hover:border-[#D4AF37]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex flex-col justify-between group ${
                  isLast ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#111D32] border border-[#D4AF37]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#D4AF37] transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1E2D4A]/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-300">
                  <span>Standard Feature</span>
                  <span className="text-[#D4AF37] font-semibold">0{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
