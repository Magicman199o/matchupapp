import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAdminGroups, createGroup, deleteGroup, type Group } from '@/lib/matchmaking';
import { Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';

export function AdminGroupsSection() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const data = await getAdminGroups();
    setGroups(data);
  };

  const handleCreate = async () => {
    if (!newGroupName.trim() || !newDisplayName.trim()) return;
    
    setIsLoading(true);
    const success = await createGroup(newGroupName.toLowerCase().replace(/[^a-z]/g, ''), newDisplayName);
    if (success) {
      toast.success('Group created');
      setNewGroupName('');
      setNewDisplayName('');
      await loadGroups();
    } else {
      toast.error('Failed to create group');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteGroup(id);
    if (success) {
      toast.success('Group deleted');
      await loadGroups();
    } else {
      toast.error('Failed to delete group');
    }
  };

  return (
    <div className="bg-gradient-card rounded-2xl p-6 shadow-card border border-border/50">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        Manage Groups
      </h3>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="groupKey" className="text-xs">Group Key (lowercase)</Label>
            <Input
              id="groupKey"
              placeholder="e.g., acmecorp"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="displayName" className="text-xs">Display Name</Label>
            <Input
              id="displayName"
              placeholder="e.g., Acme Corp"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={isLoading || !newGroupName || !newDisplayName}
          size="sm"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Group
        </Button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups created yet</p>
        ) : (
          groups.map((group) => (
            <div 
              key={group.id} 
              className="flex items-center justify-between p-3 bg-background/50 rounded-xl"
            >
              <div>
                <p className="font-medium text-sm">{group.display_name}</p>
                <p className="text-xs text-muted-foreground">{group.name}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDelete(group.id)}
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