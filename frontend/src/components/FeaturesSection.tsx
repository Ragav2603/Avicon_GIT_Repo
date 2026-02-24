import { motion } from "framer-motion";
import { 
  FileSearch, 
  Brain, 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  FileText
} from "lucide-react";

const FeaturesSection = () => {
  const marketplaceFeatures = [
    {
      icon: FileSearch,
      title: "Smart RFP Posting",
      description: "Structured forms capture your exact requirements, from must-haves to budget constraints.",
    },
    {
      icon: Brain,
      title: "AI Verification Engine",
      description: "Our AI analyzes vendor submissions, scoring them against your requirements automatically.",
    },
    {
      icon: Shield,
      title: "Verified Vendors",
      description: "Every vendor is pre-vetted with case studies, API docs, and implementation proof.",
    },
    {
      icon: Zap,
      title: "Rapid Shortlisting",
      description: "Get your top 3 matches in days, not months. Focus on demos, not paperwork.",
    },
  ];

  const adoptionFeatures = [
    {
      icon: BarChart3,
      title: "Adoption Scoring",
      description: "Weighted metrics combine utilization, sentiment, and strategic alignment into one score.",
    },
    {
      icon: TrendingUp,
      title: "ROI Analytics",
      description: "Clear cost-benefit analysis for every tool in your digital stack.",
    },
    {
      icon: Users,
      title: "User Insights",
      description: "Track monthly active users and sentiment across all your operational software.",
    },
    {
      icon: FileText,
      title: "Action Reports",
      description: "Get clear recommendations: Improve, Decommission, or Switch—with reasoning.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="marketplace" className="py-24 lg:py-32 bg-background relative overflow-hidden">
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
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Powerful Tools for{" "}
            <span className="text-primary">Every Stage</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Purpose-built features that power each phase of the Digital Integrity Loop—
            from intelligent vendor matching to long-term adoption tracking.
          </p>
        </motion.div>

        {/* RFP Marketplace Features */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/25">
              <FileSearch className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
              RFP Marketplace
            </h3>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {marketplaceFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-24" />

        {/* Adoption Ops Features */}
        <div id="adoption">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center shadow-lg shadow-warning/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
              Adoption Ops
            </h3>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {adoptionFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-warning/30 transition-all duration-300 hover:shadow-lg hover:shadow-warning/5"
              >
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4 group-hover:bg-warning/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-warning" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
