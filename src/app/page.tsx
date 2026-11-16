export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Top Navigation Bar Placeholder */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
            CA
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">
            Chama&apos;s Academy
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Initialized
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto my-auto text-center py-16 sm:py-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-slate-800/70 text-slate-300 border border-slate-700/60 mb-8 backdrop-blur-sm">
          🏏 Cricket &bull; ⚽ Football &bull; 🏟️ Indoor Facility
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          Chama&apos;s Academy
        </h1>

        <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-emerald-400 mb-6">
          Indoor Cricket &amp; Football Stadium
        </p>

        <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed mb-10">
          Welcome to Chama&apos;s Academy. The ultimate destination for indoor cricket and football.
          Full stadium management, online slot booking, real-time match scoring, tournaments, and analytics coming soon.
        </p>

        {/* Status / Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm mb-1">Indoor Cricket</h3>
            <p className="text-xs text-slate-400">
              Limited-overs &amp; Test match formats with professional ball-by-ball live scoring.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm mb-1">Indoor Football</h3>
            <p className="text-xs text-slate-400">
              High-intensity turf football with live match tracking and league management.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm mb-1">Stadium Booking</h3>
            <p className="text-xs text-slate-400">
              Online availability calendar, hourly slot reservations, and receipt verification.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; 2026 Chama&apos;s Academy. All rights reserved.</p>
        <p>Next.js &bull; TypeScript &bull; Tailwind CSS &bull; Supabase</p>
      </footer>
    </main>
  );
}
