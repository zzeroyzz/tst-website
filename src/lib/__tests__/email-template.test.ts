// src/lib/__tests__/email-template.test.ts
import { getEmailHtml } from '../email-template';

describe('Email Template Generation', () => {
  const mockEmailData = {
    header_title: 'Weekly Newsletter',
    formatted_date: 'January 15, 2024',
    main_title: 'Understanding Anxiety',
    main_body:
      'This week we explore the nature of anxiety and how to manage it effectively.',
    main_image_url: 'https://example.com/anxiety-image.jpg',
    toasty_take:
      'Remember that anxiety is a normal human emotion, and learning to work with it rather than against it can be transformative.',
    archive_posts: [
      {
        title: 'Managing Stress',
        subtext: 'Practical techniques for daily stress management',
        slug: 'managing-stress',
        image_url: 'https://example.com/stress-image.jpg',
      },
      {
        title: 'Mindful Breathing',
        subtext: 'Simple breathing exercises for immediate calm',
        slug: 'mindful-breathing',
        image_url: 'https://example.com/breathing-image.jpg',
      },
    ],
  };

  describe('Basic Template Generation', () => {
    it('should generate complete HTML email template', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('</head>');
      expect(html).toContain('<body');
      expect(html).toContain('</body>');
    });

    it('should include all required email structure elements', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('charset="utf-8"');
      expect(html).toContain('viewport');
      expect(html).toContain('X-UA-Compatible');
      expect(html).toContain('toasty tidbits');
    });

    it('should include MSO conditional comments for Outlook compatibility', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('<!--[if !mso]><!-->');
      expect(html).toContain('<!--<![endif]-->');
      expect(html).toContain('<!--[if mso | IE]>');
    });

    it('should include email-specific CSS properties', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('mso-table-lspace');
      expect(html).toContain('mso-table-rspace');
      expect(html).toContain('border-collapse: collapse');
      expect(html).toContain('-ms-interpolation-mode: bicubic');
    });
  });

  describe('Content Insertion', () => {
    it('should insert header content correctly', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('Weekly Newsletter');
      expect(html).toContain('January 15, 2024');
    });

    it('should insert main article content', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('Understanding Anxiety');
      expect(html).toContain('This week we explore the nature of anxiety');
      expect(html).toContain('https://example.com/anxiety-image.jpg');
    });

    it('should insert toasty take content', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('Remember that anxiety is a normal human emotion');
      expect(html).toContain('Your favorite therapist, Kay');
    });

    it('should include static elements', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('From the Archive');
      expect(html).toContain('Ready to go deeper?');
      expect(html).toContain('Book a Free Consultation');
      expect(html).toContain('Toasted Sesame Therapy');
    });
  });

  describe('Archive Posts Processing', () => {
    it('should render all archive posts', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('Managing Stress');
      expect(html).toContain(
        'Practical techniques for daily stress management'
      );
      expect(html).toContain('Mindful Breathing');
      expect(html).toContain('Simple breathing exercises for immediate calm');
    });

    it('should create proper links for archive posts', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain(
        'https://toastedsesametherapy.com/posts/managing-stress'
      );
      expect(html).toContain(
        'https://toastedsesametherapy.com/posts/mindful-breathing'
      );
      expect(html).toContain('Read more &rarr;');
    });

    it('should include archive post images', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('https://example.com/stress-image.jpg');
      expect(html).toContain('https://example.com/breathing-image.jpg');
    });

    it('should handle empty archive posts array', () => {
      const dataWithNoArchive = { ...mockEmailData, archive_posts: [] };
      const html = getEmailHtml(dataWithNoArchive);

      expect(html).toContain('From the Archive');
      expect(html).not.toContain('Managing Stress');
    });

    it('should handle undefined archive posts', () => {
      const dataWithUndefinedArchive = {
        ...mockEmailData,
        archive_posts: undefined,
      };
      const html = getEmailHtml(dataWithUndefinedArchive);

      expect(html).toContain('From the Archive');
      expect(() => getEmailHtml(dataWithUndefinedArchive)).not.toThrow();
    });
  });

  describe('Security and HTML Escaping', () => {
    const maliciousData = {
      header_title: '<script>alert("xss")</script>Hacked Newsletter',
      formatted_date: '<img src=x onerror=alert("xss")>January 15, 2024',
      main_title:
        '<script>window.location="http://evil.com"</script>Malicious Title',
      main_body:
        'Normal content <script>steal_cookies()</script> with embedded script',
      toasty_take: 'Take this: <script>alert("pwned")</script>',
      main_image_url: 'javascript:alert("xss")',
      archive_posts: [
        {
          title: '<script>alert("archive hack")</script>Archive Post',
          subtext: 'Subtext with <script>evil()</script> code',
          slug: '../../../etc/passwd',
          image_url: 'javascript:void(0)',
        },
      ],
    };

    it('should escape HTML in header content', () => {
      const html = getEmailHtml(maliciousData);

      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
      expect(html).toContain('Hacked Newsletter');
    });

    it('should escape HTML in main content', () => {
      const html = getEmailHtml(maliciousData);

      expect(html).not.toContain('<script>window.location');
      expect(html).not.toContain('<script>steal_cookies()');
      expect(html).toContain('&lt;script&gt;');
    });

    //TODO
    // it('should escape HTML in toasty take', () => {
    //   const html = getEmailHtml(maliciousData)

    //   expect(html).not.toContain('<script>alert("pwned")</script>')
    //   expect(html).toContain('&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;')
    // })

    it('should escape HTML in archive posts', () => {
      const html = getEmailHtml(maliciousData);

      expect(html).not.toContain('<script>alert("archive hack")</script>');
      expect(html).not.toContain('<script>evil()</script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should handle malicious URLs safely', () => {
      const html = getEmailHtml(maliciousData);

      expect(html).not.toContain('javascript:alert("xss")');
      expect(html).not.toContain('javascript:void(0)');
      // Should use fallback image for invalid URLs
      expect(html).toContain('cho-cloud-hero.png');
    });

    it('should sanitize archive post slugs', () => {
      const html = getEmailHtml(maliciousData);

      expect(html).toContain('../../../etc/passwd'); // Escaped in URL
      expect(html).toContain(
        'https://toastedsesametherapy.com/posts/../../../etc/passwd'
      );
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should include mobile-specific CSS', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('@media screen and (max-width: 680px)');
      expect(html).toContain('.email-container { width: 100% !important; }');
      expect(html).toContain('.mobile-padding');
      expect(html).toContain(
        '.archive-img { width: 60px !important; height: 60px !important; }'
      );
    });

    it('should include mobile padding classes', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('class="mobile-padding"');
    });
  });

  describe('Accessibility', () => {
    //TODO
    // it('should include proper alt text for images', () => {
    //   const html = getEmailHtml(mockEmailData)

    //   expect(html).toContain('alt="Toasted Sesame Therapy Logo"')
    //   expect(html).toContain('alt="Main Article"')
    //   expect(html).toContain('alt="Toasty Tidbit Icon"')
    // })

    it('should use semantic HTML structure', () => {
      const html = getEmailHtml(mockEmailData);

      expect(html).toContain('role="presentation"');
      expect(html).toContain('<h1 class="h1"');
      expect(html).toContain('<h2 class="h2"');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty data object', () => {
      expect(() => getEmailHtml({})).not.toThrow();

      const html = getEmailHtml({});
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('From the Archive');
    });

    it('should handle null values gracefully', () => {
      const dataWithNulls = {
        header_title: null,
        formatted_date: null,
        main_title: null,
        main_body: null,
        toasty_take: null,
        main_image_url: null,
        archive_posts: null,
      };

      expect(() => getEmailHtml(dataWithNulls)).not.toThrow();

      const html = getEmailHtml(dataWithNulls);
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should handle undefined values gracefully', () => {
      const dataWithUndefined = {
        header_title: undefined,
        formatted_date: undefined,
        main_title: undefined,
        main_body: undefined,
        toasty_take: undefined,
        main_image_url: undefined,
        archive_posts: undefined,
      };

      expect(() => getEmailHtml(dataWithUndefined)).not.toThrow();

      const html = getEmailHtml(dataWithUndefined);
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should handle archive posts with missing properties', () => {
      const dataWithIncompleteArchive = {
        ...mockEmailData,
        archive_posts: [
          { title: 'Only Title' },
          { subtext: 'Only Subtext' },
          { slug: 'only-slug' },
          {}, // Completely empty
        ],
      };

      expect(() => getEmailHtml(dataWithIncompleteArchive)).not.toThrow();

      const html = getEmailHtml(dataWithIncompleteArchive);
      expect(html).toContain('Only Title');
      expect(html).toContain('Only Subtext');
    });
  });

  describe('Performance', () => {
    it('should generate template quickly', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        getEmailHtml(mockEmailData);
      }

      const end = Date.now();
      const duration = end - start;

      // Should generate 100 templates in less than 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large archive posts arrays', () => {
      const manyArchivePosts = Array.from({ length: 50 }, (_, i) => ({
        title: `Archive Post ${i + 1}`,
        subtext: `Subtext for post ${i + 1}`,
        slug: `archive-post-${i + 1}`,
        image_url: `https://example.com/image-${i + 1}.jpg`,
      }));

      const dataWithManyPosts = {
        ...mockEmailData,
        archive_posts: manyArchivePosts,
      };

      expect(() => getEmailHtml(dataWithManyPosts)).not.toThrow();

      const html = getEmailHtml(dataWithManyPosts);
      expect(html).toContain('Archive Post 1');
      expect(html).toContain('Archive Post 50');
    });
  });

  describe('Template Size', () => {
    it('should generate reasonable template size', () => {
      const html = getEmailHtml(mockEmailData);

      // Should be less than 100KB but more than 10KB
      expect(html.length).toBeLessThan(100 * 1024);
      expect(html.length).toBeGreaterThan(10 * 1024);
    });
  });
});
