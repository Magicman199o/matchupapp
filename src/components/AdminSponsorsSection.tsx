import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSponsors, createSponsor, deleteSponsor, type Sponsor } from '@/lib/matchmaking';
import { Plus, Trash2, Gift, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function AdminSponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    const data = await getSponsors();
    setSponsors(data);
  };

  const handleCreate = async () => {
    if (!name.trim() || !link.trim()) return;
    
    setIsLoading(true);
    const success = await createSponsor(name, iconUrl || null, link);
    if (success) {
      toast.success('Sponsor added');
      setName('');
      setIconUrl('');
      setLink('');
      await loadSponsors();
    } else {
      toast.error('Failed to add sponsor');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteSponsor(id);
    if (success) {
      toast.success('Sponsor removed');
      await loadSponsors();
    } else {
      toast.error('Failed to remove sponsor');
    }
  };

  return (
    <div className="bg-gradient-card rounded-2xl p-6 shadow-card border border-border/50">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-primary" />
        Add a Sponsorship
      </h3>

      <div className="space-y-3 mb-6">
        <div>
          <Label htmlFor="sponsorName" className="text-xs">Sponsor Name</Label>
          <Input
            id="sponsorName"
            placeholder="e.g., Acme Inc"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10"
          />
        </div>
        <div>
          <Label htmlFor="iconUrl" className="text-xs">Icon URL (optional)</Label>
          <Input
            id="iconUrl"
            placeholder="https://example.com/logo.png"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            className="h-10"
          />
        </div>
        <div>
          <Label htmlFor="sponsorLink" className="text-xs">Link</Label>
          <Input
            id="sponsorLink"
            placeholder="https://sponsor-website.com"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="h-10"
          />
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={isLoading || !name || !link}
          size="sm"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Sponsor
        </Button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sponsors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sponsors added yet</p>
        ) : (
          sponsors.map((sponsor) => (
            <div 
              key={sponsor.id} 
              className="flex items-center justify-between p-3 bg-background/50 rounded-xl"
            >
              <div className="flex items-center gap-2">
                {sponsor.icon_url ? (
                  <img src={sponsor.icon_url} alt={sponsor.name} className="w-6 h-6 rounded object-contain" />
                ) : (
                  <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary">
                    {sponsor.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{sponsor.name}</p>
                  <a 
                    href={sponsor.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDelete(sponsor.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}