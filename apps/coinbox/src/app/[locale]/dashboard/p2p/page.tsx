'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loading-states';

/**
 * P2P Redirect Page
 * Automatically redirects users to the P2P Crypto Marketplace
 * This maintains backward compatibility with old /dashboard/p2p route
 */
export default function P2PRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to P2P Crypto Marketplace
    router.replace('/p2p-crypto/marketplace');
  }, [router]);

  return <PageLoader />;
}
