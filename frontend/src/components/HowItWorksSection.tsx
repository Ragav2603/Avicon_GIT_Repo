import {
  Search,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Users,
  Upload,
  Calculator,
  FileOutput,
  Lightbulb,
  Link2,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  pitch?: string;
  area: string;
  accentClass?: string;
}

const GlowCard = ({ icon, title, description, pitch, area, accentClass = "text-primary" }: GlowCardProps) => (
  <li className={cn("min-h-[14rem] list-none", area)}>
    <div className="relative h-full rounded-2xl border border-border bg-card p-2">
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border border-border bg-background p-6">
        <div className="flex flex-col gap-3">
          <div className={cn("w-fit rounded-lg border border-border p-2.5", accentClass)}>
            {icon}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
          </div>
        </div>
        {pitch && (
          <p className="text-xs font-medium text-primary/80 italic border-t border-border pt-3">
            "{pitch}"
          </p>
        )}
      </div>
    </div>
  </li>
);

const HowItWorksSection = () => {
  const rfpCards = [
    {
      area: "md:[grid-area:1/1/2/7] lg:[grid-area:1/1/2/5]",
      icon: <Search className="w-5 h-5" />,
      title: "RFP Decoding",
      description: "Our LLM scores based on specific evidence, not keywords.",
      pitch: "Don't just read the proposal. Audit it instantly.",
    },
    {
      area: "md:[grid-area:1/7/2/13] lg:[grid-area:1/5/2/9]",
      icon: <TrendingUp className="w-5 h-5" />,
      title: "The Reality Index",
      description: "We use adoption data to inform future RFPs. Know if Vendor A actually delivers on their promises.",
      pitch: "The only platform with real-world performance data.",
    },
    {
      area: "md:[grid-area:2/1/3/7] lg:[grid-area:1/9/2/13]",
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "No More Shelfware",
      description: "Cut evaluation time by 70% using LLM scoring. Ensure you get the ROI you paid for.",
      pitch: "We prevent shelfware before it happens.",
    },
    {
      area: "md:[grid-area:2/7/3/13] lg:[grid-area:2/1/3/7]",
      icon: <RefreshCw className="w-5 h-5" />,
      title: "The Living RFP",
      description: "Transform static PDFs into dynamic scorecards. Vendor scores update in real-time based on adoption metrics.",
      pitch: "Your RFP lives on during the contract.",
    },
    {
      area: "md:[grid-area:3/1/4/13] lg:[grid-area:2/7/3/13]",
      icon: <Users className="w-5 h-5" />,
      title: "Hybrid Model",
      description: "Consultants define 'Adoption Weights.' AI tracks data; consultants interpret the 'Why.' Software proves it worked.",
      pitch: "Pure software can't fix culture. We can.",
    },
  ];

  const adoptionCards = [
    {
      area: "md:[grid-area:1/1/2/7] lg:[grid-area:1/1/2/4]",
      icon: <Upload className="w-5 h-5" />,
      title: "Input Data",
      description: "Enter audit data manually or upload CSV with tool metrics.",
    },
    {
      area: "md:[grid-area:1/7/2/13] lg:[grid-area:1/4/2/7]",
      icon: <Calculator className="w-5 h-5" />,
      title: "Calculate Scores",
      description: "System generates adoption scores for each tool.",
    },
    {
      area: "md:[grid-area:2/1/3/7] lg:[grid-area:1/7/2/10]",
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Get Insights",
      description: "Decision logic determines optimal actions per tool.",
    },
    {
      area: "md:[grid-area:2/7/3/13] lg:[grid-area:1/10/2/13]",
      icon: <FileOutput className="w-5 h-5" />,
      title: "Export Report",
      description: "Download PDF or view dashboard with recommendations.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Simple Steps to <span className="text-primary">Transform Your Ops</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Two integrated journeys that work hand-in-hand. RFP insights inform adoption strategy. Adoption data powers
            smarter RFPs.
          </p>
        </div>

        {/* RFP Journey */}
        <div className="mb-16">
          <h3 className="text-xl lg:text-2xl font-bold text-center text-foreground mb-4">
            RFP Marketplace Journey
          </h3>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From procurement to performance — an intelligent pipeline that evolves with your vendors.
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {rfpCards.map((card) => (
              <GlowCard key={card.title} {...card} />
            ))}
          </ul>
        </div>

        {/* Connection Bridge */}
        <div className="my-16 border-t border-border pt-8">
          <div className="flex items-center justify-center gap-3">
            <Link2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Continuous Feedback Loop</span>
            <Link2 className="w-5 h-5 text-warning" />
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4 max-w-lg mx-auto">
            Adoption metrics feed back into RFP scoring. Every contract teaches the next procurement cycle.
          </p>
        </div>

        {/* Adoption Ops Journey */}
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-center text-foreground mb-4">
            Adoption Ops Journey
          </h3>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Track, measure, and prove the value of every tool you deploy.
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {adoptionCards.map((card) => (
              <GlowCard key={card.title} {...card} accentClass="text-warning" />
            ))}
          </ul>

          {/* Feedback note */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-muted rounded-full border border-border">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Adoption data flows back to power <span className="font-semibold text-primary">Reality Index</span>{" "}
                scoring
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
