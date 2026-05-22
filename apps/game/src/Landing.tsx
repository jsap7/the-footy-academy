import Footer from './components/landing/Footer';
import Hero from './components/landing/Hero';
import LandingGamePreview from './components/landing/LandingGamePreview';

export default function Landing() {
  return (
    <div className="scanlines relative min-h-full overflow-y-auto bg-bg text-ink">
      <Hero />
      <LandingGamePreview />
      <Footer />
    </div>
  );
}
