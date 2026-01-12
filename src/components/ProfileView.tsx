import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getProfile, type Profile, type Participant } from '@/lib/matchmaking';
import { User, Heart, Gift, Eye, Lock } from 'lucide-react';

interface ProfileViewProps {
  participant: Participant;
  isAdmin?: boolean;
}

export function ProfileView({ participant, isAdmin = false }: ProfileViewProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [participant.id]);

  const loadProfile = async () => {
    const existingProfile = await getProfile(participant.id);
    setProfile(existingProfile);
    setIsLoading(false);
  };

  const canViewProfile = isAdmin || profile?.profile_visible;

  if (isLoading) {
    return null;
  }

  if (!profile && !isAdmin) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Lock className="w-4 h-4" />
        No Profile
      </Button>
    );
  }

  if (!canViewProfile && !isAdmin) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Lock className="w-4 h-4" />
        Profile Hidden
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          View Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {participant.name}'s Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Photo */}
          {profile?.photo_url && (
            <div className="flex justify-center">
              <img 
                src={profile.photo_url} 
                alt={participant.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            </div>
          )}

          {/* About */}
          {profile?.about && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">About</h4>
              <p className="text-foreground">{profile.about}</p>
            </div>
          )}

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Wishlist */}
          {profile?.wishlist && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Gift className="w-4 h-4" />
                Wishlist
              </h4>
              <p className="text-foreground">{profile.wishlist}</p>
            </div>
          )}

          {/* Relationship Status */}
          {profile?.relationship_status && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Relationship Status
              </h4>
              <p className="text-foreground">{profile.relationship_status}</p>
            </div>
          )}

          {/* No profile info */}
          {!profile?.about && !profile?.interests?.length && !profile?.wishlist && !profile?.relationship_status && !profile?.photo_url && (
            <p className="text-center text-muted-foreground py-4">
              No profile information available yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
