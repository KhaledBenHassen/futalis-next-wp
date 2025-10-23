'use client'

import { useEffect, useRef } from 'react'
import { defineCustomElements } from '@futalis-it/shared-components/loader'

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Stencil components
    defineCustomElements(window)

    // Add event listener for newsletter click
    const footerElement = footerRef.current?.querySelector('futalis-footer')
    if (footerElement) {
      footerElement.addEventListener('newsletterClick', () => {
        console.log('Newsletter clicked')
      })
    }

    return () => {
      if (footerElement) {
        footerElement.removeEventListener('newsletterClick', () => {})
      }
    }
  }, [])

  return (
    <div ref={footerRef}>
      <futalis-footer
        locale="de"
        privacy-url="/datenschutz"
        impressum-url="/impressum"
        phone-number="+49 341 392 987 9 0"
        whatsapp-number="4934139298790"
        business-hours="Mo - Fr: 9 - 17"
        copyright-text="© futalis GmbH"
      />
    </div>
  )
}
