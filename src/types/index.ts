export interface Post {
    id: string;
    created_at: string;
    title: string;
    subject: string;
    body: string;
    image_url: string;
    toasty_take: string;
    archive_posts: string[];
    status: 'draft' | 'published';
    sent_at?: string;
    tags?: string[];
    slug?: string;
    subtext?: string;
  }
