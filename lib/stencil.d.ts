declare namespace JSX {
  interface IntrinsicElements {
    'futalis-header': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'item-count'?: number
      'is-logged-in'?: boolean
    }
    'futalis-footer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      locale?: string
      'privacy-url'?: string
      'impressum-url'?: string
      'phone-number'?: string
      'whatsapp-number'?: string
      'business-hours'?: string
      'copyright-text'?: string
      'show-newsletter'?: boolean
    }
  }
}
