import { motion } from "framer-motion";
import { Target, TrendingUp, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const commitments = [
  { metric: "User Adoption Rate", promised: 85, actual: 92, status: "exceeded" },
  { metric: "Response Time SLA", promised: 200, actual: 180, status: "exceeded", unit: "ms" },
  { metric: "Monthly Active Users", promised: 500, actual: 420, status: "below" },
  { metric: "System Uptime", promised: 99.9, actual: 99.95, status: "exceeded", unit: "%" },
];

const AdoptionROISection = () => {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6">
              <Target className="w-4 h-4" />
              Stage 4: Adoption & ROI
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              The Loop Isn't Closed Until{" "}
              <span className="gradient-text">You Get Value</span>
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
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-secondary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Adoption Ops:</span> Our consultants integrate to track 
                usage against RFP promises—turning vendor claims into verified metrics.
              </p>
            </div>
          </motion.div>

          {/* Visual - Commitment vs Reality Graph */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary to-accent p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Commitment vs Reality</span>
                </div>
                <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                  Q4 2024 Audit
                </span>
              </div>

              {/* Overall Score */}
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Adoption Score</p>
                    <p className="text-3xl font-bold text-foreground">87%</p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "87%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full"
                  />
                </div>
              </div>

              {/* Metrics Comparison */}
              <div className="p-4 space-y-4">
                {commitments.map((item, index) => (
                  <motion.div
                    key={item.metric}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index + 0.4 }}
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
                          {/* Promised line */}
                          <div 
                            className="absolute top-0 h-full w-1 bg-foreground/50 z-10"
                            style={{ left: `${(item.promised / (item.promised * 1.2)) * 100}%` }}
                          />
                          {/* Actual bar */}
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(item.actual / (item.promised * 1.2)) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 * index + 0.5 }}
                            className={`h-full rounded-full ${
                              item.status === "exceeded" 
                                ? "bg-gradient-to-r from-green-400 to-green-500" 
                                : "bg-gradient-to-r from-amber-400 to-amber-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recommendation */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="p-4 bg-green-50 dark:bg-green-950/30 border-t border-green-200 dark:border-green-900"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <span className="font-semibold">Recommendation:</span> Continue engagement. 
                    Schedule utilization review for MAU improvement.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AdoptionROISection;
