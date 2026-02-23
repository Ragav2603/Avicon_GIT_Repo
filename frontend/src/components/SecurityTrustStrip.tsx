import { Shield, CheckCircle, Globe, Lock, Fingerprint } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SOC2 Type II",
    description: "Audit-Ready Controls",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: Fingerprint,
    title: "GDPR Compliant",
    description: "PII Auto-Redaction",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  {
    icon: CheckCircle,
    title: "ISO 27001",
    description: "Aligned Framework",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
  {
    icon: Globe,
    title: "Data Residency",
    description: "US / EU / AU",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${badge.bg} flex items-center justify-center flex-shrink-0`}>
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
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
