import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, File, Loader2, CheckCircle2 } from "lucide-react";

const floatingFiles = [
  { icon: FileText, label: "PDF", x: -60, y: 0, delay: 0 },
  { icon: File, label: "DOCX", x: 0, y: -20, delay: 0.3 },
  { icon: FileSpreadsheet, label: "XLSX", x: 60, y: 0, delay: 0.6 },
  { icon: FileText, label: "CSV", x: 20, y: 20, delay: 0.9 },
];

const extractedQuestions = [
  { text: "What security protocols does your product have?", done: false },
  { text: "What integrations can sync in real-time?", done: true },
  { text: "When does the billing cycle restart?", done: true },
];

const AIExtractionShowcase = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container max-w-3xl mx-auto px-6 text-center">
        {/* Floating file icons */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {floatingFiles.map((f, i) => (
            <motion.div
              key={i}
              className="w-14 h-14 rounded-xl bg-card border border-border shadow-card flex items-center justify-center"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: f.delay,
              }}
              style={{ zIndex: floatingFiles.length - i }}
            >
              <f.icon className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          ))}
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
          Extract questions at scale from any RFP document{" "}
          <span className="text-primary">format</span>
        </h2>

        {/* Subheading */}
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Our AI can generate responses to RFPs from almost any type of file
          teams will send you. Simply upload the text or file, and we will
          extract the questions for you.
        </p>

        {/* Pulsing status badge */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground mb-8"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          EXTRACTING 146 QUESTIONS …
        </motion.div>

        {/* Extracted question cards */}
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          {extractedQuestions.map((q, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 rounded-full bg-card border border-border shadow-card px-5 py-3 text-left"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              {q.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              ) : (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
              )}
              <span className="text-sm italic text-foreground">{q.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIExtractionShowcase;
