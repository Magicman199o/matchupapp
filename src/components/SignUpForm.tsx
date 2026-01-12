import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { registerParticipant, normalizeGroupName, type Participant } from '@/lib/matchmaking';
import { Heart, User, Phone, Sparkles, Users } from 'lucide-react';

interface SignUpFormProps {
  onSuccess: (participant: Participant) => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const participant = await registerParticipant(name, whatsapp, gender, groupName);
    
    if (participant) {
      onSuccess(participant);
    } else {
      setError('Failed to register. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-gradient-card rounded-3xl p-8 shadow-card border border-border/50">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-display font-bold text-center mb-2">Join the Match</h2>
        <p className="text-muted-foreground text-center mb-8">Enter your details to get matched</p>
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-xl text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Group / Organization Name
            </Label>
            <Input
              id="groupName"
              type="text"
              placeholder="e.g., AcmeCorp, BookClub, ClassOf2024"
              value={groupName}
              onChange={(e) => {
                // Only allow letters
                const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                setGroupName(value);
              }}
              required
              className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Letters only • Will be normalized: {groupName ? normalizeGroupName(groupName) : 'yourgroup'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary focus:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              WhatsApp Number
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+1234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">Include country code for international numbers</p>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Gender
            </Label>
            <RadioGroup
              value={gender}
              onValueChange={(value) => setGender(value as 'male' | 'female' | 'other')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" className="border-primary text-primary" />
                <Label htmlFor="male" className="cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" className="border-primary text-primary" />
                <Label htmlFor="female" className="cursor-pointer">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" className="border-primary text-primary" />
                <Label htmlFor="other" className="cursor-pointer">Other</Label>
              </div>
            </RadioGroup>
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
              Getting you ready...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Get Matched Now
            </span>
          )}
        </Button>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        By signing up, you agree to be matched with another participant in your group after 24 hours
      </p>
    </form>
  );
}
