import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 tracking-tight">
            Ready to Transform Your Procurement?
          </h2>

          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join leading airlines who are already saving weeks on every RFP 
            with AI-assisted procurement and verified vendor matching.
          </p>

          <Button 
            variant="outline" 
            size="lg" 
            className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-primary-foreground"
          >
            Request Access
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-primary-foreground/20">
            {[
              { value: "70%", label: "Faster Evaluation Time" },
              { value: "3x", label: "Better ROI Tracking" },
              { value: "Zero", label: "Shelfware Purchases" },
              { value: "100%", label: "Adoption Visibility" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold font-mono text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
