import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhyYoullLoveIt from "@/components/WhyYoullLoveIt";
import FeatureHighlights from "@/components/FeatureHighlights";
import Testimonial from "@/components/Testimonial";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyYoullLoveIt />
      <FeatureHighlights />
      <Testimonial />
      <CTA />
      <Footer />
    </main>
  );
}
