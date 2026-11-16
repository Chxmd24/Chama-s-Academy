import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface FacilityCardProps {
  id: string;
  badge: string;
  sportIcon: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  graphicType: "cricket" | "football";
}

function FacilityCard({
  badge,
  sportIcon,
  title,
  description,
  features,
  buttonText,
  graphicType,
}: FacilityCardProps) {
  return (
    <div className="group relative rounded-3xl bg-[#111D32] border border-[#1E2D4A] hover:border-[#D4AF37]/70 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden">
      {/* Top Graphic Showcase */}
      <div className="relative aspect-[16/10] bg-[#091120] border-b border-[#1E2D4A] flex items-center justify-center overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1E2D4A_0%,transparent_75%)] opacity-70 group-hover:opacity-100 transition-opacity" />

        {graphicType === "cricket" ? (
          /* Custom Indoor Cricket Graphic */
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <svg
              className="w-48 h-32 opacity-90 group-hover:scale-105 transition-transform duration-500"
              viewBox="0 0 200 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cricket Net Cage Enclosure Outline */}
              <rect x="20" y="15" width="160" height="90" rx="8" stroke="#1E2D4A" strokeWidth="2" strokeDasharray="4 4" />
              {/* Pitch */}
              <rect x="40" y="45" width="120" height="30" rx="4" fill="#152B44" stroke="#D4AF37" strokeWidth="1.5" />
              {/* Creases */}
              <line x1="60" y1="45" x2="60" y2="75" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="140" y1="45" x2="140" y2="75" stroke="#FFFFFF" strokeWidth="2" />
              {/* Stumps */}
              <rect x="52" y="52" width="2" height="16" fill="#D4AF37" />
              <rect x="55" y="52" width="2" height="16" fill="#D4AF37" />
              <rect x="58" y="52" width="2" height="16" fill="#D4AF37" />
              <rect x="142" y="52" width="2" height="16" fill="#D4AF37" />
              <rect x="145" y="52" width="2" height="16" fill="#D4AF37" />
              <rect x="148" y="52" width="2" height="16" fill="#D4AF37" />
              {/* Red Cricket Ball */}
              <circle cx="100" cy="60" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
            </svg>
            <span className="absolute bottom-3 left-4 text-xs font-semibold text-slate-300">
              Pro Indoor Net &amp; Pitch Enclosure
            </span>
          </div>
        ) : (
          /* Custom Indoor Football Graphic */
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <svg
              className="w-48 h-32 opacity-90 group-hover:scale-105 transition-transform duration-500"
              viewBox="0 0 200 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Indoor Football Field */}
              <rect x="20" y="15" width="160" height="90" rx="10" fill="#0C2033" stroke="#1E3352" strokeWidth="2" />
              {/* Center Circle & Line */}
              <line x1="100" y1="15" x2="100" y2="105" stroke="#1E3D5F" strokeWidth="1.5" />
              <circle cx="100" cy="60" r="22" stroke="#1E3D5F" strokeWidth="1.5" fill="none" />
              {/* Penalty Areas */}
              <rect x="20" y="35" width="24" height="50" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <rect x="156" y="35" width="24" height="50" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              {/* Goal Posts */}
              <rect x="16" y="45" width="4" height="30" fill="#FFFFFF" />
              <rect x="180" y="45" width="4" height="30" fill="#FFFFFF" />
              {/* Football */}
              <circle cx="100" cy="60" r="5" fill="#FFFFFF" stroke="#0B1426" strokeWidth="1.5" />
            </svg>
            <span className="absolute bottom-3 left-4 text-xs font-semibold text-slate-300">
              Modern Indoor Turf Arena
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B1426]/90 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-sm">
            {badge}
          </span>
        </div>
        <div className="absolute top-4 right-4 text-2xl">
          {sportIcon}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Checkpoints */}
        <div className="space-y-3 pt-4 border-t border-[#1E2D4A]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Included Facility Features:
          </p>
          <ul className="space-y-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Button */}
        <div className="pt-4">
          <Link
            href="#booking"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-[#152238] hover:bg-[#D4AF37] hover:text-[#0B1426] border border-[#1E2D4A] hover:border-[#D4AF37] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FacilitiesSection() {
  return (
    <section id="facilities" className="py-20 lg:py-28 bg-[#0B1426] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111D32] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">
            World-Class Arenas
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Explore Our Facilities
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Engineered for high performance, maximum safety, and an electric atmosphere. 
            Choose your arena and play under professional indoor floodlighting.
          </p>
        </div>

        {/* Two Premium Facility Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* CARD 1: Indoor Cricket */}
          <FacilityCard
            id="facility-cricket"
            badge="Featured Arena"
            sportIcon="🏏"
            title="Indoor Cricket"
            description="Enjoy exciting indoor cricket matches in a professional environment designed for players of all skill levels."
            features={[
              "Indoor playing area",
              "Team matches",
              "Online booking",
              "Live match scoring",
            ]}
            buttonText="Explore Cricket"
            graphicType="cricket"
          />

          {/* CARD 2: Indoor Football */}
          <FacilityCard
            id="facility-football"
            badge="Turf Stadium"
            sportIcon="⚽"
            title="Indoor Football"
            description="Experience competitive indoor football with friends and teammates in a modern sports environment."
            features={[
              "Indoor football matches",
              "Team competitions",
              "Online booking",
              "Live match scores",
            ]}
            buttonText="Explore Football"
            graphicType="football"
          />

        </div>

      </div>
    </section>
  );
}
