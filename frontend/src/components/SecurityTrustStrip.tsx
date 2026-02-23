import { Shield, CheckCircle, Globe, Lock } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SOC2 Ready",
    description: "Type II Compliant",
  },
  {
    icon: CheckCircle,
    title: "ISO 27001",
    description: "Aligned",
  },
  {
    icon: Globe,
    title: "Data Residency",
    description: "US / EU / AU",
  },
];

const SecurityTrustStrip = () => {
  return (
    <section className="py-12 bg-muted border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Badges */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className="flex items-center gap-3 px-4 py-3 rounded-md bg-card border border-border"
              >
                <badge.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Message */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-md bg-card border border-border">
            <Lock className="w-5 h-5 text-primary shrink-0" />
            <p className="text-muted-foreground text-sm">
              <span className="font-semibold text-foreground">Your data is yours.</span>{" "}
              Never used to train public models.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityTrustStrip;
