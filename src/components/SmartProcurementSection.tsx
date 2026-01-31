import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, ArrowRight, Layers } from "lucide-react";

const SmartProcurementSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      
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
              <FileText className="w-4 h-4" />
              Stage 1: Smart Procurement
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Start with Your{" "}
              <span className="gradient-text">Best Data</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Upload your previous RFPs and Proposals. Our AI segments them to draft 
              the perfect requirements, so you don't start from a blank page.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Upload past RFPs, vendor proposals, and contracts",
                "AI extracts key requirements and evaluation criteria",
                "Generate structured, comprehensive new RFPs in minutes",
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
          </motion.div>

          {/* Visual - File Upload Animation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl relative overflow-hidden">
              {/* Upload Zone */}
              <motion.div
                className="border-2 border-dashed border-secondary/30 rounded-xl p-8 mb-6 bg-secondary/5 relative"
                animate={{ borderColor: ["hsl(var(--secondary) / 0.3)", "hsl(var(--secondary) / 0.5)", "hsl(var(--secondary) / 0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex"
                  >
                    <Upload className="w-12 h-12 text-secondary mb-4" />
                  </motion.div>
                  <p className="text-foreground font-medium mb-1">Drop your documents here</p>
                  <p className="text-sm text-muted-foreground">PDFs, Word docs, or spreadsheets</p>
                </div>

                {/* Floating Files Animation */}
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-20 bg-white rounded-lg shadow-lg border border-border flex items-center justify-center"
                  animate={{ y: [0, -5, 0], rotate: [0, 3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <FileText className="w-8 h-8 text-secondary" />
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -left-4 w-14 h-18 bg-white rounded-lg shadow-lg border border-border flex items-center justify-center"
                  animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                >
                  <FileText className="w-6 h-6 text-warning" />
                </motion.div>
              </motion.div>

              {/* Processing Arrow */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex flex-col items-center"
                >
                  <Sparkles className="w-6 h-6 text-secondary mb-2" />
                  <ArrowRight className="w-5 h-5 text-secondary rotate-90" />
                </motion.div>
              </div>

              {/* Structured Output */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Technical Requirements</p>
                    <p className="text-xs text-muted-foreground">12 extracted segments</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Compliance Criteria</p>
                    <p className="text-xs text-muted-foreground">8 mandatory items</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20"
                >
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary">New RFP Ready</p>
                    <p className="text-xs text-secondary/70">Generated in 2 minutes</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SmartProcurementSection;
