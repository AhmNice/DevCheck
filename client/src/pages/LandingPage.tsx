import Cta from "../components/LandingPageComponents/Cta";
import Features from "../components/LandingPageComponents/Features";
import Footer from "../components/LandingPageComponents/Footer";
import Header from "../components/LandingPageComponents/Header";
import Hero from "../components/LandingPageComponents/Hero";

const LandingPage = () => {
  return (
    <div className="bg-[#f8f9fb] max-w-full">
      <Header />
      <Hero />
      <Features />
      <Cta />
      <Footer />
    </div>
  );
};

export default LandingPage;
