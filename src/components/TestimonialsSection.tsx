import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "AviCon transformed our vendor selection process. What used to take months now takes weeks, with better outcomes and complete transparency.",
    name: "Sarah Mitchell",
    title: "Chief Digital Officer",
    company: "Emirates Airlines",
    type: "airline" as const,
  },
  {
    quote: "The AI-powered matching connected us with airlines we never would have reached otherwise. Our win rate increased by 40% in the first year.",
    name: "Marcus Chen",
    title: "VP of Business Development",
    company: "AeroTech Solutions",
    type: "vendor" as const,
  },
  {
    quote: "Finally, a platform that understands aviation procurement. The adoption audits gave us actionable insights that drove real ROI.",
    name: "Dr. Klaus Weber",
    title: "Head of Innovation",
    company: "Lufthansa Group",
    type: "airline" as const,
  },
  {
    quote: "As a vendor, visibility into airline needs has always been our biggest challenge. AviCon solved that completely.",
    name: "Priya Sharma",
    title: "CEO",
    company: "FlightOps Digital",
    type: "vendor" as const,
  },
  {
    quote: "The consultant network on AviCon helped us navigate complex digital transformations with confidence and measurable results.",
    name: "James Rodriguez",
    title: "Director of Operations",
    company: "Qatar Airways",
    type: "airline" as const,
  },
  {
    quote: "Our partnership with AviCon opened doors to major airlines across three continents. It's been transformative for our growth.",
    name: "Elena Volkov",
    title: "Chief Strategy Officer",
    company: "SkyConnect Systems",
    type: "vendor" as const,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what airline executives and vendor partners say about their experience with AviCon.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name}>
              <div className="h-full bg-card rounded-md p-6 lg:p-8 border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Quote className="w-5 h-5 text-primary" />
                </div>

                <blockquote className="text-foreground/90 text-base lg:text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    testimonial.type === 'airline' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-success/10 text-success'
                  }`}>
                    {testimonial.type === 'airline' ? 'Airline Executive' : 'Vendor Partner'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-card rounded-md border border-border">
          {[
            { value: "98%", label: "Customer Satisfaction" },
            { value: "150+", label: "Airlines Served" },
            { value: "500+", label: "Vendor Partners" },
            { value: "$2B+", label: "Deals Facilitated" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold font-mono text-primary mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
