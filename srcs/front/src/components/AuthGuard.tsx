"use client";

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2Icon } from "lucide-react"

export default function AuthGuard({
  supposelyAuth,
  children
}: {
  supposelyAuth?: boolean,
  children: React.ReactNode
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

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
      <div className="h-full flex items-center justify-center">
        <Loader2Icon className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>{children}</>
  );
}