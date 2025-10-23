'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { defineCustomElements } from '@futalis-it/shared-components/loader'

export default function Header() {
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Stencil components
    defineCustomElements(window)

    // Add event listener for logo click
    const headerElement = headerRef.current?.querySelector('futalis-header')
    if (headerElement) {
      headerElement.addEventListener('logoClick', () => {
        router.push('/')
      })
    }

    return () => {
      if (headerElement) {
        headerElement.removeEventListener('logoClick', () => {})
      }
    }
  }, [router])

  return (
    <div ref={headerRef}>
      <futalis-header />
    </div>
  )
}
