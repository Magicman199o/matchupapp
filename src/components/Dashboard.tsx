import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MatchReveal } from '@/components/MatchReveal';
import { type Participant, performMatching, clearCurrentUser } from '@/lib/matchmaking';
import { LogOut, Heart, Sparkles } from 'lucide-react';

interface DashboardProps {
  participant: Participant;
  onLogout: () => void;
}

export function Dashboard({ participant, onLogout }: DashboardProps) {
  const [matchedTo, setMatchedTo] = useState<Participant | null>(null);
  const [matchedBy, setMatchedBy] = useState<Participant | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const revealDate = new Date(participant.matchRevealDate);
  const now = new Date();
  const shouldReveal = now >= revealDate;

  useEffect(() => {
    if (shouldReveal) {
      const { matchedTo: to, matchedBy: by } = performMatching(participant.id);
      setMatchedTo(to);
      setMatchedBy(by);
      setIsRevealed(true);
    }
  }, [shouldReveal, participant.id]);

  const handleLogout = () => {
    clearCurrentUser();
    onLogout();
  };

  const handleCountdownComplete = () => {
    const { matchedTo: to, matchedBy: by } = performMatching(participant.id);
    setMatchedTo(to);
    setMatchedBy(by);
    setIsRevealed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary animate-heart" />
            <span className="font-display font-bold text-xl text-gradient">Matchup</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Hey, <span className="font-medium text-foreground">{participant.name}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {!isRevealed ? (
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-10 animate-slide-up">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Your match is being <span className="text-gradient">prepared!</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Hold tight, {participant.name}! Our magical matching algorithm is working to find you the perfect connection.
              </p>
            </div>

            <CountdownTimer 
              targetDate={revealDate} 
              onComplete={handleCountdownComplete}
            />

            <div className="mt-16 p-6 bg-card/50 rounded-2xl border border-border/50 max-w-md mx-auto">
              <h3 className="font-display font-semibold mb-2">How it works</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-primary">1.</span>
                  We wait for more participants to join
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">2.</span>
                  After 4 days, matches are revealed
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">3.</span>
                  You'll see who you matched with AND who matched with you
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">4.</span>
                  Connect via WhatsApp and make a new friend!
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <MatchReveal matchedTo={matchedTo} matchedBy={matchedBy} />
        )}
      </main>
    </div>
  );
}
