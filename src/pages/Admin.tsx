import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  getGroups, 
  getParticipantsByGroup, 
  getParticipants,
  getAdminSession, 
  setAdminSession, 
  verifyAdminLogin,
  performGroupMatching,
  shuffleGroupMatches,
  type Participant 
} from '@/lib/matchmaking';
import { 
  Heart, 
  Shield, 
  Users, 
  LogOut, 
  ArrowLeft,
  UserCheck,
  Link as LinkIcon,
  Calendar,
  Phone,
  Shuffle,
  Play,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [groups, setGroups] = useState<{ name: string; count: number }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    setIsLoggedIn(session);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (selectedGroup && isLoggedIn) {
      loadGroupParticipants(selectedGroup);
    }
  }, [selectedGroup, isLoggedIn]);

  const loadData = async () => {
    const groupsData = await getGroups();
    setGroups(groupsData);
    
    const allData = await getParticipants();
    setAllParticipants(allData);
  };

  const loadGroupParticipants = async (groupName: string) => {
    const data = await getParticipantsByGroup(groupName);
    setParticipants(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const isValid = await verifyAdminLogin(email, password);
    
    if (isValid) {
      setAdminSession(true);
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setAdminSession(false);
    setIsLoggedIn(false);
  };

  const handleMatchGroup = async (groupName: string) => {
    setIsMatching(true);
    try {
      const matchedCount = await performGroupMatching(groupName);
      toast.success(`Successfully matched ${matchedCount} participants in ${groupName}`);
      await loadData();
      if (selectedGroup === groupName) {
        await loadGroupParticipants(groupName);
      }
    } catch (error) {
      toast.error('Failed to perform matching');
    }
    setIsMatching(false);
  };

  const handleShuffleGroup = async (groupName: string) => {
    setIsShuffling(true);
    try {
      const affectedCount = await shuffleGroupMatches(groupName);
      toast.success(`Shuffled matches for ${affectedCount} participants who haven't viewed yet`);
      await loadData();
      if (selectedGroup === groupName) {
        await loadGroupParticipants(groupName);
      }
    } catch (error) {
      toast.error('Failed to shuffle matches');
    }
    setIsShuffling(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary animate-heart" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-card rounded-3xl p-8 shadow-card border border-border/50">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h1 className="text-2xl font-display font-bold text-center mb-2">Admin Login</h1>
            <p className="text-muted-foreground text-center mb-8">Access the Matchup dashboard</p>
            
            {loginError && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-xl text-center">
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              
              <Button type="submit" variant="hero" className="w-full">
                Login
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                ← Back to Matchup
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unmatchedCount = allParticipants.filter(p => !p.matched_to && !p.matched_by).length;
  const viewedCount = allParticipants.filter(p => p.match_viewed).length;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary animate-heart" />
              <span className="font-display font-bold text-xl text-gradient">Matchup</span>
            </Link>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium">Admin Dashboard</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard 
            icon={<Users className="w-5 h-5" />}
            label="Total Signups"
            value={allParticipants.length}
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />}
            label="Groups"
            value={groups.length}
          />
          <StatCard 
            icon={<UserCheck className="w-5 h-5" />}
            label="Matched"
            value={allParticipants.filter(p => p.matched_to).length}
          />
          <StatCard 
            icon={<Clock className="w-5 h-5" />}
            label="Awaiting Match"
            value={unmatchedCount}
          />
          <StatCard 
            icon={<Eye className="w-5 h-5" />}
            label="Viewed"
            value={viewedCount}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-card rounded-2xl p-6 shadow-card border border-border/50">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Groups
              </h2>
              
              {groups.length === 0 ? (
                <p className="text-muted-foreground text-sm">No groups yet</p>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => {
                    const groupParticipants = allParticipants.filter(p => p.group_name === group.name);
                    const matchedInGroup = groupParticipants.filter(p => p.matched_to).length;
                    const viewedInGroup = groupParticipants.filter(p => p.match_viewed).length;
                    const canShuffle = matchedInGroup > 0 && viewedInGroup < matchedInGroup;
                    
                    return (
                      <div
                        key={group.name}
                        className={`p-3 rounded-xl transition-all ${
                          selectedGroup === group.name 
                            ? 'bg-primary/10 border-primary/30 border' 
                            : 'bg-background/50 hover:bg-background border border-transparent'
                        }`}
                      >
                        <button
                          onClick={() => setSelectedGroup(group.name)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{group.name}</span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                              {group.count} members
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{matchedInGroup} matched</span>
                            <span>•</span>
                            <span>{viewedInGroup} viewed</span>
                          </div>
                        </button>
                        
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMatchGroup(group.name);
                            }}
                            disabled={isMatching}
                            className="flex-1 text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Match
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShuffleGroup(group.name);
                            }}
                            disabled={isShuffling || !canShuffle}
                            className="flex-1 text-xs"
                            title={!canShuffle ? "All matched users have viewed their matches" : "Shuffle unviewed matches"}
                          >
                            <Shuffle className="w-3 h-3 mr-1" />
                            Shuffle
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Participants Table */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-card rounded-2xl p-6 shadow-card border border-border/50">
              {selectedGroup ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {selectedGroup}
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedGroup(null)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      All Groups
                    </Button>
                  </div>
                  
                  <ParticipantsTable participants={participants} allParticipants={allParticipants} />
                </>
              ) : (
                <>
                  <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    All Participants
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Select a group to view its members, or see all signups below.
                  </p>
                  <ParticipantsTable participants={allParticipants} allParticipants={allParticipants} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-gradient-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold">{value}</p>
    </div>
  );
}

interface ParticipantsTableProps {
  participants: Participant[];
  allParticipants: Participant[];
}

function ParticipantsTable({ participants, allParticipants }: ParticipantsTableProps) {
  const getParticipantName = (id: string | null | undefined) => {
    if (!id) return '-';
    const p = allParticipants.find(p => p.id === id);
    return p?.name || '-';
  };

  const getMatchStatus = (p: Participant) => {
    if (!p.matched_to && !p.matched_by) {
      return { label: 'Awaiting', color: 'bg-yellow-500/10 text-yellow-600' };
    }
    if (p.match_viewed) {
      return { label: 'Viewed', color: 'bg-green-500/10 text-green-600' };
    }
    return { label: 'Matched', color: 'bg-blue-500/10 text-blue-600' };
  };

  if (participants.length === 0) {
    return <p className="text-muted-foreground text-sm">No participants found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 font-medium">Name</th>
            <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Group</th>
            <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Gender</th>
            <th className="text-left py-3 px-2 font-medium">Status</th>
            <th className="text-left py-3 px-2 font-medium">Matched To</th>
            <th className="text-left py-3 px-2 font-medium">Matched By</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => {
            const status = getMatchStatus(p);
            return (
              <tr key={p.id} className="border-b border-border/50 hover:bg-background/50">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 sm:hidden">
                        <Phone className="w-3 h-3" />
                        {p.whatsapp}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 hidden sm:table-cell">
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {p.group_name}
                  </span>
                </td>
                <td className="py-3 px-2 capitalize hidden md:table-cell">{p.gender}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="py-3 px-2">
                  {p.matched_to ? (
                    <span className="text-primary font-medium">
                      {getParticipantName(p.matched_to)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  {p.matched_by ? (
                    <span className="text-accent font-medium">
                      {getParticipantName(p.matched_by)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
