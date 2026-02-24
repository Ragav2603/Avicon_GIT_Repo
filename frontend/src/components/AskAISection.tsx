import { useState } from "react";

const aiAssistants = [
  {
    name: "ChatGPT",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    bgColor: "bg-[#10A37F]",
    href: "https://chat.openai.com/?q=As%20a%20proposal%20or%20revenue%20leader%2C%20I%20want%20to%20understand%20why%20Avicon%20is%20the%20leader%20in%20Strategic%20Response%20Management%20(SRM)%20and%20how%20its%20AI%20agents%2C%20centralized%20knowledge%2C%20and%20trusted%20content%20help%20teams%20respond%20faster%2C%20reduce%20risk%2C%20and%20improve%20collaboration.%20Summarize%20the%20highlights%20from%20Avicon%E2%80%99s%20website%3A%20https%3A%2F%2Favicon.lovable.app%2F",
  },
  {
    name: "Claude",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Claude_%28language_model%29_logo.svg",
    bgColor: "bg-[#D97757]",
    href: "https://claude.ai/new?q=As%20a%20proposal%20or%20revenue%20leader%2C%20I%20want%20to%20understand%20why%20Avicon%20is%20the%20leader%20in%20Strategic%20Response%20Management%20(SRM)%20and%20how%20its%20AI%20agents%2C%20centralized%20knowledge%2C%20and%20trusted%20content%20help%20teams%20respond%20faster%2C%20reduce%20risk%2C%20and%20improve%20collaboration.%20Summarize%20the%20highlights%20from%20Avicon%E2%80%99s%20website%3A%20https%3A%2F%2Favicon.lovable.app%2F",
  },
  {
    name: "Perplexity",
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg",
    bgColor: "bg-[#20B2AA]",
    href: "https://www.perplexity.ai/search/new?q=As%20a%20proposal%20or%20revenue%20leader%2C%20I%20want%20to%20understand%20why%20Avicon%20is%20the%20leader%20in%20Strategic%20Response%20Management%20(SRM)%20and%20how%20its%20AI%20agents%2C%20centralized%20knowledge%2C%20and%20trusted%20content%20help%20teams%20respond%20faster%2C%20reduce%20risk%2C%20and%20improve%20collaboration.%20Summarize%20the%20highlights%20from%20Avicon%E2%80%99s%20website%3A%20https%3A%2F%2Favicon.lovable.app%2F",
  },
  {
    name: "Google AI",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
    bgColor: "bg-[#4285F4]",
    href: "https://www.google.com/search?udm=50&aep=11&q=As%20a%20proposal%20or%20revenue%20leader%2C%20I%20want%20to%20understand%20why%20Avicon%20is%20the%20leader%20in%20Strategic%20Response%20Management%20(SRM)%20and%20how%20its%20AI%20agents%2C%20centralized%20knowledge%2C%20and%20trusted%20content%20help%20teams%20respond%20faster%2C%20reduce%20risk%2C%20and%20improve%20collaboration.%20Summarize%20the%20highlights%20from%20Avicon%E2%80%99s%20website%3A%20https%3A%2F%2Favicon.lovable.app%2F",
  },
];

const AskAISection = () => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (aiName: string) => {
    setImageErrors(prev => new Set(prev).add(aiName));
  };

  return (
    <section className="py-16 lg:py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Ask AI about AviCon
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get instant answers about our Strategic Response Management platform from your favorite AI assistant
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {aiAssistants.map((ai) => (
            <a
              key={ai.name}
              href={ai.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-md bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${ai.bgColor} flex items-center justify-center p-2`}>
                {!imageErrors.has(ai.name) ? (
                  <img
                    src={ai.icon}
                    alt={ai.name}
                    loading="lazy"
                    className="w-6 h-6 object-contain brightness-0 invert"
                    onError={() => handleImageError(ai.name)}
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {ai.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="font-medium text-foreground">
                {ai.name}
              </span>
            </a>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Click any AI to learn about AviCon's capabilities, AI agents, and how we help teams win more deals
        </p>
      </div>
    </section>
  );
};

export default AskAISection;
