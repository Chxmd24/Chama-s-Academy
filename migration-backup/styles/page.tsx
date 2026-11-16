import Header from "@/components/common/Header";
import HeroSection from "@/components/home/HeroSection";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import BookingPromotion from "@/components/home/BookingPromotion";
import LiveScoresPreview from "@/components/home/LiveScoresPreview";
import FeaturesSection from "@/components/home/FeaturesSection";
import AboutSection from "@/components/home/AboutSection";
import ContactSection from "@/components/home/ContactSection";
import Footer from "@/components/common/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1426] text-white">
      {/* Premium Sticky Navigation Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* Facilities Section */}
        <FacilitiesSection />

        {/* Booking Promotion & Availability Section */}
        <BookingPromotion />

        {/* Live Scores Preview (Cricket & Football) */}
        <LiveScoresPreview />

        {/* Features: Why Choose Chama's Academy */}
        <FeaturesSection />

        {/* About Section */}
        <AboutSection />

        {/* Contact Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
