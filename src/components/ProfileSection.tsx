import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getProfile, upsertProfile, uploadProfilePhoto, getCurrentUser, type Profile } from '@/lib/matchmaking';
import { Camera, X, Save, User, Heart, Gift, Sparkles, Home } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSectionProps {
  participantId: string;
  participantName: string;
  onSave?: () => void;
}

const INTEREST_OPTIONS = [
  'Music', 'Movies', 'Sports', 'Travel', 'Reading', 'Gaming', 
  'Cooking', 'Art', 'Technology', 'Fitness', 'Photography', 'Dancing'
];

const RELATIONSHIP_STATUS_OPTIONS = [
  'Single', 'In a relationship', 'Complicated', 'Prefer not to say'
];

export function ProfileSection({ participantId, participantName, onSave }: ProfileSectionProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(participantName);
  const [about, setAbout] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [profileVisible, setProfileVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [participantId]);

  const loadProfile = async () => {
    const existingProfile = await getProfile(participantId);
    if (existingProfile) {
      setProfile(existingProfile);
      setDisplayName(existingProfile.display_name || participantName);
      setAbout(existingProfile.about || '');
      setInterests(existingProfile.interests || []);
      setWishlist(existingProfile.wishlist || '');
      setRelationshipStatus(existingProfile.relationship_status || '');
      setProfileVisible(existingProfile.profile_visible);
      setPhotoPreview(existingProfile.photo_url || null);
    }
    setIsLoading(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (600KB max)
    if (file.size > 600 * 1024) {
      toast.error('Photo must be less than 600KB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const photoUrl = await uploadProfilePhoto(participantId, file);
    if (photoUrl) {
      setPhotoPreview(photoUrl);
      toast.success('Photo uploaded!');
    } else {
      toast.error('Failed to upload photo');
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await upsertProfile({
      participant_id: participantId,
      photo_url: photoPreview,
      about,
      interests,
      wishlist,
      relationship_status: relationshipStatus,
      profile_visible: profileVisible,
      display_name: displayName,
    });

    if (success) {
      toast.success('Profile saved!');
      if (onSave) {
        onSave();
      }
    } else {
      toast.error('Failed to save profile');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-xl">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-display font-bold">Your Profile</h2>
      </div>

      <div className="space-y-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center">
          <div 
            className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-2">Max 600KB</p>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Name
          </Label>
          <Input
            id="displayName"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {/* About */}
        <div className="space-y-2">
          <Label htmlFor="about">About Me</Label>
          <Textarea
            id="about"
            placeholder="Tell your match something about yourself..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <Label>Interests</Label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(interest => (
              <Badge
                key={interest}
                variant={interests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Wishlist */}
        <div className="space-y-2">
          <Label htmlFor="wishlist" className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Wishlist
          </Label>
          <Textarea
            id="wishlist"
            placeholder="What would you love to receive as a gift?"
            value={wishlist}
            onChange={(e) => setWishlist(e.target.value)}
            className="min-h-[80px] rounded-xl"
          />
        </div>

        {/* Relationship Status */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Relationship Status
          </Label>
          <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
          <div>
            <p className="font-medium">Show profile to my match</p>
            <p className="text-sm text-muted-foreground">
              Allow your match to see your profile details
            </p>
          </div>
          <Switch
            checked={profileVisible}
            onCheckedChange={setProfileVisible}
          />
        </div>

        {/* Save Button */}
        <Button 
          variant="hero" 
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">✨</span>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Profile
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}