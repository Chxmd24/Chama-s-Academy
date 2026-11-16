"use client";

import { useState } from "react";
import { Radio, ArrowRight, Activity, X } from "lucide-react";

export default function LiveScoresPreview() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="live-scores" className="py-20 lg:py-28 bg-[#0B1426] relative">
      {/* Target for Tournaments link */}
      <div id="tournaments" className="absolute -top-12" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111D32] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Real-Time Match Center
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Follow Every Moment
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Catch real-time ball-by-ball cricket updates and football match scorecards 
            as they happen inside Chama&apos;s Academy.
          </p>
        </div>

        {/* Live Match Preview Grid (2 Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* CARD 1: Cricket Match Preview */}
          <div className="relative rounded-3xl bg-[#111D32] border border-[#1E2D4A] hover:border-[#D4AF37]/60 p-6 sm:p-8 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Header / Match Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-extrabold tracking-wider text-red-400 uppercase">
                  LIVE
                </span>
                <span className="text-slate-500 text-xs">&bull;</span>
                <span className="text-xs font-medium text-slate-400">
                  Chama&apos;s Premier League &bull; T20
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                DEMO PREVIEW
              </span>
            </div>

            {/* Teams & Scores */}
            <div className="py-6 space-y-4">
              {/* Team 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1426] border border-[#1E2D4A] flex items-center justify-center font-bold text-sm text-[#D4AF37]">
                    CS
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Chama Strikers</h4>
                    <p className="text-xs text-slate-400">Batting 1st &bull; 20.0 Overs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-white">168/6</p>
                  <p className="text-xs text-slate-400 font-mono">CRR: 8.40</p>
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1426] border border-[#1E2D4A] flex items-center justify-center font-bold text-sm text-slate-300">
                    AK
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Apex Knights</h4>
                    <p className="text-xs text-[#D4AF37] font-semibold">Chasing &bull; In Play</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-[#D4AF37]">142/4</p>
                  <p className="text-xs text-slate-300 font-mono">16.2 Ov &bull; Req: 7.36</p>
                </div>
              </div>
            </div>

            {/* Active Match Stat Strip */}
            <div className="p-3.5 rounded-xl bg-[#0B1426] border border-[#1E2D4A] flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <div>
                <span className="text-slate-400">Striker: </span>
                <span className="font-semibold text-white">R. Fernando 48* (31)</span>
              </div>
              <div>
                <span className="text-slate-400">Bowler: </span>
                <span className="font-semibold text-white">K. Silva 2/28 (3.2)</span>
              </div>
              <div className="text-[#D4AF37] font-medium w-full sm:w-auto text-right">
                Need 27 runs in 22 balls
              </div>
            </div>

            {/* Footer Tag */}
            <div className="mt-5 pt-4 border-t border-[#1E2D4A] flex items-center justify-between text-xs text-slate-400">
              <span>Indoor Pitch 01 &bull; Center Strip</span>
              <span className="text-slate-500 font-mono">Umpire Live Connected</span>
            </div>
          </div>

          {/* CARD 2: Football Match Preview */}
          <div className="relative rounded-3xl bg-[#111D32] border border-[#1E2D4A] hover:border-[#D4AF37]/60 p-6 sm:p-8 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Header / Match Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-extrabold tracking-wider text-red-400 uppercase">
                  2ND HALF &bull; 38&apos;
                </span>
                <span className="text-slate-500 text-xs">&bull;</span>
                <span className="text-xs font-medium text-slate-400">
                  Indoor Futsal Cup
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                DEMO PREVIEW
              </span>
            </div>

            {/* Teams & Scores */}
            <div className="py-6 space-y-4">
              {/* Team 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1426] border border-[#1E2D4A] flex items-center justify-center font-bold text-sm text-[#D4AF37]">
                    TFC
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Thunder FC</h4>
                    <p className="text-xs text-slate-400">Home Turf &bull; 6 Shots on Target</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-[#D4AF37]">3</p>
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1426] border border-[#1E2D4A] flex items-center justify-center font-bold text-sm text-slate-300">
                    MU
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Metro United</h4>
                    <p className="text-xs text-slate-400">Away &bull; 4 Shots on Target</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-white">2</p>
                </div>
              </div>
            </div>

            {/* Goal Scorer Strip */}
            <div className="p-3.5 rounded-xl bg-[#0B1426] border border-[#1E2D4A] flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span>⚽</span>
                <span>Last Goal: M. Seneviratne (34&apos;)</span>
              </div>
              <div className="text-[#D4AF37] font-medium">
                High-Tempo Turf Match
              </div>
            </div>

            {/* Footer Tag */}
            <div className="mt-5 pt-4 border-t border-[#1E2D4A] flex items-center justify-between text-xs text-slate-400">
              <span>Indoor Arena 02 &bull; Turf Ground</span>
              <span className="text-slate-500 font-mono">Referee System Ready</span>
            </div>
          </div>

        </div>

        {/* View Scores CTA & Disclaimer */}
        <div className="text-center space-y-4">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-[#0B1426] bg-[#D4AF37] hover:bg-[#E5C358] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            <span>View All Live Scores</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            * All displayed scores above are simulated <span className="text-[#D4AF37] font-semibold">DEMO</span> data. 
            Real-time umpire live scoring for cricket and football will be activated in Milestone 6 &amp; 7.
          </p>
        </div>

      </div>

      {/* Modal Notice: Scoring Engine Connecting in Future Stage */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md bg-[#111D32] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.9)] text-center">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-14 h-14 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-5">
              <Activity className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Live Match Center
            </h3>
            
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              The live scoring engine, professional ball-by-ball scorecards, run rate graphs, 
              and real-time Supabase subscriptions will go live in the upcoming scoring engine release.
            </p>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B1426] font-bold rounded-xl transition-colors text-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
