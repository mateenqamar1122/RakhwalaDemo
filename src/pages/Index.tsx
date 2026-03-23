import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ValuationTool from "@/components/ValuationTool";
import PropertiesSection from "@/components/PropertiesSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorks from "@/components/HowItWorks";
import ConsultancySection from "@/components/ConsultancySection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <ValuationTool />
      <PropertiesSection />
      <ServicesSection />
      <HowItWorks />
      <ConsultancySection />
      <Footer />
    </div>
  );
};

export default Index;
