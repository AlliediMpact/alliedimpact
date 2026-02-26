'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Tournament, VotingItem, VoteTally } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, TrendingUp } from 'lucide-react';

export default function TournamentResultsPage() {
  const router = useRouter();
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [voteTallies, setVoteTallies] = useState<Record<string, VoteTally[]>>({});
  const [loading, setLoading] = useState(true);

  const CUPFINAL_PROJECT_ID = 'cupfinal';
  const tournamentId = params.tournamentId as string;

  useEffect(() => {
    fetchTournamentAndResults();
  }, [tournamentId]);

  const fetchTournamentAndResults = async () => {
    setLoading(true);
    try {
      // Fetch tournament
      const tournamentRef = doc(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments', tournamentId);
      const tournamentSnap = await getDoc(tournamentRef);

      if (tournamentSnap.exists()) {
        const data = tournamentSnap.data();
        const tournamentData = {
          ...data,
          tournamentId: tournamentSnap.id,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Tournament;

        setTournament(tournamentData);

        // Fetch vote tallies for each voting item
        if (tournamentData.votingItems) {
          const tallies: Record<string, VoteTally[]> = {};

          for (const item of tournamentData.votingItems) {
            const talliesRef = collection(
              db,
              'sportshub_projects',
              CUPFINAL_PROJECT_ID,
              'vote_tallies'
            );

            const q = query(
              talliesRef,
              where('tournamentId', '==', tournamentId),
              where('votingItemId', '==', item.id)
            );

            const talliesSnap = await getDocs(q);
            tallies[item.id] = talliesSnap.docs.map(doc => doc.data() as VoteTally);
          }

          setVoteTallies(tallies);
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  const getWinningOption = (votingItemId: string) => {
    const itemTallies = voteTallies[votingItemId] || [];
    if (itemTallies.length === 0) return null;

    return itemTallies.reduce((max, tally) =>
      (tally.totalVotes > (max?.totalVotes || 0)) ? tally : max
    );
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
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Results: {tournament.name}</h1>
          </div>
          <p className="text-purple-100">{tournament.description}</p>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {tournament.votingItems && tournament.votingItems.map((item: VotingItem) => {
            const itemTallies = voteTallies[item.id] || [];
            const totalVotes = itemTallies.reduce((sum, tally) => sum + tally.totalVotes, 0);
            const winner = getWinningOption(item.id);

            return (
              <Card key={item.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.title}</span>
                    <Badge variant="secondary" className="text-sm">
                      {totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {item.options.map(option => {
                      const tally = itemTallies.find(t => t.option === option.id);
                      const votes = tally?.totalVotes || 0;
                      const percentage = calculatePercentage(votes, totalVotes);
                      const isWinner = winner?.option === option.id;

                      return (
                        <div
                          key={option.id}
                          className={`relative p-4 rounded-lg border-2 ${
                            isWinner
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {/* Winner Badge */}
                          {isWinner && (
                            <div className="absolute -top-3 -right-3">
                              <Badge className="bg-green-500 text-white">
                                <Trophy className="w-3 h-3 mr-1" />
                                Winner
                              </Badge>
                            </div>
                          )}

                          {/* Option Info */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{option.label}</h4>
                              {option.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-purple-600">
                                {votes}
                              </div>
                              <div className="text-sm text-gray-500">{percentage}%</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isWinner
                                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Overall Stats */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tournament Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Voting Items</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tournament.votingItems?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Votes Cast</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Object.values(voteTallies)
                      .flat()
                      .reduce((sum, tally) => sum + tally.totalVotes, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Generated</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R
                    {(
                      (Object.values(voteTallies)
                        .flat()
                        .reduce((sum, tally) => sum + tally.totalVotes, 0) *
                        200) /
                      100
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge className="mt-1 bg-purple-600 text-white">
                    {tournament.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
