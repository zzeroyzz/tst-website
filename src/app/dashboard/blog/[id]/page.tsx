// src/app/dashboard/blog/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import BlogEditor from '@/components/Blog/BlogEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: PageProps) {
  // Await the params promise in Next.js 15
  const { id } = await params;

  const supabase = createServerComponentClient({ cookies });

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('type', 'blog')
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <BlogEditor post={post} />
    </div>
  );
}
