'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Tournament } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Vote, ArrowRight } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

export default function TournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const CUPFINAL_PROJECT_ID = 'cupfinal';

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const tournamentsRef = collection(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments');
      
      // Only show open tournaments to public
      const q = query(
        tournamentsRef,
        where('status', '==', 'open'),
        orderBy('startTime', 'desc')
      );

      const snapshot = await getDocs(q);
      const tournamentsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        tournamentId: doc.id,
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Tournament[];

      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeStatus = (tournament: Tournament) => {
    const now = new Date();
    
    if (isBefore(now, tournament.startTime)) {
      return { label: 'Upcoming', color: 'bg-yellow-500' };
    } else if (isAfter(now, tournament.endTime)) {
      return { label: 'Ended', color: 'bg-gray-500' };
    } else {
      return { label: 'Live Now', color: 'bg-green-500 animate-pulse' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">CupFinal Voting</h1>
            </div>
            <p className="text-xl text-purple-100">
              Have your say in South African football! Vote on tournaments, teams, and formats. 
              Every vote costs R2 and helps shape the beautiful game.
            </p>
          </div>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Tournaments</h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no tournaments open for voting right now. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 max-w-4xl mx-auto">
            {tournaments.map((tournament) => {
              const timeStatus = getTimeStatus(tournament);
              
              return (
                <Card 
                  key={tournament.tournamentId} 
                  className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                          <Badge className={`${timeStatus.color} text-white`}>
                            {timeStatus.label}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {tournament.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Tournament Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">Start</p>
                            <p className="text-sm font-medium">
                              {format(tournament.startTime, 'MMM dd, HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-pink-600" />
                          <div>
                            <p className="text-xs text-gray-500">End</p>
                            <p className="text-sm font-medium">
                              {format(tournament.endTime, 'MMM dd, HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Vote className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Voting Items</p>
                            <p className="text-sm font-medium">
                              {tournament.votingItems?.length || 0} items
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vote Cost Info */}
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div>
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            Voting Cost
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            Each vote costs R2.00
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          R2.00
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => router.push(`/tournaments/${tournament.tournamentId}`)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                      >
                        View & Vote
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
