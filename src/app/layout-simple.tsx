'use client';

import { SimpleAuthProvider } from '@/components/auth/SimpleAuthenticationSystem';
import SimpleNavigation from '@/components/SimpleNavigation';

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SimpleAuthProvider>
      <SimpleNavigation />
      <main>{children}</main>
    </SimpleAuthProvider>
  );
}
