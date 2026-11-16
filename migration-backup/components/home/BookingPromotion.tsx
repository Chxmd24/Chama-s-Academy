"use client";

import { useState } from "react";
import { Calendar, Clock, CheckCircle, ArrowRight, Sparkles, X } from "lucide-react";

export default function BookingPromotion() {
  const [modalOpen, setModalOpen] = useState(false);

  const steps = [
    {
      number: "01",
      title: "Select Your Sport",
      description: "Choose between our professional indoor cricket pitch or indoor turf football field.",
      icon: "🏏 / ⚽",
    },
    {
      number: "02",
      title: "Choose Date & Time",
      description: "Browse the real-time calendar and select your preferred hourly slots (minimum 1 hour).",
      icon: <Calendar className="w-6 h-6 text-[#D4AF37]" />,
    },
    {
      number: "03",
      title: "Submit Your Booking",
      description: "Upload your bank transfer payment receipt for prompt verification and admin approval.",
      icon: <CheckCircle className="w-6 h-6 text-[#D4AF37]" />,
    },
  ];

  return (
    <section id="booking" className="py-20 lg:py-28 bg-[#111D32] relative overflow-hidden">
      {/* Target for availability header link as well */}
      <div id="availability" className="absolute -top-12" />

      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[25rem] bg-[#D4AF37]/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1426] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Online Reservation System
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Your Game. Your Time.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Reserve your preferred playing time with our convenient online booking system.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl bg-[#0B1426] border border-[#1E2D4A] p-8 hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              {/* Step Number Watermark */}
              <div className="absolute top-4 right-6 text-4xl font-extrabold text-[#1E2D4A]/50 font-mono select-none">
                {step.number}
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-[#111D32] border border-[#D4AF37]/30 flex items-center justify-center mb-6 text-xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1E2D4A]/70 flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
                <span>Step {step.number} of 03</span>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Callout Box: 1-Hour Minimum Booking Duration */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-[#0B1426]/90 border border-[#D4AF37]/40 p-6 sm:p-8 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.4)] text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <span>Important Booking Policy</span>
          </div>

          <p className="text-base sm:text-lg text-white font-medium">
            The minimum booking duration is <span className="text-[#D4AF37] font-bold">one hour (60 minutes)</span>. 
            Consecutive hours can be booked back-to-back for tournaments or extended matches.
          </p>

          <p className="text-xs sm:text-sm text-slate-400">
            Payment receipt uploads and admin verification ensure your slot is protected with zero overlapping reservations.
          </p>

          {/* Prominent "Book Now" Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-base font-bold text-[#0B1426] bg-[#D4AF37] hover:bg-[#E5C358] shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all duration-300 active:scale-95"
            >
              <span>Book Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Modal Notice: Booking Launches in Next Milestone */}
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
              <Calendar className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Online Booking Opening Soon
            </h3>
            
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              The online stadium reservation system, calendar availability selector, and receipt verification workflow 
              are scheduled for deployment in the upcoming development phase.
            </p>

            <div className="p-3 rounded-lg bg-[#0B1426] border border-[#1E2D4A] text-xs text-slate-300 mb-6 text-left space-y-1">
              <p className="font-semibold text-[#D4AF37]">&bull; Minimum Slot Duration: 1 hour</p>
              <p>&bull; Supported Sports: Indoor Cricket &amp; Football</p>
              <p>&bull; Payment: Bank Transfer &amp; Receipt Upload</p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B1426] font-bold rounded-xl transition-colors text-sm"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
