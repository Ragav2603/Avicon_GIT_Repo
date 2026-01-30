import { motion } from "framer-motion";
import { FileSearch, Users, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: FileSearch,
    title: "The Filter",
    subtitle: "Marketplace",
    description: "Stop guessing. Our AI reads your RFP and mathematically validates vendor claims before you even see them.",
    color: "secondary",
    align: "left",
  },
  {
    step: 2,
    icon: Users,
    title: "The Choice",
    subtitle: "Selection",
    description: "Select the perfect partner based on data, not sales pitches. Evidence-backed scoring ensures the right fit.",
    color: "secondary",
    align: "right",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "The Reality Check",
    subtitle: "Adoption Ops",
    description: "Six months later, is it working? We track real-time adoption metrics to prove value or flag issues.",
    color: "warning",
    align: "left",
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "The Loop Closes",
    subtitle: "ROI Verified",
    description: "Adoption data feeds back into future RFPs. Every contract teaches the next procurement cycle.",
    color: "warning",
    align: "right",
  },
];

const ClosedLoopSection = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-warning/5 blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6">
            The Complete Journey
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            The Digital Integrity{" "}
            <span className="gradient-text">Loop</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Procurement doesn't end when a vendor is selected—it ends when ROI is verified. 
            Our closed-loop system ensures every decision drives measurable value.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Central connecting line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <div className="w-full h-full border-l-2 border-dashed border-secondary/30" />
          </div>

          {/* Mobile connecting line */}
          <div className="lg:hidden absolute left-8 top-0 bottom-0 w-px">
            <div className="w-full h-full border-l-2 border-dashed border-secondary/30" />
          </div>

          {/* Steps */}
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative lg:py-8 ${
                  step.align === "left" ? "lg:pr-[52%]" : "lg:pl-[52%]"
                }`}
              >
                {/* Step number badge - Desktop centered */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                      step.color === "secondary" ? "bg-secondary" : "bg-warning"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.step}
                  </motion.div>
                </div>

                {/* Card */}
                <div className="relative ml-16 lg:ml-0">
                  {/* Mobile step number */}
                  <div className="lg:hidden absolute -left-16 top-4 z-20">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm ${
                        step.color === "secondary" ? "bg-secondary" : "bg-warning"
                      }`}
                    >
                      {step.step}
                    </div>
                  </div>

                  <motion.div
                    className={`group p-6 lg:p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-300 ${
                      step.color === "secondary" 
                        ? "hover:border-secondary/30 hover:shadow-secondary/10" 
                        : "hover:border-warning/30 hover:shadow-warning/10"
                    }`}
                    whileHover={{ y: -4 }}
                  >
                    {/* Icon and title row */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          step.color === "secondary" 
                            ? "bg-secondary/10 text-secondary" 
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span
                          className={`text-xs font-medium uppercase tracking-wider ${
                            step.color === "secondary" ? "text-secondary" : "text-warning"
                          }`}
                        >
                          {step.subtitle}
                        </span>
                        <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Connecting arrow indicator for desktop */}
                    {index < steps.length - 1 && (
                      <div 
                        className={`hidden lg:block absolute top-full ${
                          step.align === "left" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
                        } -translate-y-1/2`}
                      >
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          className={step.color === "secondary" ? "text-secondary/40" : "text-warning/40"}
                        >
                          <path 
                            d="M12 4 L12 20 M6 14 L12 20 L18 14" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Loop closure indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-secondary/10 via-warning/10 to-secondary/10 rounded-full border border-secondary/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-secondary">
                <path 
                  d="M12 2 C6.5 2 2 6.5 2 12 C2 17.5 6.5 22 12 22 C17.5 22 22 17.5 22 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                />
                <path d="M22 12 L22 2 L12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold text-foreground">
                The loop continues—every cycle learns from the last
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-warning">
                <path 
                  d="M12 22 C17.5 22 22 17.5 22 12 C22 6.5 17.5 2 12 2 C6.5 2 2 6.5 2 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                />
                <path d="M2 12 L2 22 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClosedLoopSection;
