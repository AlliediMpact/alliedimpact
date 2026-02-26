'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Tournament, VotingItem, VotingOption, VotingItemType, TiebreakerRule } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Plus, Trash2, Edit2, Eye } from 'lucide-react';

export default function EditTournamentPage({ params }: { params: { tournamentId: string } }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'draft' as 'draft' | 'open' | 'closed' | 'completed',
  });

  const CUPFINAL_PROJECT_ID = 'cupfinal';

  useEffect(() => {
    fetchTournament();
  }, [params.tournamentId]);

  const fetchTournament = async () => {
    try {
      const tournamentRef = doc(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments', params.tournamentId);
      const tournamentDoc = await getDoc(tournamentRef);

      if (tournamentDoc.exists()) {
        const data = tournamentDoc.data();
        const tournamentData = {
          ...data,
          tournamentId: tournamentDoc.id,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Tournament;

        setTournament(tournamentData);
        setFormData({
          name: tournamentData.name,
          description: tournamentData.description,
          startTime: tournamentData.startTime.toISOString().slice(0, 16),
          endTime: tournamentData.endTime.toISOString().slice(0, 16),
          status: tournamentData.status,
        });
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasicInfo = async () => {
    if (!currentUser || !tournament) return;

    setSaving(true);
    try {
      const tournamentRef = doc(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments', params.tournamentId);

      await updateDoc(tournamentRef, {
        name: formData.name,
        description: formData.description,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        status: formData.status,
        updatedAt: serverTimestamp(),
      });

      alert('Tournament updated successfully!');
      fetchTournament();
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Failed to update tournament');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishTournament = async () => {
    if (!tournament) return;

    if (!tournament.votingItems || tournament.votingItems.length === 0) {
      alert('Cannot publish tournament without voting items');
      return;
    }

    setSaving(true);
    try {
      const tournamentRef = doc(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments', params.tournamentId);

      await updateDoc(tournamentRef, {
        status: 'open',
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert('Tournament published successfully!');
      fetchTournament();
    } catch (error) {
      console.error('Error publishing tournament:', error);
      alert('Failed to publish tournament');
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublishTournament = async () => {
    if (!tournament) return;

    setSaving(true);
    try {
      const tournamentRef = doc(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments', params.tournamentId);

      await updateDoc(tournamentRef, {
        status: 'draft',
        updatedAt: serverTimestamp(),
      });

      alert('Tournament unpublished successfully!');
      fetchTournament();
    } catch (error) {
      console.error('Error unpublishing tournament:', error);
      alert('Failed to unpublish tournament');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Tournament not found</p>
            <Button onClick={() => router.push('/admin/tournaments')} className="mt-4">
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tournaments
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Edit Tournament
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage tournament details and voting items
          </p>
        </div>
        <div className="flex gap-2">
          {tournament.status === 'draft' ? (
            <Button
              onClick={handlePublishTournament}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          ) : tournament.status === 'open' ? (
            <Button
              onClick={handleUnpublishTournament}
              disabled={saving}
            >
              Unpublish
            </Button>
          ) : null}
        </div>
      </div>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tournament name, description, and schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tournament Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., 2026 National Cup Finals"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the tournament..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Date & Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Date & Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <Button onClick={handleUpdateBasicInfo} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Voting Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Voting Items</CardTitle>
              <CardDescription>Categories that fans will vote on</CardDescription>
            </div>
            <Button
              onClick={() => router.push(`/admin/tournaments/${params.tournamentId}/add-voting-item`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Voting Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!tournament.votingItems || tournament.votingItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No voting items yet. Add your first voting category to get started.
              </p>
              <Button
                onClick={() => router.push(`/admin/tournaments/${params.tournamentId}/add-voting-item`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Voting Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tournament.votingItems.map((item: VotingItem) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Badge>{item.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {item.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Options:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {item.options.map((option) => (
                              <div key={option.id} className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                {option.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/admin/tournaments/${params.tournamentId}/edit-voting-item/${item.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
