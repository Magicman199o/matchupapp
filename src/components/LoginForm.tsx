import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginParticipant, normalizeGroupName, type Participant } from '@/lib/matchmaking';
import { Heart, User, Phone, Users, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onSuccess: (participant: Participant) => void;
  onSignUp: () => void;
}

export function LoginForm({ onSuccess, onSignUp }: LoginFormProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const participant = await loginParticipant(name, whatsapp, groupName);
    
    if (participant) {
      onSuccess(participant);
    } else {
      setError('not_found');
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-gradient-card rounded-3xl p-8 shadow-card border border-border/50">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-display font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-muted-foreground text-center mb-8">Login here to view your match</p>
        
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive text-sm rounded-xl text-center">
            <p className="mb-2">Details don't exist.</p>
            <button 
              type="button" 
              onClick={onSignUp}
              className="text-primary font-semibold hover:underline"
            >
              Get matched now
            </button>
          </div>
        )}
        
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="loginName" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Your Name
            </Label>
            <Input
              id="loginName"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loginGroup" className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Group Name
            </Label>
            <Input
              id="loginGroup"
              type="text"
              placeholder="e.g., AcmeCorp, BookClub"
              value={groupName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                setGroupName(value);
              }}
              required
              className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Letters only • {groupName ? normalizeGroupName(groupName) : 'yourgroup'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loginWhatsapp" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              WhatsApp Number
            </Label>
            <Input
              id="loginWhatsapp"
              type="tel"
              placeholder="+1234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          variant="hero" 
          size="lg" 
          className="w-full mt-8"
          disabled={isLoading || !name || !whatsapp || !groupName}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">✨</span>
              Logging in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              View My Match
            </span>
          )}
        </Button>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button type="button" onClick={onSignUp} className="text-primary font-semibold hover:underline">
          Get matched now
        </button>
      </p>
    </form>
  );
}
