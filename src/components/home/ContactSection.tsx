"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    }, 4000);
  };

  const contactPlaceholders = [
    {
      icon: <MapPin className="w-6 h-6 text-[#D4AF37]" />,
      label: "Stadium Address",
      value: "Facility location details to be announced prior to launch.",
      status: "Official location details pending",
    },
    {
      icon: <Phone className="w-6 h-6 text-[#D4AF37]" />,
      label: "Phone Contact",
      value: "Official hotline & WhatsApp support to be updated.",
      status: "Support phone numbers pending",
    },
    {
      icon: <Mail className="w-6 h-6 text-[#D4AF37]" />,
      label: "Email Address",
      value: "Official inquiries & booking support email to be added.",
      status: "Domain mailbox pending",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#D4AF37]" />,
      label: "Opening Hours",
      value: "Operating schedule (morning to late night) to be finalized.",
      status: "Schedule announcement pending",
    },
  ];

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#111D32] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1426] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">
            Get in Touch
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Contact Chama&apos;s Academy
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Have questions about slot bookings, tournament registrations, or umpire assignments? 
            Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Official Placeholders (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-4 rounded-2xl bg-[#0B1426] border border-[#D4AF37]/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <p className="text-xs text-slate-300 leading-tight">
                <span className="font-bold text-white">Notice:</span> Official facility address and contact channels 
                will be published upon official stadium opening.
              </p>
            </div>

            <div className="space-y-4">
              {contactPlaceholders.map((item) => (
                <div
                  key={item.label}
                  className="p-5 rounded-2xl bg-[#0B1426] border border-[#1E2D4A] hover:border-[#D4AF37]/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#111D32] border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{item.label}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#111D32] text-slate-400 font-mono">
                          Placeholder
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.value}</p>
                      <p className="text-[11px] text-[#D4AF37]/80 italic">{item.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Inquiry Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#0B1426] border border-[#1E2D4A] p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
              <h3 className="text-xl font-bold text-white mb-2">Send an Inquiry</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Fill out the preview form below. Our management team will connect with you.
              </p>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-[#111D32] border border-[#D4AF37] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto text-[#D4AF37]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Inquiry Received</h4>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Thank you for your interest in Chama&apos;s Academy. This demo inquiry has been registered.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Silva"
                        className="w-full px-4 py-3 rounded-xl bg-[#111D32] border border-[#1E2D4A] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#111D32] border border-[#1E2D4A] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#111D32] border border-[#1E2D4A] text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                    >
                      <option value="General Inquiry">General Facility Inquiry</option>
                      <option value="Cricket Booking">Indoor Cricket Booking</option>
                      <option value="Football Booking">Indoor Football Booking</option>
                      <option value="Tournaments">Tournament Participation</option>
                      <option value="Umpire Role">Umpire / Referee Application</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message or inquiry here..."
                      className="w-full px-4 py-3 rounded-xl bg-[#111D32] border border-[#1E2D4A] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-[#0B1426] bg-[#D4AF37] hover:bg-[#E5C358] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] active:scale-95"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
