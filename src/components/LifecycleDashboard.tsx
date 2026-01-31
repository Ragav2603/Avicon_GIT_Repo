import { motion } from "framer-motion";
import { FileEdit, Clock, Search, CheckCircle, ArrowRight } from "lucide-react";

const stages = [
  {
    id: "draft",
    label: "Draft",
    icon: FileEdit,
    color: "secondary",
    description: "RFP created, requirements defined",
    count: 3,
  },
  {
    id: "in-progress",
    label: "In-Progress",
    icon: Clock,
    color: "warning",
    description: "Collecting vendor submissions",
    count: 5,
  },
  {
    id: "gap-analysis",
    label: "Gap Analysis",
    icon: Search,
    color: "accent",
    description: "AI verification underway",
    count: 2,
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "secondary",
    description: "Vendor selected, contract signed",
    count: 12,
  },
];

const recentRFPs = [
  { title: "Crew Management System", stage: "gap-analysis", vendor: "AeroTech", score: 94 },
  { title: "Passenger Analytics Platform", stage: "in-progress", submissions: 8 },
  { title: "Maintenance Tracking Software", stage: "completed", vendor: "FlightOps Pro", score: 98 },
];

const LifecycleDashboard = () => {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6">
            Lifecycle Management
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            The Closed Loop{" "}
            <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Track every RFP from draft to completion. We manage the entire lifecycle, 
            not just the introduction.
          </p>
        </motion.div>

        {/* Timeline View */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl border border-border shadow-xl p-8 overflow-hidden">
            {/* Stage Timeline */}
            <div className="relative mb-12">
              {/* Connecting Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-muted hidden md:block" />
              <div className="absolute top-8 left-0 w-3/4 h-1 bg-gradient-to-r from-secondary via-warning to-accent hidden md:block" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index + 0.2 }}
                    className="relative text-center"
                  >
                    {/* Stage Icon */}
                    <div className={`relative z-10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      stage.color === "secondary" ? "bg-secondary text-white" :
                      stage.color === "warning" ? "bg-warning text-white" :
                      "bg-accent text-white"
                    }`}>
                      <stage.icon className="w-7 h-7" />
                      {/* Count Badge */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                        {stage.count}
                      </div>
                    </div>
                    
                    {/* Arrow (hidden on last item) */}
                    {index < stages.length - 1 && (
                      <ArrowRight className="absolute top-8 -right-3 w-6 h-6 text-muted-foreground hidden md:block z-20" />
                    )}
                    
                    <h4 className="font-semibold text-foreground mb-1">{stage.label}</h4>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent RFPs Preview */}
            <div className="border-t border-border pt-8">
              <h4 className="font-semibold text-foreground mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {recentRFPs.map((rfp, index) => (
                  <motion.div
                    key={rfp.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index + 0.4 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        rfp.stage === "completed" ? "bg-green-500" :
                        rfp.stage === "gap-analysis" ? "bg-accent" :
                        "bg-warning"
                      }`} />
                      <div>
                        <h5 className="font-medium text-foreground">{rfp.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {rfp.vendor ? `Selected: ${rfp.vendor}` : `${rfp.submissions} submissions`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rfp.stage === "completed" ? "bg-green-100 text-green-700" :
                        rfp.stage === "gap-analysis" ? "bg-accent/10 text-accent" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {stages.find(s => s.id === rfp.stage)?.label}
                      </span>
                      {rfp.score && (
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {rfp.score}% Match
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">
            See the full picture of your procurement pipeline
          </p>
          <a href="#" className="inline-flex items-center gap-2 text-secondary font-medium hover:underline">
            Explore Dashboard Features
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LifecycleDashboard;
