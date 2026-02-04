import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, CheckCircle, XCircle, Plane, Store, ArrowRight } from "lucide-react";

const AIDocumentIntel = () => {
  return (
    <section id="ai-document-intel" className="py-24 lg:py-32 bg-foreground relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="dot-pattern" style={{ height: '100%' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            AI Document Intel
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            From Old Docs to{" "}
            <span className="gradient-text">New Deals</span>
          </h2>
          <p className="text-white/70 text-lg">
            Upload your previous RFPs or proposals. Let our AI extract, match, and draft in minutes.
          </p>
        </motion.div>

        {/* Two-column flow: Airlines & Vendors */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Airlines Flow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card-dark p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Plane className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">For Airlines</h3>
                <p className="text-white/60 text-sm">Upload old RFPs, generate new ones</p>
              </div>
            </div>

            {/* Flow Steps */}
            <div className="space-y-4">
              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Upload Previous RFP</p>
                  <p className="text-white/50 text-sm">PDF, DOCX supported</p>
                </div>
              </motion.div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-accent/40 rotate-90" />
              </div>

              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">AI Extracts Requirements</p>
                  <p className="text-white/50 text-sm">Weights, deadlines, criteria</p>
                </div>
              </motion.div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-accent/40 rotate-90" />
              </div>

              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-accent/10 border border-accent/30"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-accent font-semibold">New RFP Generated</p>
                  <p className="text-accent/70 text-sm">Ready to publish</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Vendors Flow */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card-dark p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Store className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">For Vendors</h3>
                <p className="text-white/60 text-sm">Upload proposals, draft responses</p>
              </div>
            </div>

            {/* Flow Steps */}
            <div className="space-y-4">
              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Upload Past Proposals</p>
                  <p className="text-white/50 text-sm">Your winning pitches</p>
                </div>
              </motion.div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-warning/40 rotate-90" />
              </div>

              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">AI Matches to RFP</p>
                  <p className="text-white/50 text-sm">Gap analysis included</p>
                </div>
              </motion.div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-warning/40 rotate-90" />
              </div>

              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-warning/10 border border-warning/30"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-10 h-10 rounded-lg bg-warning/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-warning font-semibold">Draft Response Ready</p>
                  <p className="text-warning/70 text-sm">Pre-filled & scored</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Go/No-Go Guardrails */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card-dark p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Go/No-Go Guardrails</h3>
            <p className="text-white/60">Automatic compliance checks before you waste time</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "SOC2 Compliance", status: "pass" },
              { label: "Data Residency", status: "pass" },
              { label: "API Integration", status: "pass" },
              { label: "Budget Threshold", status: "fail" },
            ].map((check, index) => (
              <motion.div
                key={check.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  check.status === "pass"
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                {check.status === "pass" ? (
                  <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                )}
                <div>
                  <p className="text-white font-medium text-sm">{check.label}</p>
                  <p className={`text-xs ${check.status === "pass" ? "text-green-400" : "text-red-400"}`}>
                    {check.status === "pass" ? "Passed" : "Failed"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIDocumentIntel;
