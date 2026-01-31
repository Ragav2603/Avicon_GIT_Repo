import { motion } from "framer-motion";
import { FileText, Shield, Zap, TrendingUp, ArrowRight } from "lucide-react";

const stages = [
  {
    number: 1,
    title: "AI Drafting",
    description: "Upload Old Docs → New RFP",
    icon: FileText,
    color: "secondary",
  },
  {
    number: 2,
    title: "Guardrails",
    description: "Deal Breakers → Compliance",
    icon: Shield,
    color: "accent",
  },
  {
    number: 3,
    title: "Integration",
    description: "Vendor Selected → Live",
    icon: Zap,
    color: "warning",
  },
  {
    number: 4,
    title: "Adoption & ROI",
    description: "Track & Prove Value",
    icon: TrendingUp,
    color: "secondary",
  },
];

const SmartProcurementSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6">
            <Zap className="w-4 h-4" />
            The Differentiator
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            One <span className="gradient-text">Closed Loop</span> for Everything
          </h2>
        </motion.div>

        {/* Process Flow */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-secondary via-accent to-warning"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {/* Stages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {stages.map((stage, index) => {
              const IconComponent = stage.icon;
              const colorClasses = {
                secondary: {
                  bg: "bg-secondary/10",
                  border: "border-secondary/20",
                  icon: "bg-secondary text-secondary-foreground",
                  number: "text-secondary",
                  glow: "group-hover:shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.4)]",
                },
                accent: {
                  bg: "bg-accent/10",
                  border: "border-accent/20",
                  icon: "bg-accent text-accent-foreground",
                  number: "text-accent",
                  glow: "group-hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.4)]",
                },
                warning: {
                  bg: "bg-warning/10",
                  border: "border-warning/20",
                  icon: "bg-warning text-warning-foreground",
                  number: "text-warning",
                  glow: "group-hover:shadow-[0_0_30px_-5px_hsl(var(--warning)/0.4)]",
                },
              };
              const colors = colorClasses[stage.color as keyof typeof colorClasses];

              return (
                <motion.div
                  key={stage.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="relative group"
                >
                  {/* Card */}
                  <div
                    className={`relative bg-card rounded-2xl border ${colors.border} p-6 transition-all duration-300 ${colors.glow} hover:-translate-y-1`}
                  >
                    {/* Stage Number Badge */}
                    <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center text-sm font-bold shadow-lg`}>
                      {stage.number}
                    </div>

                    {/* Icon */}
                    <motion.div
                      className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <IconComponent className={`w-7 h-7 ${colors.number}`} />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {stage.description}
                    </p>

                    {/* Animated Arrow - Desktop only, not on last */}
                    {index < stages.length - 1 && (
                      <motion.div
                        className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border items-center justify-center"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    )}
                  </div>

                  {/* Mobile Arrow */}
                  {index < stages.length - 1 && (
                    <motion.div
                      className="lg:hidden flex justify-center py-4"
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Loop indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-muted/50 border border-border">
            <motion.div
              className="w-2 h-2 rounded-full bg-secondary"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-muted-foreground font-medium">
              Continuous improvement cycle
            </span>
            <motion.div
              className="w-2 h-2 rounded-full bg-warning"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartProcurementSection;
