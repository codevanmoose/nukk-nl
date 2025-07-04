'use client';

import { ReactNode } from 'react';

interface SplitScreenLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export default function SplitScreenLayout({ leftContent, rightContent }: SplitScreenLayoutProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Desktop split-screen layout */}
      <div className="hidden md:grid md:grid-cols-[30%_70%] h-full">
        {/* Left side - Functionality */}
        <div className="relative bg-gray-50 h-full overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-12">
            {leftContent}
          </div>
        </div>
        
        {/* Right side - Advertisement */}
        <div className="relative bg-gray-100 h-full overflow-hidden">
          {rightContent}
        </div>
      </div>
      
      {/* Mobile stacked layout */}
      <div className="md:hidden flex flex-col h-full overflow-y-auto">
        {/* Ad on top for mobile */}
        <div className="relative min-h-[50vh] bg-gray-100">
          {rightContent}
        </div>
        
        {/* Functionality below */}
        <div className="relative bg-white flex-1 min-h-[50vh]">
          <div className="flex items-center justify-center min-h-full p-6">
            {leftContent}
          </div>
        </div>
      </div>
    </div>
  );
}