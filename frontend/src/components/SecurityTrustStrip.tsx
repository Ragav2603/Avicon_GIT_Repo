import { Shield, CheckCircle, Globe, Lock, Fingerprint } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SOC2 Type II",
    description: "Audit-Ready Controls",
  },
  {
    icon: Fingerprint,
    title: "GDPR Compliant",
    description: "PII Auto-Redaction",
  },
  {
    icon: CheckCircle,
    title: "ISO 27001",
    description: "Aligned Framework",
  },
  {
    icon: Globe,
    title: "Data Residency",
    description: "US / EU / AU",
  },
];

const SecurityTrustStrip = () => {
  return (
    <section
      className="py-10 bg-muted/50 border-y border-border/50"
      aria-label="Security and compliance certifications"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Badges */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <badge.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm leading-tight">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Message */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border/50">
            <Lock className="w-4 h-4 text-primary shrink-0" />
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
