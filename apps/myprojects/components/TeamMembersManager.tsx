'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Mail, MoreVertical, Trash2, Shield, Star, Activity } from 'lucide-react';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';

export interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: 'client' | 'developer' | 'designer' | 'pm' | 'qa' | 'admin';
  addedAt: Date;
  addedBy: string;
  permissions: {
    canEditMilestones: boolean;
    canApproveDe liverables: boolean;
    canManageTickets: boolean;
    canManageTeam: boolean;
  };
}

interface TeamMembersManagerProps {
  projectId: string;
}

const roleLabels: Record<TeamMember['role'], string> = {
  client: 'Client',
  developer: 'Developer',
  designer: 'Designer',
  pm: 'Project Manager',
  qa: 'QA Engineer',
  admin: 'Admin',
};

const roleColors: Record<TeamMember['role'], string> = {
  client: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  developer: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  designer: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  pm: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  qa: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function TeamMembersManager({ projectId }: TeamMembersManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
    loadTeamMembers();
  }, [projectId]);

  const loadCurrentUser = async () => {
    try {
      const { getAuthInstance } = await import('@allied-impact/auth');
      const auth = getAuthInstance();
      setCurrentUser(auth.currentUser);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      const membersQuery = query(
        collection(db, 'projectMembers'),
        where('projectId', '==', projectId),
        orderBy('addedAt', 'desc')
      );

      const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
        const teamMembers = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            addedAt: data.addedAt.toDate(),
          } as TeamMember;
        });
        
        setMembers(teamMembers);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to load team members:', error);
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      await deleteDoc(doc(db, 'projectMembers', memberId));
    } catch (error) {
      console.error('Failed to remove team member:', error);
      alert('Failed to remove team member');
    }
  };

  const getMemberActivityCount = async (userId: string) => {
    try {
      const { getFirestore, collection, query, where, getCountFromServer } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('projectId', '==', projectId),
        where('userId', '==', userId)
      );

      const snapshot = await getCountFromServer(activitiesQuery);
      return snapshot.data().count;
    } catch (error) {
      console.error('Failed to get activity count:', error);
      return 0;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">{members.length} members</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <h3 className="text-lg font-medium mb-2">No Team Members</h3>
              <p className="text-muted-foreground mb-4">
                Add team members to collaborate on this project
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {members.map(member => (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {member.userAvatar ? (
                      <img
                        src={member.userAvatar}
                        alt={member.userName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {getInitials(member.userName)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{member.userName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">
                            {member.userEmail}
                          </span>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${roleColors[member.role]}`}>
                        {roleLabels[member.role]}
                      </span>
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {member.permissions.canEditMilestones && (
                        <span className="text-xs px-2 py-1 bg-accent rounded">
                          <Shield className="h-3 w-3 inline mr-1" />
                          Edit Milestones
                        </span>
                      )}
                      {member.permissions.canApproveDeliverables && (
                        <span className="text-xs px-2 py-1 bg-accent rounded">
                          <Star className="h-3 w-3 inline mr-1" />
                          Approve Deliverables
                        </span>
                      )}
                      {member.permissions.canManageTickets && (
                        <span className="text-xs px-2 py-1 bg-accent rounded">
                          Manage Tickets
                        </span>
                      )}
                      {member.permissions.canManageTeam && (
                        <span className="text-xs px-2 py-1 bg-accent rounded">
                          Manage Team
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Added {member.addedAt.toLocaleDateString()}</span>
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => {/* View activity */}}
                      >
                        <Activity className="h-3 w-3" />
                        View Activity
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  {currentUser && member.userId !== currentUser.uid && (
                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            // Listener will update automatically
          }}
        />
      )}
    </div>
  );
}

// Add Member Modal Component
interface AddMemberModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddMemberModal({ projectId, onClose, onSuccess }: AddMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamMember['role']>('developer');
  const [permissions, setPermissions] = useState({
    canEditMilestones: false,
    canApproveDeliverables: false,
    canManageTickets: true,
    canManageTeam: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      const { getAuthInstance } = await import('@allied-impact/auth');
      const { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const auth = getAuthInstance();
      if (!auth.currentUser) {
        alert('You must be logged in');
        return;
      }

      const db = getFirestore(getApp());

      // Check if user exists by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase())
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        alert('User not found. They need to sign up first.');
        setLoading(false);
        return;
      }

      const targetUser = usersSnapshot.docs[0].data();

      // Check if already a member
      const membersQuery = query(
        collection(db, 'projectMembers'),
        where('projectId', '==', projectId),
        where('userId', '==', usersSnapshot.docs[0].id)
      );
      const membersSnapshot = await getDocs(membersQuery);

      if (!membersSnapshot.empty) {
        alert('This user is already a team member');
        setLoading(false);
        return;
      }

      // Add team member
      await addDoc(collection(db, 'projectMembers'), {
        projectId,
        userId: usersSnapshot.docs[0].id,
        userName: targetUser.displayName || targetUser.email,
        userEmail: targetUser.email,
        userAvatar: targetUser.photoURL,
        role,
        permissions,
        addedBy: auth.currentUser.uid,
        addedAt: serverTimestamp(),
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to add team member:', error);
      alert('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Add Team Member</CardTitle>
            <CardDescription>
              Invite a user to join this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeamMember['role'])}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canEditMilestones}
                      onChange={(e) => setPermissions({ ...permissions, canEditMilestones: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Can edit milestones</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canApproveDeliverables}
                      onChange={(e) => setPermissions({ ...permissions, canApproveDeliverables: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Can approve deliverables</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canManageTickets}
                      onChange={(e) => setPermissions({ ...permissions, canManageTickets: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Can manage tickets</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canManageTeam}
                      onChange={(e) => setPermissions({ ...permissions, canManageTeam: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Can manage team</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Helper function to get team members for mentions
export async function getTeamMembersForMentions(projectId: string): Promise<{ id: string; name: string; email: string }[]> {
  try {
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    
    const db = getFirestore(getApp());
    const membersQuery = query(
      collection(db, 'projectMembers'),
      where('projectId', '==', projectId)
    );

    const snapshot = await getDocs(membersQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.userId,
        name: data.userName,
        email: data.userEmail,
      };
    });
  } catch (error) {
    console.error('Failed to get team members:', error);
    return [];
  }
}
