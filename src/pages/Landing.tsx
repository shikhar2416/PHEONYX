import Hero from '@/components/landing/Hero';
import StatsStrip from '@/components/landing/StatsStrip';
import ProblemCards from '@/components/landing/ProblemCards';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureBento from '@/components/landing/FeatureBento';
import SectionShowcase from '@/components/landing/SectionShowcase';
import FAQ from '@/components/landing/FAQ';

export default function Landing() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <StatsStrip />
      <ProblemCards />
      <HowItWorks />
      <FeatureBento />
      <SectionShowcase />
      <FAQ />
    </div>
  );
}
