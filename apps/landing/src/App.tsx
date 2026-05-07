import CTA from './components/CTA';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Loop from './components/Loop';
import Roadmap from './components/Roadmap';
import Ticker from './components/Ticker';

export default function App() {
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
