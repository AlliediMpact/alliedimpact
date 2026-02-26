'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Tournament, VotingItem, VotingOption } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Vote, Wallet, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { createNotification, NotificationTemplates } from '@/lib/notifications';

export default function TournamentVotingPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const CUPFINAL_PROJECT_ID = 'cupfinal';
  const tournamentId = params.tournamentId as string;

  useEffect(() => {
    fetchTournament();
    if (currentUser) {
      fetchWalletBalance();
    }
  }, [params.tournamentId, currentUser]);

  const fetchTournament = async () => {
    setLoading(true);
    try {
      const tournamentRef = doc(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments', tournamentId);
      const tournamentSnap = await getDoc(tournamentRef);

      if (tournamentSnap.exists()) {
        const data = tournamentSnap.data();
        setTournament({
          ...data,
          tournamentId: tournamentSnap.id,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Tournament);
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    if (!currentUser) return;

    try {
      const walletRef = doc(db, 'sportshub_wallets', currentUser.uid);
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        setWalletBalance(walletSnap.data().balanceInCents || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleOptionSelect = (votingItemId: string, optionId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [votingItemId]: optionId,
    }));
  };

  const calculateTotalCost = () => {
    const voteCount = Object.keys(selectedVotes).length;
    return voteCount * 200; // R2.00 = 200 cents per vote
  };

  const canAffordVotes = () => {
    return walletBalance >= calculateTotalCost();
  };

  const handleSubmitVotes = async () => {
    if (!currentUser) {
      alert('Please log in to vote');
      router.push('/login');
      return;
    }

    if (Object.keys(selectedVotes).length === 0) {
      alert('Please select at least one option to vote');
      return;
    }

    if (!canAffordVotes()) {
      alert(`Insufficient balance. You need R${(calculateTotalCost() / 100).toFixed(2)} to cast these votes.`);
      router.push('/wallet');
      return;
    }

    setLoading(true);

    try {
      // Import dynamically to avoid issues
      const { castMultipleVotes } = await import('@/lib/voting');
      
      // Prepare votes
      const votes = Object.entries(selectedVotes).map(([votingItemId, optionId]) => ({
        projectId: CUPFINAL_PROJECT_ID,
        tournamentId,
        votingItemId,
        optionId,
      }));

      // Submit votes
      const results = await castMultipleVotes(votes);

      // Check results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        // Create in-app notification
        const voteTemplate = NotificationTemplates.voteConfirmed(
          tournament.name,
          successCount,
          `R${(calculateTotalCost() / 100).toFixed(2)}`
        );
        
        await createNotification(
          currentUser.uid,
          voteTemplate.type,
          voteTemplate.title,
          voteTemplate.message,
          `/vote-history`
        );

        alert(`✅ Success! ${successCount} vote(s) cast successfully!`);
        // Clear selections and refresh wallet
        setSelectedVotes({});
        await fetchWalletBalance();
      } else {
        alert(`⚠️ ${successCount} vote(s) succeeded, ${failCount} failed. Please try again.`);
      }
    } catch (error: any) {
      console.error('Error submitting votes:', error);
      alert(`Failed to submit votes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Tournament not found</p>
            <Button onClick={() => router.push('/tournaments')} className="mt-4">
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCost = calculateTotalCost();
  const selectedCount = Object.keys(selectedVotes).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/tournaments')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-purple-100">{tournament.description}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span>Ends: {format(tournament.endTime, 'MMM dd, yyyy HH:mm')}</span>
            <span>•</span>
            <span>{tournament.votingItems?.length || 0} voting items</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Voting Items */}
          <div className="lg:col-span-2 space-y-6">
            {tournament.votingItems && tournament.votingItems.length > 0 ? (
              tournament.votingItems.map((item: VotingItem) => (
                <Card key={item.id} className="border-2">
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {item.options.map((option: VotingOption) => {
                        const isSelected = selectedVotes[item.id] === option.id;
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect(item.id, option.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{option.label}</p>
                                {option.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {option.description}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">No voting items available</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Voting Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Wallet Balance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Your Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    R{(walletBalance / 100).toFixed(2)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/wallet')}
                    className="w-full mt-2"
                  >
                    Top Up Wallet
                  </Button>
                </CardContent>
              </Card>

              {/* Vote Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Vote className="w-5 h-5" />
                    Vote Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selected votes:</span>
                      <span className="font-medium">{selectedCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost per vote:</span>
                      <span className="font-medium">R2.00</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Cost:</span>
                      <span className="text-purple-600">
                        R{(totalCost / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {!canAffordVotes() && selectedCount > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Insufficient balance. Please top up your wallet.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitVotes}
                    disabled={selectedCount === 0 || !canAffordVotes()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Cast {selectedCount} {selectedCount === 1 ? 'Vote' : 'Votes'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
