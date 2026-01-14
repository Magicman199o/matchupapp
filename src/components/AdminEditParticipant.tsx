import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateParticipant, type Participant } from '@/lib/matchmaking';
import { Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AdminEditParticipantProps {
  participant: Participant;
  onUpdate: () => void;
}

export function AdminEditParticipant({ participant, onUpdate }: AdminEditParticipantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(participant.name);
  const [whatsapp, setWhatsapp] = useState(participant.whatsapp);
  const [gender, setGender] = useState(participant.gender);
  const [groupName, setGroupName] = useState(participant.group_name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const success = await updateParticipant(participant.id, {
      name,
      whatsapp,
      gender,
      group_name: groupName,
    });
    
    if (success) {
      toast.success('Participant updated');
      setIsOpen(false);
      onUpdate();
    } else {
      toast.error('Failed to update participant');
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Pencil className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Participant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="editName">Name</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editWhatsapp">WhatsApp</Label>
            <Input
              id="editWhatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editGroup">Group</Label>
            <Input
              id="editGroup"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={gender}
              onValueChange={(value) => setGender(value as 'male' | 'female' | 'other')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="editMale" />
                <Label htmlFor="editMale">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="editFemale" />
                <Label htmlFor="editFemale">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="editOther" />
                <Label htmlFor="editOther">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}