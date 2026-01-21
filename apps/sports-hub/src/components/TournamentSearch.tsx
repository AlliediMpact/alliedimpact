'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface Tournament {
  id: string;
  name: string;
  status: 'draft' | 'open' | 'closed';
  category?: string;
  projectId: string;
}

/**
 * Tournament Search Component
 * 
 * Global search for tournaments with keyboard shortcuts.
 * Features:
 * - Cmd/Ctrl+K to open
 * - Real-time Firestore search
 * - Status badges
 * - Keyboard navigation
 * - Recent searches (future)
 */
export default function TournamentSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search tournaments
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setTournaments([]);
      return;
    }

    const searchTournaments = async () => {
      setLoading(true);

      try {
        // Search by name (case-insensitive)
        const tournamentsRef = collection(db, 'tournaments');
        const q = query(
          tournamentsRef,
          where('status', '==', 'open'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((tournament: any) =>
            tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) as Tournament[];

        setTournaments(results);
      } catch (error) {
        console.error('Error searching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTournaments, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelect = (tournamentId: string) => {
    setOpen(false);
    setSearchQuery('');
    router.push(`/tournaments/${tournamentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search tournaments...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search tournaments by name..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? 'Searching...' : 'No tournaments found.'}
          </CommandEmpty>
          {tournaments.length > 0 && (
            <CommandGroup heading="Tournaments">
              {tournaments.map((tournament) => (
                <CommandItem
                  key={tournament.id}
                  onSelect={() => handleSelect(tournament.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm">{tournament.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(tournament.status)}
                  >
                    {tournament.status}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
