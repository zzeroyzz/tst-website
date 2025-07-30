// src/lib/custom-email-templates.test.ts
import {
  getWelcomeEmailTemplate,
  getContactConfirmationTemplate,
  getContactWarmupTemplate,
} from '../custom-email-templates'

describe('Email Templates', () => {
  describe('getWelcomeEmailTemplate', () => {
    it('generates welcome email with user name', () => {
      const template = getWelcomeEmailTemplate({ name: 'John' })

      expect(template).toContain('Welcome to toasty tidbits, John!')
      expect(template).toContain('I\'m so glad you\'re here')
      expect(template).toContain('Guide 1: Navigating your care with confidence')
      expect(template).toContain('Guide 2: Communicate with heart and clarity')
      expect(template).toContain('Guide 3: Reconnect with yourself for regulation')
    })

    it('includes all three guide download links', () => {
      const template = getWelcomeEmailTemplate({ name: 'Jane' })

      // Check for PDF links
      expect(template).toContain('Navigating%20your%20care%20with%20confidence')
      expect(template).toContain('Communicate%20with%20heart%20and%20clarity')
      expect(template).toContain('Reconnect%20with%20yourself%20for%20regulation')

      // Check for proper href attributes
      expect(template).toContain('href="https://pvbdrbaquwivhylsmagn.supabase.co')
    })

    it('includes proper email structure', () => {
      const template = getWelcomeEmailTemplate({ name: 'Test' })

      expect(template).toContain('<!DOCTYPE html>')
      expect(template).toContain('</html>')
      expect(template).toContain('color-scheme: light')
      expect(template).toContain('Toasted Sesame Therapy')
    })

    it('includes unsubscribe link', () => {
      const template = getWelcomeEmailTemplate({ name: 'Test' })

      expect(template).toContain('*|UNSUB|*')
      expect(template).toContain('unsubscribe here')
    })

    it('includes dark mode protection styles', () => {
      const template = getWelcomeEmailTemplate({ name: 'Test' })

      expect(template).toContain('force-light')
      expect(template).toContain('force-white')
      expect(template).toContain('force-black-text')
      expect(template).toContain('@media (prefers-color-scheme: dark)')
    })
  })

  describe('getContactConfirmationTemplate', () => {
    it('generates confirmation email with user name', () => {
      const template = getContactConfirmationTemplate({ name: 'Sarah' })

      expect(template).toContain('Thanks for reaching out, Sarah!')
      expect(template).toContain('free, no-pressure 15-minute consultation')
      expect(template).toContain('Schedule Your Free Consultation')
    })

    it('includes consultation booking link', () => {
      const template = getContactConfirmationTemplate({ name: 'Test' })

      expect(template).toContain('toastedsesametherapyllc.clientsecure.me')
      expect(template).toContain('request/service')
    })

    it('explains next steps clearly', () => {
      const template = getContactConfirmationTemplate({ name: 'Test' })

      expect(template).toContain('Here\'s what to expect next')
      expect(template).toContain('We\'ll use that time to chat')
      expect(template).toContain('see if it\'s a good fit')
    })

    it('includes proper branding', () => {
      const template = getContactConfirmationTemplate({ name: 'Test' })

      expect(template).toContain('TST-LOGO.png')
      expect(template).toContain('Toasted Sesame Therapy')
    })
  })

  describe('getContactWarmupTemplate', () => {
    it('generates warmup email with user name', () => {
      const template = getContactWarmupTemplate({ name: 'Mike' })

      expect(template).toContain('Hi, Mike!')
      expect(template).toContain('still interested in scheduling')
      expect(template).toContain('free 15-minute consultation')
    })

    it('includes consultation booking link', () => {
      const template = getContactWarmupTemplate({ name: 'Test' })

      expect(template).toContain('toastedsesametherapyllc.clientsecure.me')
      expect(template).toContain('Schedule Your Free Consultation')
    })

    it('has gentle, non-pushy tone', () => {
      const template = getContactWarmupTemplate({ name: 'Test' })

      expect(template).toContain('Checking in to see if')
      expect(template).toContain('great opportunity for us to connect')
      expect(template).not.toContain('urgent')
      expect(template).not.toContain('limited time')
    })
  })

  describe('Email Template Common Features', () => {
    const templates = [
      getWelcomeEmailTemplate({ name: 'Test' }),
      getContactConfirmationTemplate({ name: 'Test' }),
      getContactWarmupTemplate({ name: 'Test' }),
    ]

    templates.forEach((template, index) => {
      const templateName = ['Welcome', 'Contact Confirmation', 'Contact Warmup'][index]

      it(`${templateName} template includes proper HTML structure`, () => {
        expect(template).toContain('<!DOCTYPE html>')
        expect(template).toContain('<html lang="en"')
        expect(template).toContain('</html>')
        expect(template).toContain('<head>')
        expect(template).toContain('</head>')
        expect(template).toContain('<body')
        expect(template).toContain('</body>')
      })

      it(`${templateName} template is mobile responsive`, () => {
        expect(template).toContain('viewport')
        expect(template).toContain('max-width: 680px')
        expect(template).toContain('mobile-padding')
        expect(template).toContain('@media screen and (max-width: 680px)')
      })

      it(`${templateName} template has accessibility features`, () => {
        expect(template).toContain('alt=')
        expect(template).toContain('role="presentation"')
      })

      it(`${templateName} template has proper email client compatibility`, () => {
        expect(template).toContain('mso-table-lspace')
        expect(template).toContain('border-collapse: collapse')
        expect(template).toContain('<!--[if mso')
      })

      it(`${templateName} template includes footer with unsubscribe`, () => {
        expect(template).toContain('Toasted Sesame Therapy')
        expect(template).toContain('*|UNSUB|*')
      })
    })
  })

  describe('Email Template Security', () => {
    it('does not include user input without proper escaping', () => {
      // Test with potentially malicious input
      const maliciousName = '<script>alert("xss")</script>'
      const template = getWelcomeEmailTemplate({ name: maliciousName })

      // Should not contain unescaped script tags
      expect(template).not.toContain('<script>')
      expect(template).not.toContain('alert(')
    })

    it('includes proper Content Security Policy headers', () => {
      const template = getWelcomeEmailTemplate({ name: 'Test' })

      // Should not include inline JavaScript
      expect(template).not.toContain('javascript:')
      expect(template).not.toContain('onclick=')
      expect(template).not.toContain('onload=')
    })
  })

  describe('Email Template Performance', () => {
    it('generates templates quickly', () => {
      const start = Date.now()

      for (let i = 0; i < 100; i++) {
        getWelcomeEmailTemplate({ name: `User${i}` })
      }

      const end = Date.now()
      const duration = end - start

      // Should generate 100 templates in less than 1 second
      expect(duration).toBeLessThan(1000)
    })

    it('templates are reasonable size', () => {
      const template = getWelcomeEmailTemplate({ name: 'Test' })

      // Should be less than 100KB
      expect(template.length).toBeLessThan(100 * 1024)

      // But more than 10KB (has actual content)
      expect(template.length).toBeGreaterThan(10 * 1024)
    })
  })
})
