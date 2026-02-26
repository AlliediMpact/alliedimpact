'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Tournament, TournamentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TournamentsListPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TournamentStatus | 'all'>('all');

  const CUPFINAL_PROJECT_ID = 'cupfinal'; // CupFinal is the first project

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const tournamentsRef = collection(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments');
      
      let q = query(tournamentsRef, orderBy('createdAt', 'desc'));
      
      if (filter !== 'all') {
        q = query(tournamentsRef, where('status', '==', filter), orderBy('createdAt', 'desc'));
      }

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

  const getStatusBadge = (status: TournamentStatus) => {
    const variants: Record<TournamentStatus, string> = {
      draft: 'bg-gray-500',
      open: 'bg-green-500',
      closed: 'bg-red-500',
      completed: 'bg-blue-500',
    };

    return (
      <Badge className={`${variants[status]} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            CupFinal Tournaments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage voting tournaments for the CupFinal project
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/tournaments/create')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'open', 'closed', 'completed'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status as TournamentStatus | 'all')}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tournaments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? 'No tournaments found. Create your first tournament to get started!'
                : `No ${filter} tournaments found.`}
            </p>
            <Button
              onClick={() => router.push('/admin/tournaments/create')}
              variant="outline"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.tournamentId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{tournament.name}</CardTitle>
                    <CardDescription>{tournament.description}</CardDescription>
                  </div>
                  {getStatusBadge(tournament.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Tournament Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Start Time</p>
                      <p className="font-medium">
                        {format(tournament.startTime, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">End Time</p>
                      <p className="font-medium">
                        {format(tournament.endTime, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Voting Items</p>
                      <p className="font-medium">{tournament.votingItems?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-medium">
                        {format(tournament.createdAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/tournaments/${tournament.tournamentId}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/tournaments/${tournament.tournamentId}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {tournament.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
