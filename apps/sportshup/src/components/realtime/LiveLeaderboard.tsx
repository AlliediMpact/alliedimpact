'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus, Loader2, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Team {
  id: string;
  name: string;
  voteCount: number;
  previousRank?: number;
  imageUrl?: string;
}

interface LiveLeaderboardProps {
  tournamentId: string;
  maxTeams?: number;
  showTrends?: boolean;
  autoScroll?: boolean;
  className?: string;
}

export default function LiveLeaderboard({ 
  tournamentId, 
  maxTeams = 10,
  showTrends = true,
  autoScroll = false,
  className = ''
}: LiveLeaderboardProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Subscribe to real-time leaderboard updates
    const teamsRef = collection(db, 'cupfinal_tournaments', tournamentId, 'teams');
    const q = query(teamsRef, orderBy('voteCount', 'desc'), limit(maxTeams));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updatedTeams: Team[] = [];
        
        snapshot.forEach((doc, index) => {
          const data = doc.data();
          const teamId = doc.id;
          
          // Find previous rank
          const previousTeam = teams.find(t => t.id === teamId);
          const previousRank = previousTeam 
            ? teams.findIndex(t => t.id === teamId) + 1 
            : undefined;
          
          updatedTeams.push({
            id: teamId,
            name: data.name || 'Unknown Team',
            voteCount: data.voteCount || 0,
            imageUrl: data.imageUrl,
            previousRank
          });
        });
        
        setTeams(updatedTeams);
        setLastUpdate(new Date());
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to leaderboard:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tournamentId, maxTeams]);

  const getRankChange = (currentRank: number, previousRank?: number) => {
    if (!previousRank) return null;
    
    const change = previousRank - currentRank;
    
    if (change > 0) {
      return { type: 'up' as const, value: change };
    } else if (change < 0) {
      return { type: 'down' as const, value: Math.abs(change) };
    } else {
      return { type: 'same' as const, value: 0 };
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              Live Leaderboard
            </CardTitle>
            <CardDescription>
              Updates in real-time • Last update: {lastUpdate.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 inline-block" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {teams.map((team, index) => {
              const rank = index + 1;
              const rankChange = getRankChange(rank, team.previousRank);
              
              return (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    rank <= 3 ? 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/20' : 'bg-card'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(rank)}`}>
                      {rank <= 3 && getRankIcon(rank)}
                      {rank > 3 && <span className="text-lg">{rank}</span>}
                    </div>
                  </div>

                  {/* Team Image */}
                  {team.imageUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={team.imageUrl} 
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{team.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-purple-600">
                        {team.voteCount.toLocaleString()} votes
                      </span>
                      
                      {showTrends && rankChange && (
                        <div className="flex items-center gap-1">
                          {rankChange.type === 'up' && (
                            <>
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-green-600 text-xs">+{rankChange.value}</span>
                            </>
                          )}
                          {rankChange.type === 'down' && (
                            <>
                              <TrendingDown className="h-3 w-3 text-red-600" />
                              <span className="text-red-600 text-xs">-{rankChange.value}</span>
                            </>
                          )}
                          {rankChange.type === 'same' && (
                            <>
                              <Minus className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-500 text-xs">—</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Position Badge for Top 3 */}
                  {rank <= 3 && (
                    <div>
                      <Badge variant="outline" className={
                        rank === 1 ? 'border-yellow-500 text-yellow-600' :
                        rank === 2 ? 'border-gray-400 text-gray-600' :
                        'border-orange-500 text-orange-600'
                      }>
                        {rank === 1 && '🥇 1st'}
                        {rank === 2 && '🥈 2nd'}
                        {rank === 3 && '🥉 3rd'}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No teams yet</p>
            <p className="text-sm">Teams will appear once voting begins</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
