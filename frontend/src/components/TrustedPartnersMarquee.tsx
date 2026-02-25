import { useState } from "react";

const partners = [
  { name: "Emirates", logo: "/logos/emirates.png" },
  { name: "Lufthansa", logo: "/logos/lufthansa.png" },
  { name: "Singapore Airlines", logo: "/logos/singaporeair.png" },
  { name: "Qatar Airways", logo: "/logos/qatarairways.png" },
  { name: "British Airways", logo: "/logos/britishairways.png" },
  { name: "Delta", logo: "/logos/delta.png" },
  { name: "Amadeus", logo: "/logos/amadeus.png" },
  { name: "SITA", logo: "/logos/sita.png" },
  { name: "Sabre", logo: "/logos/sabre.png" },
  { name: "Collins Aerospace", logo: "/logos/collinsaerospace.png" },
];

const PartnerLogo = ({ name, logo }: { name: string; logo: string }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="flex items-center gap-3 px-6 py-3 group">
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {!imgFailed ? (
          <img
            src={logo}
            alt={`${name} logo`}
            className="h-14 w-14 object-contain transition-all duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="text-lg font-bold text-muted-foreground">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <p className="font-semibold text-foreground text-sm">{name}</p>
    </div>
  );
};

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
            <PartnerLogo key={`${partner.name}-${index}`} name={partner.name} logo={partner.logo} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedPartnersMarquee;
