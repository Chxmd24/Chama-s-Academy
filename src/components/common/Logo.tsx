import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const badgeSizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const subTextSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-xs",
  };

  return (
    <Link
      href="#home"
      className={`group flex items-center gap-3 transition-opacity hover:opacity-95 ${className}`}
      aria-label="Chama's Academy - Home"
    >
      {/* Monogram Badge */}
      <div
        className={`${badgeSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1E2D4A] to-[#111D32] border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300`}
      >
        <span className="font-extrabold tracking-wider text-[#D4AF37]">CA</span>
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D4AF37]" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span
          className={`${textSizes[size]} font-bold tracking-tight text-white group-hover:text-slate-100 transition-colors leading-none`}
        >
          Chama&apos;s <span className="text-[#D4AF37]">Academy</span>
        </span>
        <span
          className={`${subTextSizes[size]} font-medium tracking-widest uppercase text-slate-400 mt-1 leading-none`}
        >
          Indoor Stadium
        </span>
      </div>
    </Link>
  );
}
