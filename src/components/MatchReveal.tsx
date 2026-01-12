import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProfileView } from '@/components/ProfileView';
import { type Participant, formatWhatsAppLink } from '@/lib/matchmaking';
import { Heart, MessageCircle, Sparkles, User } from 'lucide-react';

interface MatchRevealProps {
  matchedTo: Participant | null;
}

export function MatchReveal({ matchedTo }: MatchRevealProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    const visTimer = setTimeout(() => setIsVisible(true), 100);
    return () => {
      clearTimeout(timer);
      clearTimeout(visTimer);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto relative">
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
          🎉 <span className="text-gradient">Match Revealed!</span> 🎉
        </h2>
        <p className="text-muted-foreground text-lg">Here's your connection</p>
      </div>

      {matchedTo ? (
        <div 
          className={`bg-gradient-card rounded-3xl p-8 shadow-card border border-border/50 transition-all duration-500 hover:shadow-glow ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="text-center">
            <p className="text-sm font-medium text-primary mb-4">You've been matched with</p>
            
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
              <span className="text-4xl font-display font-bold text-primary-foreground">
                {matchedTo.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h3 className="text-2xl font-display font-bold mb-1">{matchedTo.name}</h3>
            <p className="text-sm text-muted-foreground capitalize mb-6">{matchedTo.gender}</p>
            
            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => window.open(formatWhatsAppLink(matchedTo.whatsapp), '_blank')}
              >
                <MessageCircle className="w-5 h-5" />
                Message on WhatsApp
              </Button>
              
              <ProfileView participant={matchedTo} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-card rounded-3xl p-8 shadow-card border border-border/50">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
            <p className="text-muted-foreground">
              We're still finding a match for you. Check back soon!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
