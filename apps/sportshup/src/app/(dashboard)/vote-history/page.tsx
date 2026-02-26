'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Vote } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export default function VoteHistoryPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalSpent: 0,
    projectsVoted: new Set<string>(),
  });

  const CUPFINAL_PROJECT_ID = 'cupfinal';

  useEffect(() => {
    if (currentUser) {
      fetchVoteHistory();
    }
  }, [currentUser]);

  const fetchVoteHistory = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const votesRef = collection(
        db,
        'sportshub_projects',
        CUPFINAL_PROJECT_ID,
        'votes'
      );

      const q = query(
        votesRef,
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const votesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        voteId: doc.id,
        timestamp: doc.data().timestamp?.toDate(),
      })) as Vote[];

      setVotes(votesData);

      // Calculate stats
      const totalSpent = votesData.length * 200; // R2 per vote
      const projectsVoted = new Set(votesData.map(v => v.projectId));

      setStats({
        totalVotes: votesData.length,
        totalSpent,
        projectsVoted,
      });
    } catch (error) {
      console.error('Error fetching vote history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">Please log in to view your vote history</p>
            <Button onClick={() => router.push('/login')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Vote History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View all your voting activity and receipts
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Votes Cast</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{stats.totalVotes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Amount Spent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  R{(stats.totalSpent / 100).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Projects Participated</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.projectsVoted.size}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Vote History List */}
          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading vote history...</p>
              </CardContent>
            </Card>
          ) : votes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No votes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't cast any votes yet. Start voting on tournaments!
                </p>
                <Button onClick={() => router.push('/tournaments')}>
                  Browse Tournaments
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {votes.map(vote => (
                <Card key={vote.voteId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">CupFinal</Badge>
                          <Badge className="bg-green-500 text-white">R2.00</Badge>
                        </div>
                        <h4 className="font-semibold text-lg mb-1">
                          Vote Cast
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Tournament ID: {vote.tournamentId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Selected Option: {vote.selectedOption}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4" />
                          {format(vote.timestamp, 'MMM dd, yyyy HH:mm')}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/tournaments/${vote.tournamentId}/results`)
                          }
                        >
                          View Results
                        </Button>
                      </div>
                    </div>

                    {/* Wallet Balance Change */}
                    <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                      <span className="text-gray-600">Wallet Balance Change:</span>
                      <span className="font-medium">
                        R{(vote.walletBalanceBefore / 100).toFixed(2)} →{' '}
                        R{(vote.walletBalanceAfter / 100).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
