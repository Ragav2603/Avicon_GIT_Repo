const partners = [
  { name: "Emirates", type: "airline" },
  { name: "Lufthansa", type: "airline" },
  { name: "Singapore Airlines", type: "airline" },
  { name: "Qatar Airways", type: "airline" },
  { name: "British Airways", type: "airline" },
  { name: "Delta", type: "airline" },
  { name: "Amadeus", type: "vendor" },
  { name: "SITA", type: "vendor" },
  { name: "Sabre", type: "vendor" },
  { name: "Collins Aerospace", type: "vendor" },
];

const TrustedPartnersMarquee = () => {
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-12 bg-background border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mb-6">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Trusted by leading airlines and aviation vendors
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex items-center gap-16 whitespace-nowrap animate-marquee">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex items-center gap-3 px-6 py-3"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">
                  {partner.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{partner.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{partner.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedPartnersMarquee;
