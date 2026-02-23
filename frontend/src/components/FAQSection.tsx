import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the AI extract questions from RFP documents?",
    a: "Our AI uses advanced natural language processing to parse uploaded documents — whether PDF, Word, Excel, or CSV — and identify every question or requirement. It then structures them into a clean, editable list you can review and respond to.",
  },
  {
    q: "What file formats are supported for upload?",
    a: "We support all common document formats including PDF, DOCX, XLSX, CSV, and plain text files. Our extraction engine handles complex layouts, tables, and multi-page documents automatically.",
  },
  {
    q: "How accurate is the AI-powered scoring?",
    a: "Our scoring engine achieves over 90% alignment with human evaluators in benchmark tests. It evaluates proposals against weighted criteria, flags deal-breakers, and provides transparent reasoning for every score.",
  },
  {
    q: "Can I invite vendors directly from the platform?",
    a: "Yes. You can invite vendors via secure magic links or email invitations. Vendors receive a branded portal to review the RFP requirements and submit their proposals — no account creation required.",
  },
  {
    q: "Is my data secure on the platform?",
    a: "Absolutely. All data is encrypted at rest and in transit. We follow enterprise-grade security practices including role-based access control, audit logging, and SOC 2-aligned policies.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question? Here are the answers to our most frequently asked
            questions. If you don't find what you're looking for make sure to{" "}
            <a
              href="#contact"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              contact us
            </a>
            .
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
