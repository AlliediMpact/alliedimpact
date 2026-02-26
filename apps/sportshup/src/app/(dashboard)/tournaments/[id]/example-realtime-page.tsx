import React from 'react';
import LiveVoteCounter from '@/components/realtime/LiveVoteCounter';
import CountdownTimer from '@/components/realtime/CountdownTimer';
import LiveLeaderboard from '@/components/realtime/LiveLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TournamentDetailPageProps {
  params: {
    id: string;
  };
}

export default function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const tournamentId = params.id;
  
  // In a real implementation, fetch tournament data
  const tournamentEndDate = new Date('2026-02-01T23:59:59');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Tournament Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Tournament Name</h1>
        <p className="text-lg text-muted-foreground">
          Vote for your favorite team and watch the leaderboard update in real-time!
        </p>
      </div>

      {/* Countdown Timer Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Countdown</CardTitle>
          <CardDescription>Time remaining until voting ends</CardDescription>
        </CardHeader>
        <CardContent>
          <CountdownTimer 
            endDate={tournamentEndDate}
            size="lg"
            onExpire={() => {
              console.log('Tournament has ended!');
            }}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">Live Leaderboard</TabsTrigger>
          <TabsTrigger value="teams">All Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <LiveLeaderboard 
            tournamentId={tournamentId}
            maxTeams={10}
            showTrends={true}
          />
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid gap-4">
            {/* Example team cards with live vote counters */}
            <Card>
              <CardHeader>
                <CardTitle>Team Alpha</CardTitle>
              </CardHeader>
              <CardContent>
                <LiveVoteCounter 
                  tournamentId={tournamentId}
                  teamId="team-alpha-id"
                  teamName="Team Alpha"
                  showTrend={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Beta</CardTitle>
              </CardHeader>
              <CardContent>
                <LiveVoteCounter 
                  tournamentId={tournamentId}
                  teamId="team-beta-id"
                  teamName="Team Beta"
                  showTrend={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
