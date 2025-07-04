'use client'

import React from 'react'
import { SplitScreenLayout } from './split-screen-layout'
import { MinimalInputCard } from '@/components/homepage/minimal-input-card'
import { PremiumAdPane } from '@/components/ads/premium-ad-pane'
import { Footer } from './footer'

interface PublicPageLayoutProps {
  children: React.ReactNode
  showUrlInput?: boolean
  className?: string
}

export function PublicPageLayout({ 
  children, 
  showUrlInput = true,
  className = ''
}: PublicPageLayoutProps) {
  return (
    <>
      <SplitScreenLayout
        leftContent={
          showUrlInput ? (
            <MinimalInputCard />
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="w-full max-w-md">
                {children}
              </div>
            </div>
          )
        }
        rightContent={<PremiumAdPane />}
        className={className}
      />
      <Footer />
    </>
  )
}