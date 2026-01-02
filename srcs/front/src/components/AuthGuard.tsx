"use client";

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Spinner from './Spinner';

export default function AuthGuard({
  supposelyAuth,
  children
}: {
  supposelyAuth?: Boolean,
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (supposelyAuth && isAuthenticated)
        router.push('/');
      else if (!supposelyAuth && !isAuthenticated)
        router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, supposelyAuth]);

  if (isLoading || (supposelyAuth && isAuthenticated) || (!supposelyAuth && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <>{children}</>
  );
}