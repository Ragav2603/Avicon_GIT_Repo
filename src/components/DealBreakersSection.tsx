import { Shield, CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";

const requirements = [
  { name: "SOC2 Type II Certification", status: "pass", category: "Security" },
  { name: "US Data Residency", status: "pass", category: "Compliance" },
  { name: "GDPR Compliance", status: "pass", category: "Privacy" },
  { name: "ISO 27001 Certification", status: "fail", category: "Security" },
  { name: "24/7 Support SLA", status: "pass", category: "Operations" },
  { name: "API Rate Limit (10k/min)", status: "warning", category: "Technical" },
];

const DealBreakersSection = () => {
  return (
    <section id="deal-breakers" className="py-24 lg:py-32 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual - Compliance Dashboard */}
          <div className="order-2 lg:order-1">
            <div className="bg-card rounded-md border border-border overflow-hidden">
              {/* Dashboard Header */}
              <div className="bg-foreground p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-background" />
                  <span className="text-background font-medium">Compliance Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-background/60">Vendor:</span>
                  <span className="text-sm text-background font-medium">TechCorp Solutions</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 border-b border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-success">4</p>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-destructive">1</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-warning">1</p>
                  <p className="text-xs text-muted-foreground">Warning</p>
                </div>
              </div>

              {/* Requirements List */}
              <div className="p-4 space-y-3">
                {requirements.map((req) => (
                  <div
                    key={req.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      req.status === "pass" 
                        ? "bg-success/10 border-success/30" 
                        : req.status === "fail"
                        ? "bg-destructive/10 border-destructive/30"
                        : "bg-warning/10 border-warning/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {req.status === "pass" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : req.status === "fail" ? (
                        <XCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.category}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                      req.status === "pass" 
                        ? "text-success bg-success/10" 
                        : req.status === "fail"
                        ? "text-destructive bg-destructive/10"
                        : "text-warning bg-warning/10"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Alert Banner */}
              <div className="p-4 bg-destructive/10 border-t border-destructive/30">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">
                    <span className="font-semibold">Deal Breaker Alert:</span> Missing ISO 27001 Certification flagged as mandatory requirement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning/10 text-warning font-medium text-sm mb-6">
              <Shield className="w-4 h-4" />
              Stage 2: The Guardrails
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Never Waste Time on a{" "}
              <span className="text-red-500">No-Go</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Define your red lines—SOC2, US Data Residency, specific certifications. 
              We flag non-compliant vendors instantly so you focus only on qualified candidates.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Set mandatory compliance requirements upfront",
                "Automatic vendor screening against your criteria",
                "Instant alerts for deal-breaker violations",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-warning" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-md bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Result:</span> Airlines report 
                <span className="text-primary font-semibold"> 70% faster evaluation</span> by 
                eliminating non-compliant vendors early in the process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealBreakersSection;
