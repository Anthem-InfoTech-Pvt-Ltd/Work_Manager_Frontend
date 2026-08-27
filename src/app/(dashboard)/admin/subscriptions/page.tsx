'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return (
    <div style={{ padding: '64px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Redirecting to User Management & Subscriptions...</p>
    </div>
  );
}
