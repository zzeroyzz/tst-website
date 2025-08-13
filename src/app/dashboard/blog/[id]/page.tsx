// src/app/dashboard/blog/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import BlogEditor from '@/components/Blog/BlogEditor';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .eq('type', 'blog')
    .single();

  if (error || !post) {
    notFound();
  }
  return(
 <div className="p-10 bg-gray-50 min-h-screen">
  <BlogEditor post={post} />;
  </div>
  )
}
