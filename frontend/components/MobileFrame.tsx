import React from 'react';

export default function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-center h-[100dvh] w-screen bg-neutral-950 overflow-hidden">
      <div className="relative w-full h-full max-w-2xl mx-auto bg-neutral-950 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
