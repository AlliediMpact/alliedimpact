'use client';

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { TrendingUp, Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveVoteCounterProps {
  tournamentId: string;
  teamId: string;
  teamName: string;
  showTrend?: boolean;
  className?: string;
}

export default function LiveVoteCounter({ 
  tournamentId, 
  teamId, 
  teamName,
  showTrend = true,
  className = ''
}: LiveVoteCounterProps) {
  const [voteCount, setVoteCount] = useState<number>(0);
  const [previousCount, setPreviousCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Subscribe to real-time vote updates
    const teamDocRef = doc(db, 'cupfinal_tournaments', tournamentId, 'teams', teamId);
    
    const unsubscribe = onSnapshot(
      teamDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const newCount = data.voteCount || 0;
          
          // Detect change and trigger animation
          if (newCount !== voteCount && voteCount !== 0) {
            setPreviousCount(voteCount);
            setShowAnimation(true);
            
            // Determine trend
            if (newCount > voteCount) {
              setTrend('up');
            } else if (newCount < voteCount) {
              setTrend('down');
            } else {
              setTrend('stable');
            }
            
            // Hide animation after 2 seconds
            setTimeout(() => setShowAnimation(false), 2000);
          }
          
          setVoteCount(newCount);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error subscribing to vote updates:', error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [tournamentId, teamId]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading votes...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Users className="h-4 w-4 text-purple-600" />
      
      <AnimatePresence mode="wait">
        <motion.span
          key={voteCount}
          initial={{ scale: 1 }}
          animate={{ 
            scale: showAnimation ? [1, 1.3, 1] : 1,
            color: showAnimation && trend === 'up' ? '#16a34a' : undefined
          }}
          transition={{ duration: 0.5 }}
          className="font-bold text-lg"
        >
          {voteCount.toLocaleString()}
        </motion.span>
      </AnimatePresence>
      
      <span className="text-sm text-muted-foreground">votes</span>
      
      {showTrend && showAnimation && trend === 'up' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center text-green-600 text-sm"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          +{voteCount - previousCount}
        </motion.div>
      )}
    </div>
  );
}
