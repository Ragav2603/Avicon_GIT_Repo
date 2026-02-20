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
  ArrowRight,
  Link2,
} from "lucide-react";

const HowItWorksSection = () => {
  const rfpSteps = [
    {
      step: 1,
      icon: Search,
      title: "RFP Decoding",
      description: "Our LLM scores based on specific evidence, not keywords.",
      pitch: "Don't just read the proposal. Audit it instantly.",
    },
    {
      step: 2,
      icon: TrendingUp,
      title: "The Reality Index",
      description: "We use adoption data to inform future RFPs. Know if Vendor A actually delivers on their promises.",
      pitch: "The only platform with real-world performance data.",
    },
    {
      step: 3,
      icon: ShieldCheck,
      title: "No More Shelfware",
      description: "Cut evaluation time by 70% using LLM scoring. Ensure you get the ROI you paid for.",
      pitch: "We prevent shelfware before it happens.",
    },
    {
      step: 4,
      icon: RefreshCw,
      title: "The Living RFP",
      description:
        "Transform static PDFs into dynamic scorecards. Vendor scores update in real-time based on adoption metrics.",
      pitch: "Your RFP lives on during the contract.",
    },
    {
      step: 5,
      icon: Users,
      title: "Hybrid Model",
      description:
        "Consultants define 'Adoption Weights.' AI tracks data; consultants interpret the 'Why.' Software proves it worked.",
      pitch: "Pure software can't fix culture. We can.",
    },
  ];

  const adoptionSteps = [
    {
      step: 1,
      icon: Upload,
      title: "Input Data",
      description: "Enter audit data manually or upload CSV with tool metrics.",
    },
    {
      step: 2,
      icon: Calculator,
      title: "Calculate Scores",
      description: "System generates adoption scores for each tool.",
    },
    {
      step: 3,
      icon: Lightbulb,
      title: "Get Insights",
      description: "Decision logic determines optimal actions per tool.",
    },
    {
      step: 4,
      icon: FileOutput,
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {rfpSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="bg-card rounded-md p-6 border border-border h-full flex flex-col">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>

                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>

                  <h4 className="text-lg font-semibold text-foreground mb-2">{step.title}</h4>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">{step.description}</p>

                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-medium text-primary italic">"{step.pitch}"</p>
                  </div>
                </div>

                {index < rfpSteps.length - 1 && (
                  <div className="hidden xl:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
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

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border hidden lg:block" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {adoptionSteps.map((step) => (
                <div key={step.title} className="relative">
                  <div className="bg-card rounded-md p-6 border border-border relative z-10">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>

                    <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                      <step.icon className="w-7 h-7 text-warning" />
                    </div>

                    <h4 className="text-lg font-semibold text-foreground mb-2">{step.title}</h4>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
