import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MatchReveal } from '@/components/MatchReveal';
import { type Participant, getMatchDetails, markMatchViewed, clearCurrentUser } from '@/lib/matchmaking';
import { LogOut, Heart, Sparkles, Users, Clock } from 'lucide-react';

interface DashboardProps {
  participant: Participant;
  onLogout: () => void;
}

export function Dashboard({ participant, onLogout }: DashboardProps) {
  const [matchedTo, setMatchedTo] = useState<Participant | null>(null);
  const [matchedBy, setMatchedBy] = useState<Participant | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMatch, setHasMatch] = useState(false);

  const revealDate = new Date(participant.match_reveal_date);
  const now = new Date();
  const canReveal = now >= revealDate;

  useEffect(() => {
    const checkMatching = async () => {
      // Always fetch match details to check if user has been matched
      const { matchedTo: to, matchedBy: by } = await getMatchDetails(participant.id);
      setMatchedTo(to);
      setMatchedBy(by);
      setHasMatch(!!to || !!by);
      
      // Only reveal if countdown is complete
      if (canReveal && (to || by)) {
        // Mark match as viewed when user sees it
        await markMatchViewed(participant.id);
        setIsRevealed(true);
      }
      
      setIsLoading(false);
    };
    
    checkMatching();
  }, [canReveal, participant.id]);

  const handleLogout = () => {
    clearCurrentUser();
    onLogout();
  };

  const handleCountdownComplete = async () => {
    const { matchedTo: to, matchedBy: by } = await getMatchDetails(participant.id);
    setMatchedTo(to);
    setMatchedBy(by);
    
    if (to || by) {
      await markMatchViewed(participant.id);
      setIsRevealed(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary animate-heart" />
      </div>
    );
  }

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
        {/* Group Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Group: {participant.group_name}
            </span>
          </div>
        </div>

        {!isRevealed ? (
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-10 animate-slide-up">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {hasMatch ? (
                  <>Your match is <span className="text-gradient">ready!</span></>
                ) : (
                  <>Awaiting a <span className="text-gradient">match</span></>
                )}
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {hasMatch ? (
                  <>Hold tight, {participant.name}! Your match within <span className="font-semibold text-primary">{participant.group_name}</span> will be revealed after the countdown.</>
                ) : (
                  <>We're waiting for more participants to join <span className="font-semibold text-primary">{participant.group_name}</span>. You'll be matched as soon as someone is available!</>
                )}
              </p>
            </div>

            {!canReveal ? (
              <>
                <CountdownTimer 
                  targetDate={revealDate} 
                  onComplete={handleCountdownComplete}
                />

                <div className="mt-16 p-6 bg-card/50 rounded-2xl border border-border/50 max-w-md mx-auto">
                  <h3 className="font-display font-semibold mb-2">How it works</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">1.</span>
                      We wait for more participants in your group
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
              </>
            ) : (
              <div className="p-8 bg-card/50 rounded-2xl border border-border/50 max-w-md mx-auto">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-semibold mb-2">Waiting for a match</h3>
                <p className="text-sm text-muted-foreground">
                  Your countdown has completed, but no one has been matched with you yet. 
                  Check back soon as more participants join your group!
                </p>
              </div>
            )}
          </div>
        ) : (
          <MatchReveal matchedTo={matchedTo} matchedBy={matchedBy} />
        )}
      </main>
    </div>
  );
}
