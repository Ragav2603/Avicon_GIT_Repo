import { Upload, FileText, Sparkles, CheckCircle, XCircle, Plane, Store, ArrowRight } from "lucide-react";

const AIDocumentIntel = () => {
  return (
    <section id="ai-document-intel" className="py-24 lg:py-32 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            AI Document Intel
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            From Old Docs to <span className="text-primary">New Deals</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Upload your previous RFPs or proposals. Let our AI extract, match, and draft in minutes.
          </p>
        </div>

        {/* Two-column flow: Airlines & Vendors */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Airlines Flow */}
          <div className="bg-card border border-border rounded-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Plane className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">For Airlines</h3>
                <p className="text-muted-foreground text-sm">Upload old RFPs, generate new ones</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-md bg-muted border border-border">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Upload Previous RFP</p>
                  <p className="text-muted-foreground text-sm">PDF, DOCX supported</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-accent/40 rotate-90" />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-md bg-muted border border-border">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">AI Extracts Requirements</p>
                  <p className="text-muted-foreground text-sm">Weights, deadlines, criteria</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-accent/40 rotate-90" />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-md bg-accent/10 border border-accent/30">
                <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-accent font-semibold">New RFP Generated</p>
                  <p className="text-accent/70 text-sm">Ready to publish</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendors Flow */}
          <div className="bg-card border border-border rounded-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Store className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">For Vendors</h3>
                <p className="text-muted-foreground text-sm">Upload proposals, draft responses</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-md bg-muted border border-border">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Upload Past Proposals</p>
                  <p className="text-muted-foreground text-sm">Your winning pitches</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-warning/40 rotate-90" />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-md bg-muted border border-border">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">AI Matches to RFP</p>
                  <p className="text-muted-foreground text-sm">Gap analysis included</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-warning/40 rotate-90" />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-md bg-warning/10 border border-warning/30">
                <div className="w-10 h-10 rounded-lg bg-warning/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-warning font-semibold">Draft Response Ready</p>
                  <p className="text-warning/70 text-sm">Pre-filled & scored</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Go/No-Go Guardrails */}
        <div className="bg-card border border-border rounded-md p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Go/No-Go Guardrails</h3>
            <p className="text-muted-foreground">Automatic compliance checks before you waste time</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "SOC2 Compliance", status: "pass" },
              { label: "Data Residency", status: "pass" },
              { label: "API Integration", status: "pass" },
              { label: "Budget Threshold", status: "fail" },
            ].map((check) => (
              <div
                key={check.label}
                className={`p-4 rounded-md border flex items-center gap-3 ${
                  check.status === "pass"
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                    : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                }`}
              >
                {check.status === "pass" ? (
                  <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                )}
                <div>
                  <p className="text-foreground font-medium text-sm">{check.label}</p>
                  <p className={`text-xs ${check.status === "pass" ? "text-green-600" : "text-red-500"}`}>
                    {check.status === "pass" ? "Passed" : "Failed"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDocumentIntel;
