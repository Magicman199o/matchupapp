import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SignUpForm } from '@/components/SignUpForm';
import { Dashboard } from '@/components/Dashboard';
import { FloatingHearts } from '@/components/FloatingHearts';
import { getCurrentUser, type Participant } from '@/lib/matchmaking';
import { Heart, Sparkles, Users, Clock, MessageCircle } from 'lucide-react';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleSignUpSuccess = (participant: Participant) => {
    setCurrentUser(participant);
    setShowSignUp(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowSignUp(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary animate-heart" />
      </div>
    );
  }

  if (currentUser) {
    return <Dashboard participant={currentUser} onLogout={handleLogout} />;
  }

  if (showSignUp) {
    return (
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        <FloatingHearts />
        
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary animate-heart" />
              <span className="font-display font-bold text-xl text-gradient">Matchup</span>
            </div>
            <Button variant="ghost" onClick={() => setShowSignUp(false)}>
              Back
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 relative z-10">
          <SignUpForm onSuccess={handleSignUpSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <FloatingHearts />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary animate-heart" />
            <span className="font-display font-bold text-xl text-gradient">Matchup</span>
          </div>
          <Button variant="hero-outline" onClick={() => setShowSignUp(true)}>
            Join Now
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              The fun way to make new connections
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Find Your Perfect
            <br />
            <span className="text-gradient">Match</span> ✨
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Sign up, wait 4 days, and discover who you're matched with! 
            It's like Secret Santa, but for making friends.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => setShowSignUp(true)}
              className="w-full sm:w-auto"
            >
              <Heart className="w-5 h-5" />
              Get Matched Now
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* How it Works */}
        <section id="how-it-works" className="mt-32 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How <span className="text-gradient">Matchup</span> Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple, fun, and exciting. Here's your journey to finding a match.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Sign Up"
              description="Enter your name, WhatsApp number, and gender to join the matching pool."
              step={1}
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Wait & Anticipate"
              description="Watch the countdown. In 4 days, your match will be revealed!"
              step={2}
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="Connect"
              description="See who you matched with AND who matched with you. Start chatting!"
              step={3}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 max-w-3xl mx-auto text-center">
          <div className="bg-gradient-card rounded-3xl p-10 md:p-16 shadow-glow border border-border/50">
            <Heart className="w-16 h-16 text-primary mx-auto mb-6 animate-heart" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to find your match?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Join hundreds of others looking to make meaningful connections. 
              Your perfect match could be just 4 days away!
            </p>
            <Button variant="hero" size="xl" onClick={() => setShowSignUp(true)}>
              <Sparkles className="w-5 h-5" />
              Get Matched Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20 py-8 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-gradient">Matchup</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Making connections, one match at a time ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}

function FeatureCard({ icon, title, description, step }: FeatureCardProps) {
  return (
    <div className="bg-gradient-card rounded-2xl p-8 shadow-card border border-border/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
          Step {step}
        </span>
      </div>
      <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;
