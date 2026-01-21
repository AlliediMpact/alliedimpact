'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Tournament } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import { TOURNAMENT_TEMPLATES, TournamentTemplate } from '@/lib/templates';

export default function CreateTournamentFromTemplatePage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<TournamentTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectTemplate = (template: TournamentTemplate) => {
    setSelectedTemplate(template);
    setName(template.name);
    setDescription(template.description);
  };

  const handleCreateTournament = async () => {
    if (!currentUser || !selectedTemplate) return;

    if (!name || !description || !startDate || !endDate) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const tournamentId = `tournament_${Date.now()}`;
      const tournamentRef = doc(db, 'sportshub_projects', 'cupfinal', 'tournaments', tournamentId);

      const tournament: Partial<Tournament> = {
        name,
        description,
        projectId: 'cupfinal',
        status: 'draft',
        startTime: new Date(startDate),
        endTime: new Date(endDate),
        votingItems: selectedTemplate.votingItems.map((item, index) => ({
          ...item,
          votingItemId: `item_${index + 1}`,
        })),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await setDoc(tournamentRef, tournament);

      alert('Tournament created successfully from template!');
      router.push(`/admin/tournaments/${tournamentId}/edit`);
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8">
        <p>Please log in to create tournaments</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/tournaments/create">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Create from Template
          </h1>
          <p className="text-gray-600">Choose a template to get started quickly</p>
        </div>
      </div>

      {!selectedTemplate ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOURNAMENT_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {template.name}
                  {template.category === 'football' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Football
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Includes:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {template.votingItems.length === 0 ? (
                      <li>No pre-configured voting items</li>
                    ) : (
                      template.votingItems.map((item, index) => (
                        <li key={index}>{item.title}</li>
                      ))
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configure Tournament</CardTitle>
                  <CardDescription>
                    Using template: {selectedTemplate.name}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Change Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tournament Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter tournament name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the tournament"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Template includes:
                </p>
                {selectedTemplate.votingItems.length === 0 ? (
                  <p className="text-sm text-blue-700">
                    No voting items - you'll add them after creation
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {selectedTemplate.votingItems.map((item, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {item.title} ({item.options.length} options)
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCreateTournament}
                  disabled={loading || !name || !description || !startDate || !endDate}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Tournament'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/tournaments/create')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
