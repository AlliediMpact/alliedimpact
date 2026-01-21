'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Tournament, VotingOption, VotingItemType, TiebreakerRule } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export default function AddVotingItemPage({ params }: { params: { tournamentId: string } }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'team' as VotingItemType,
    tiebreaker: 'sudden-death' as TiebreakerRule,
    maxVotesPerUser: 0, // 0 = unlimited
    votingWindowOpens: '',
    votingWindowCloses: '',
  });
  const [options, setOptions] = useState<Array<{ id: string; label: string; description: string }>>([
    { id: crypto.randomUUID(), label: '', description: '' },
  ]);

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
        setTournament({
          ...data,
          tournamentId: tournamentDoc.id,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
        } as Tournament);

        // Set default voting windows to tournament times
        setFormData(prev => ({
          ...prev,
          votingWindowOpens: data.startTime?.toDate().toISOString().slice(0, 16) || '',
          votingWindowCloses: data.endTime?.toDate().toISOString().slice(0, 16) || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), label: '', description: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      alert('You must have at least 2 options');
      return;
    }
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleOptionChange = (id: string, field: 'label' | 'description', value: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  const handleSubmit = async () => {
    if (!currentUser || !tournament) return;

    // Validation
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const validOptions = options.filter(opt => opt.label.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }

    setSaving(true);
    try {
      const votingItem = {
        id: crypto.randomUUID(),
        type: formData.type,
        title: formData.title,
        description: formData.description,
        options: validOptions.map(opt => ({
          id: opt.id,
          label: opt.label,
          description: opt.description || undefined,
        })),
        votingWindow: {
          opens: new Date(formData.votingWindowOpens),
          closes: new Date(formData.votingWindowCloses),
        },
        maxVotesPerUser: formData.maxVotesPerUser || undefined,
        tiebreaker: formData.tiebreaker,
      };

      const tournamentRef = doc(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments', params.tournamentId);

      const existingItems = tournament.votingItems || [];
      await updateDoc(tournamentRef, {
        votingItems: [...existingItems, votingItem],
        updatedAt: serverTimestamp(),
      });

      alert('Voting item added successfully!');
      router.push(`/admin/tournaments/${params.tournamentId}/edit`);
    } catch (error) {
      console.error('Error adding voting item:', error);
      alert('Failed to add voting item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add Voting Item
          </CardTitle>
          <CardDescription>
            Create a new voting category for {tournament?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VotingItemType })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="team">Team</option>
                <option value="venue">Venue</option>
                <option value="format">Format</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Best Team of the Year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what fans are voting for..."
                rows={3}
              />
            </div>
          </div>

          {/* Voting Window */}
          <div className="space-y-4">
            <h3 className="font-semibold">Voting Window</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opens">Opens *</Label>
                <Input
                  id="opens"
                  type="datetime-local"
                  value={formData.votingWindowOpens}
                  onChange={(e) => setFormData({ ...formData, votingWindowOpens: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closes">Closes *</Label>
                <Input
                  id="closes"
                  type="datetime-local"
                  value={formData.votingWindowCloses}
                  onChange={(e) => setFormData({ ...formData, votingWindowCloses: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Voting Options</h3>
              <Button
                type="button"
                onClick={handleAddOption}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <Card key={option.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder={`Option ${index + 1} name *`}
                          value={option.label}
                          onChange={(e) => handleOptionChange(option.id, 'label', e.target.value)}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={option.description}
                          onChange={(e) => handleOptionChange(option.id, 'description', e.target.value)}
                        />
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveOption(option.id)}
                          className="text-red-600 hover:text-red-700"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Advanced Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="maxVotes">Max Votes Per User (0 = unlimited)</Label>
              <Input
                id="maxVotes"
                type="number"
                min="0"
                value={formData.maxVotesPerUser}
                onChange={(e) => setFormData({ ...formData, maxVotesPerUser: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiebreaker">Tiebreaker Rule</Label>
              <select
                id="tiebreaker"
                value={formData.tiebreaker}
                onChange={(e) => setFormData({ ...formData, tiebreaker: e.target.value as TiebreakerRule })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="sudden-death">Sudden Death</option>
                <option value="random">Random</option>
                <option value="admin-decision">Admin Decision</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Voting Item
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
