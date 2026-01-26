import { motion } from "framer-motion";
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
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what airline executives and vendor partners say about their experience with AviCon.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-background rounded-2xl p-6 lg:p-8 border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
                {/* Quote Icon */}
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                  <Quote className="w-5 h-5 text-secondary" />
                </div>

                {/* Quote Text */}
                <blockquote className="text-foreground/90 text-base lg:text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/40 flex items-center justify-center">
                    <span className="text-secondary font-semibold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    <p className="text-sm text-secondary font-medium">{testimonial.company}</p>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="mt-4 pt-4 border-t border-border">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    testimonial.type === 'airline' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {testimonial.type === 'airline' ? '✈️ Airline Executive' : '🏢 Vendor Partner'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-background rounded-2xl border border-border"
        >
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold text-secondary mb-2">98%</p>
            <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold text-secondary mb-2">150+</p>
            <p className="text-sm text-muted-foreground">Airlines Served</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold text-secondary mb-2">500+</p>
            <p className="text-sm text-muted-foreground">Vendor Partners</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold text-secondary mb-2">$2B+</p>
            <p className="text-sm text-muted-foreground">Deals Facilitated</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
