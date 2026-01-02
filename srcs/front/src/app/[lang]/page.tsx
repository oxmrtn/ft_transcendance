"use client";

import React from 'react';
import AuthGuard from '../../components/AuthGuard';

export default function Page() {
  return (
    <AuthGuard>
      <div>
        <h1>Welcome!</h1>
      </div>
    </AuthGuard>
  );
}