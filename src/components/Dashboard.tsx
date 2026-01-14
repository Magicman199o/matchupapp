import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MatchReveal } from '@/components/MatchReveal';
import { ProfileSection } from '@/components/ProfileSection';
import { SponsorMarquee } from '@/components/SponsorMarquee';
import { InstantMatchModal } from '@/components/InstantMatchModal';
import { type Participant, getMatchDetails, markMatchViewed, clearCurrentUser, tryInstantMatch } from '@/lib/matchmaking';
import { LogOut, Heart, Sparkles, Users, Clock, User, Zap } from 'lucide-react';

interface DashboardProps {
  participant: Participant;
  onLogout: () => void;
}

export function Dashboard({ participant, onLogout }: DashboardProps) {
  const [matchedTo, setMatchedTo] = useState<Participant | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantMatchResult, setInstantMatchResult] = useState<Participant | null>(null);
  const [isInstantMatching, setIsInstantMatching] = useState(false);

  const revealDate = new Date(participant.match_reveal_date);
  const now = new Date();
  const canReveal = now >= revealDate;

  useEffect(() => {
    const checkMatching = async () => {
      // Fetch match details
      const { matchedTo: to } = await getMatchDetails(participant.id);
      setMatchedTo(to);
      
      // Only reveal if countdown is complete AND user has a match
      if (canReveal && to) {
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
    const { matchedTo: to } = await getMatchDetails(participant.id);
    setMatchedTo(to);
    
    if (to) {
      await markMatchViewed(participant.id);
      setIsRevealed(true);
    }
  };

  const handleInstantMatch = async () => {
    setIsInstantMatching(true);
    const match = await tryInstantMatch(participant.id);
    setInstantMatchResult(match);
    setShowInstantModal(true);
    setIsInstantMatching(false);
  };

  const handleInstantMatchView = () => {
    if (instantMatchResult) {
      setMatchedTo(instantMatchResult);
      setIsRevealed(true);
      setShowInstantModal(false);
    }
  };

  const handleProfileSave = () => {
    setShowProfile(false);
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
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant={showProfile ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="w-4 h-4" />
              <span className="ml-1">Profile</span>
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Hey, <span className="font-medium text-foreground">{participant.name}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sponsors Marquee */}
      <SponsorMarquee />

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

        {showProfile ? (
          <div className="max-w-md mx-auto">
            <ProfileSection 
              participantId={participant.id} 
              participantName={participant.name}
              onSave={handleProfileSave}
            />
          </div>
        ) : !isRevealed ? (
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-10 animate-slide-up">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Awaiting a <span className="text-gradient">match</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                <span className="font-semibold text-primary">{participant.name}</span>, your match will be revealed in
              </p>
            </div>

            {!canReveal ? (
              <>
                <CountdownTimer 
                  targetDate={revealDate} 
                  onComplete={handleCountdownComplete}
                />

                {/* Instant Match Button */}
                <div className="mt-8">
                  <Button 
                    variant="hero-outline" 
                    size="lg"
                    onClick={handleInstantMatch}
                    disabled={isInstantMatching}
                    className="w-full sm:w-auto"
                  >
                    {isInstantMatching ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">✨</span>
                        Finding match...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Get an Instant Match
                      </span>
                    )}
                  </Button>
                </div>

                <div className="mt-16 p-6 bg-card/50 rounded-2xl border border-border/50 max-w-md mx-auto">
                  <h3 className="font-display font-semibold mb-2">How it works</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">1.</span>
                      We match you with someone in your group
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">2.</span>
                      After 24 hours, your match is revealed
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">3.</span>
                      You'll see who you've been matched with
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
                <p className="text-sm text-muted-foreground mb-4">
                  Your countdown has completed, but no one has been matched with you yet. 
                  Check back soon as more participants join your group!
                </p>
                <Button 
                  variant="hero-outline"
                  onClick={handleInstantMatch}
                  disabled={isInstantMatching}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Try Instant Match
                </Button>
              </div>
            )}
          </div>
        ) : (
          <MatchReveal matchedTo={matchedTo} />
        )}
      </main>

      <InstantMatchModal
        isOpen={showInstantModal}
        onClose={() => setShowInstantModal(false)}
        hasMatch={!!instantMatchResult}
        matchName={instantMatchResult?.name}
        onViewMatch={handleInstantMatchView}
      />
    </div>
  );
}