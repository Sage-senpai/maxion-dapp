

'use client';

import { Suspense, ReactNode } from 'react';

interface SearchParamsWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SearchParamsWrapper({ 
  children, 
  fallback = <div className="flex items-center justify-center p-8"><div className="text-white">Loading...</div></div>
}: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}