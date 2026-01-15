import { generateMetadata } from '@/lib/utils/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata({
  title: 'Journey History',
  description: 'Track your K53 journey progress, view past attempts, and monitor your learning statistics.',
  keywords: ['journey history', 'progress tracking', 'learning statistics', 'attempt history'],
  noIndex: true,
});
