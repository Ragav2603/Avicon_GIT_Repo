import { motion } from "framer-motion";
import { Shield, Check, X, AlertTriangle, Lock, FileCheck, UserCheck } from "lucide-react";

const requirements = [
  { id: 1, name: "SOC2 Type II Compliance", status: "pass", critical: true },
  { id: 2, name: "99.9% SLA Guarantee", status: "pass", critical: true },
  { id: 3, name: "API Integration Capability", status: "pass", critical: false },
  { id: 4, name: "24/7 Support Coverage", status: "pass", critical: false },
  { id: 5, name: "Data Residency (EU)", status: "fail", critical: true },
  { id: 6, name: "GDPR Compliance", status: "pass", critical: true },
  { id: 7, name: "Single Sign-On (SSO)", status: "pass", critical: false },
  { id: 8, name: "On-Premise Deployment", status: "fail", critical: false },
];

const GoNoGoSection = () => {
  const passCount = requirements.filter(r => r.status === "pass").length;
  const failCount = requirements.filter(r => r.status === "fail").length;
  const criticalFail = requirements.some(r => r.status === "fail" && r.critical);

  return (
    <section className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 text-destructive font-medium text-sm mb-6">
              <Shield className="w-4 h-4" />
              Deal Breaker Protection
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              The Go/No-Go{" "}
              <span className="gradient-text">Guardrails</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Set your deal breakers. We flag the risks automatically so you never 
              waste time on non-compliant vendors. Critical requirements are checked 
              instantly—saving weeks of manual verification.
            </p>

            {/* Key Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Mandatory Requirements</h4>
                  <p className="text-sm text-muted-foreground">Mark requirements as critical—auto-reject vendors who don't meet them.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Evidence Verification</h4>
                  <p className="text-sm text-muted-foreground">AI validates certifications, SLAs, and compliance documentation.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Instant Shortlisting</h4>
                  <p className="text-sm text-muted-foreground">Only qualified vendors reach your review queue.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl border border-border shadow-xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Vendor Compliance Check</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">VendorTech Solutions</span>
                    {criticalFail ? (
                      <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Risk Flagged
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        All Clear
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements List */}
              <div className="p-4 space-y-2">
                {requirements.map((req, index) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      req.status === "pass" 
                        ? "bg-green-50 border border-green-200" 
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {req.status === "pass" ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${
                        req.status === "pass" ? "text-green-800" : "text-red-800"
                      }`}>
                        {req.name}
                      </span>
                    </div>
                    {req.critical && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        req.status === "pass" 
                          ? "bg-green-200 text-green-800" 
                          : "bg-red-200 text-red-800"
                      }`}>
                        Critical
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm text-muted-foreground">{passCount} Passed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm text-muted-foreground">{failCount} Failed</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-destructive">
                    {criticalFail ? "⚠️ Critical Requirements Not Met" : "✓ Ready for Review"}
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-secondary text-white shadow-lg shadow-secondary/30"
            >
              <span className="text-sm font-medium">Saves 40+ hours per RFP</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GoNoGoSection;
