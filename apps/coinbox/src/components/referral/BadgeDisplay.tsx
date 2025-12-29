/**
 * Badge Display Component
 * 
 * Shows user's unlocked badges, XP progress, and next badge milestone.
 * Integrated with the enhanced referral commission system.
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Award, Gem } from "lucide-react";
import { BADGE_SYSTEM } from "@/config/referral-commission-config";

interface BadgeDisplayProps {
  unlockedBadges: string[];
  totalXP: number;
  directReferrals: number;
  nextBadge: string | null;
  nextBadgeProgress: number;
}

export function BadgeDisplay({ 
  unlockedBadges, 
  totalXP, 
  directReferrals,
  nextBadge, 
  nextBadgeProgress 
}: BadgeDisplayProps) {
  
  // Badge icon mapping
  const badgeIcons: Record<string, React.ReactNode> = {
    BRONZE: <Award className="h-8 w-8 text-orange-600" />,
    SILVER: <Star className="h-8 w-8 text-gray-400" />,
    GOLD: <Trophy className="h-8 w-8 text-yellow-500" />,
    DIAMOND: <Gem className="h-8 w-8 text-blue-400" />,
  };
  
  // Badge colors
  const badgeColors: Record<string, string> = {
    BRONZE: 'bg-orange-100 border-orange-300',
    SILVER: 'bg-gray-100 border-gray-300',
    GOLD: 'bg-yellow-100 border-yellow-300',
    DIAMOND: 'bg-blue-100 border-blue-300',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievement Badges
        </CardTitle>
        <CardDescription>
          Earn badges by referring new users and unlock rewards!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total XP</span>
            <Badge variant="secondary">{totalXP} XP</Badge>
          </div>
          <div className="relative">
            <Progress value={Math.min((totalXP / 500) * 100, 100)} className="h-2" />
            <span className="text-xs text-muted-foreground mt-1">
              {totalXP < 500 ? `${500 - totalXP} XP to max level` : 'Max level reached!'}
            </span>
          </div>
        </div>
        
        {/* Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(BADGE_SYSTEM).map(([key, badge]) => {
            const isUnlocked = unlockedBadges.includes(key);
            const isNext = nextBadge === badge.name;
            
            return (
              <div
                key={key}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${isUnlocked ? badgeColors[key] : 'bg-gray-50 border-gray-200 opacity-50'}
                  ${isNext ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
              >
                <div className="flex flex-col items-center space-y-2">
                  {/* Badge Icon */}
                  <div className={`${isUnlocked ? '' : 'grayscale'}`}>
                    {badgeIcons[key]}
                  </div>
                  
                  {/* Badge Name */}
                  <div className="text-center">
                    <div className="font-semibold text-sm">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {badge.directReferralsRequired} referrals
                    </div>
                  </div>
                  
                  {/* Badge Status */}
                  {isUnlocked ? (
                    <Badge variant="default" className="text-xs">
                      Unlocked ✓
                    </Badge>
                  ) : isNext ? (
                    <Badge variant="outline" className="text-xs">
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Locked
                    </Badge>
                  )}
                  
                  {/* Rewards Display */}
                  {isUnlocked && (
                    <div className="text-xs text-center space-y-1 mt-2 pt-2 border-t">
                      <div className="text-green-600 font-semibold">
                        R{badge.rewardAmount} earned
                      </div>
                      <div className="text-blue-600">
                        +{badge.xpReward} XP
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Next Badge Progress */}
        {nextBadge && nextBadgeProgress < 100 && (
          <div className="space-y-2 p-4 bg-primary/5 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Progress to {nextBadge} Badge
              </span>
              <Badge variant="outline">
                {Math.round(nextBadgeProgress)}%
              </Badge>
            </div>
            <Progress value={nextBadgeProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              You have <strong>{directReferrals}</strong> direct referrals. 
              {Object.entries(BADGE_SYSTEM).map(([key, badge]) => {
                if (badge.name === nextBadge) {
                  const remaining = badge.directReferralsRequired - directReferrals;
                  return remaining > 0 
                    ? ` Refer ${remaining} more ${remaining === 1 ? 'user' : 'users'} to unlock!`
                    : ' Congratulations, you qualify!';
                }
                return null;
              })}
            </p>
          </div>
        )}
        
        {/* All Badges Unlocked */}
        {unlockedBadges.length === Object.keys(BADGE_SYSTEM).length && (
          <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg border border-yellow-300">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-bold text-lg text-yellow-800">
              🎉 All Badges Unlocked!
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              You&apos;ve achieved the highest level. Keep referring to earn more commissions!
            </p>
          </div>
        )}
        
        {/* Badge Rewards Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {unlockedBadges.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Badges Unlocked
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">
              {totalXP}
            </div>
            <div className="text-xs text-muted-foreground">
              Total XP
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">
              R{unlockedBadges.reduce((sum, key) => {
                return sum + (BADGE_SYSTEM[key]?.rewardAmount || 0);
              }, 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              Badge Rewards
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}
