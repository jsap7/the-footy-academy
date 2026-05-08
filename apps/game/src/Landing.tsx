import CTA from './components/landing/CTA';
import Features from './components/landing/Features';
import Footer from './components/landing/Footer';
import Hero from './components/landing/Hero';
import Loop from './components/landing/Loop';
import Roadmap from './components/landing/Roadmap';
import Ticker from './components/landing/Ticker';

export default function Landing() {
  return (
    <div className="scanlines relative min-h-full bg-bg text-ink">
      <Hero />
      <Ticker />
      <Loop />
      <Features />
      <Roadmap />
      <CTA />
      <Footer />
    </div>
  );
}
