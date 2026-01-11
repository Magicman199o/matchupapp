import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { type Participant, formatWhatsAppLink } from '@/lib/matchmaking';
import { Heart, MessageCircle, Sparkles, User, ArrowRight, ArrowLeft } from 'lucide-react';

interface MatchRevealProps {
  matchedTo: Participant | null;
  matchedBy: Participant | null;
}

export function MatchReveal({ matchedTo, matchedBy }: MatchRevealProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8E8E'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Heart className="w-12 h-12 text-primary animate-heart" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
          🎉 <span className="text-gradient">Matches Revealed!</span> 🎉
        </h2>
        <p className="text-muted-foreground text-lg">Your connections are ready</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Who you matched with */}
        <MatchCard
          title="You Matched With"
          subtitle="Reach out and say hi!"
          icon={<ArrowRight className="w-5 h-5" />}
          participant={matchedTo}
          delay={0}
        />

        {/* Who matched with you */}
        <MatchCard
          title="Matched With You"
          subtitle="Someone picked you!"
          icon={<ArrowLeft className="w-5 h-5" />}
          participant={matchedBy}
          delay={200}
        />
      </div>

      {(!matchedTo && !matchedBy) && (
        <div className="text-center mt-8 p-6 bg-secondary/50 rounded-2xl">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="text-muted-foreground">
            We're still finding matches for you. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}

interface MatchCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  participant: Participant | null;
  delay: number;
}

function MatchCard({ title, subtitle, icon, participant, delay }: MatchCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!participant) {
    return (
      <div 
        className={`bg-gradient-card rounded-3xl p-6 shadow-card border border-border/50 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Waiting for more participants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-gradient-card rounded-3xl p-6 shadow-card border border-border/50 transition-all duration-500 hover:shadow-glow ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-2 text-primary mb-4">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
          <span className="text-3xl font-display font-bold text-primary-foreground">
            {participant.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <h3 className="text-xl font-display font-bold mb-1">{participant.name}</h3>
        <p className="text-sm text-muted-foreground capitalize mb-4">{participant.gender}</p>
        <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
        
        <Button
          variant="hero"
          size="default"
          className="w-full"
          onClick={() => window.open(formatWhatsAppLink(participant.whatsapp), '_blank')}
        >
          <MessageCircle className="w-4 h-4" />
          Message on WhatsApp
        </Button>
      </div>
    </div>
  );
}
