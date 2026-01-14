import { useState, useEffect } from 'react';
import { getSponsors, type Sponsor } from '@/lib/matchmaking';

export function SponsorMarquee() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    const data = await getSponsors();
    setSponsors(data);
  };

  if (sponsors.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-card/30 border-y border-border/50 py-4">
      <div className="flex animate-marquee">
        {/* Duplicate sponsors for seamless loop */}
        {[...sponsors, ...sponsors].map((sponsor, index) => (
          <a
            key={`${sponsor.id}-${index}`}
            href={sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2 mx-4 bg-background/50 rounded-full hover:bg-primary/10 transition-colors shrink-0"
          >
            {sponsor.icon_url ? (
              <img 
                src={sponsor.icon_url} 
                alt={sponsor.name} 
                className="w-6 h-6 object-contain rounded"
              />
            ) : (
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary">
                {sponsor.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {sponsor.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}