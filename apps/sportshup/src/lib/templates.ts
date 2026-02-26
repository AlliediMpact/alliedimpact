/**
 * Tournament Templates System
 * Provides pre-configured voting items for quick tournament creation
 */

import { VotingItem } from '@/types';

export interface TournamentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'football' | 'custom';
  votingItems: Omit<VotingItem, 'votingItemId'>[];
}

export const TOURNAMENT_TEMPLATES: TournamentTemplate[] = [
  {
    id: 'football_awards',
    name: 'Football Season Awards',
    description: 'Complete awards template with Player of Season, Goal of Season, and Best Team',
    category: 'football',
    votingItems: [
      {
        type: 'team',
        title: 'Player of the Season',
        description: 'Vote for the player who had the most outstanding performance this season',
        options: [
          { optionId: '1', label: 'Nominee 1', description: '' },
          { optionId: '2', label: 'Nominee 2', description: '' },
          { optionId: '3', label: 'Nominee 3', description: '' },
          { optionId: '4', label: 'Nominee 4', description: '' },
        ],
        votingOpensAt: new Date(),
        votingClosesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        maxVotesPerUser: 1,
        tiebreaker: 'first-to-reach',
      },
      {
        type: 'team',
        title: 'Goal of the Season',
        description: 'Vote for the most spectacular goal scored this season',
        options: [
          { optionId: '1', label: 'Goal 1', description: '' },
          { optionId: '2', label: 'Goal 2', description: '' },
          { optionId: '3', label: 'Goal 3', description: '' },
          { optionId: '4', label: 'Goal 4', description: '' },
        ],
        votingOpensAt: new Date(),
        votingClosesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxVotesPerUser: 1,
        tiebreaker: 'first-to-reach',
      },
      {
        type: 'team',
        title: 'Best Team Performance',
        description: 'Vote for the team with the best overall performance',
        options: [
          { optionId: '1', label: 'Team 1', description: '' },
          { optionId: '2', label: 'Team 2', description: '' },
          { optionId: '3', label: 'Team 3', description: '' },
          { optionId: '4', label: 'Team 4', description: '' },
        ],
        votingOpensAt: new Date(),
        votingClosesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxVotesPerUser: 1,
        tiebreaker: 'first-to-reach',
      },
    ],
  },
  {
    id: 'cup_final',
    name: 'Cup Final Tournament',
    description: 'Simple cup final voting template with winner prediction',
    category: 'football',
    votingItems: [
      {
        type: 'team',
        title: 'Cup Winner Prediction',
        description: 'Vote for the team you think will win the cup final',
        options: [
          { optionId: '1', label: 'Team A', description: '' },
          { optionId: '2', label: 'Team B', description: '' },
        ],
        votingOpensAt: new Date(),
        votingClosesAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        maxVotesPerUser: 1,
        tiebreaker: 'first-to-reach',
      },
      {
        type: 'team',
        title: 'Man of the Match',
        description: 'Vote for the player who will be Man of the Match',
        options: [
          { optionId: '1', label: 'Player 1', description: '' },
          { optionId: '2', label: 'Player 2', description: '' },
          { optionId: '3', label: 'Player 3', description: '' },
          { optionId: '4', label: 'Player 4', description: '' },
        ],
        votingOpensAt: new Date(),
        votingClosesAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        maxVotesPerUser: 1,
        tiebreaker: 'first-to-reach',
      },
    ],
  },
  {
    id: 'venue_selection',
    name: 'Match Venue Selection',
    description: 'Vote for the venue where the next match should be held',
    category: 'football',
    votingItems: [
      {
        type: 'venue',
        title: 'Preferred Match Venue',
        description: 'Select your preferred venue for the upcoming match',
        options: [
          { optionId: '1', label: 'Stadium A', description: 'Capacity: 50,000' },
          { optionId: '2', label: 'Stadium B', description: 'Capacity: 40,000' },
          { optionId: '3', label: 'Stadium C', description: 'Capacity: 30,000' },
        ],
        votingOpensAt: new Date(),
        votingClosesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxVotesPerUser: 1,
        tiebreaker: 'first-to-reach',
      },
    ],
  },
  {
    id: 'custom_blank',
    name: 'Blank Template',
    description: 'Start from scratch with no pre-configured voting items',
    category: 'custom',
    votingItems: [],
  },
];

export function getTemplate(templateId: string): TournamentTemplate | undefined {
  return TOURNAMENT_TEMPLATES.find((t) => t.id === templateId);
}

export function getTemplatesByCategory(category: 'football' | 'custom'): TournamentTemplate[] {
  return TOURNAMENT_TEMPLATES.filter((t) => t.category === category);
}
