import { Target, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";

const commitments = [
  { metric: "User Adoption Rate", promised: 85, actual: 92, status: "exceeded" },
  { metric: "Response Time SLA", promised: 200, actual: 180, status: "exceeded", unit: "ms" },
  { metric: "Monthly Active Users", promised: 500, actual: 420, status: "below" },
  { metric: "System Uptime", promised: 99.9, actual: 99.95, status: "exceeded", unit: "%" },
];

const AdoptionROISection = () => {
  return (
    <section id="adoption" className="py-24 lg:py-32 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Target className="w-4 h-4" />
              Stage 4: Adoption & ROI
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              The Loop Isn't Closed Until{" "}
              <span className="text-primary">You Get Value</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Contracts promise ROI. We prove it. We integrate with your new tools to track 
              actual adoption scores and audit if the vendor met their RFP commitments.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Track real-world usage against vendor promises",
                "Automated adoption scoring with weighted metrics",
                "Clear recommendations: Improve, Decommission, or Switch",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-md bg-muted border border-border">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Adoption Ops:</span> Our consultants integrate to track 
                usage against RFP promises—turning vendor claims into verified metrics.
              </p>
            </div>
          </div>

          {/* Visual - Commitment vs Reality Graph */}
          <div>
            <div className="bg-card rounded-md border border-border overflow-hidden">
              {/* Header */}
              <div className="bg-primary p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                  <span className="text-primary-foreground font-medium">Commitment vs Reality</span>
                </div>
                <span className="text-xs text-primary-foreground/80 bg-primary-foreground/20 px-2 py-1 rounded-full">
                  Q4 2024 Audit
                </span>
              </div>

              {/* Overall Score */}
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Adoption Score</p>
                    <p className="text-3xl font-bold font-mono text-foreground">87%</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{ width: "87%" }} />
                </div>
              </div>

              {/* Metrics Comparison */}
              <div className="p-4 space-y-4">
                {commitments.map((item) => (
                  <div
                    key={item.metric}
                    className="p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{item.metric}</p>
                      {item.status === "exceeded" ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          EXCEEDED
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                          BELOW TARGET
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Promised: {item.promised}{item.unit || ""}</span>
                          <span>Actual: {item.actual}{item.unit || ""}</span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 h-full w-1 bg-foreground/50 z-10"
                            style={{ left: `${(item.promised / (item.promised * 1.2)) * 100}%` }}
                          />
                          <div
                            className={`h-full rounded-full ${
                              item.status === "exceeded" ? "bg-green-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${(item.actual / (item.promised * 1.2)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border-t border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <span className="font-semibold">Recommendation:</span> Continue engagement. 
                    Schedule utilization review for MAU improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdoptionROISection;
