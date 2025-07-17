// src/components/NewsletterView.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import Button from "@/components/Button";
import { Post } from "@/types";

const NewsletterView = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
  };

  const tagColors = [
    "bg-tst-teal", "bg-tst-purple", "bg-tst-yellow", "bg-tst-green", "bg-tst-red"
  ];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) return <p>Loading posts...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Newsletter Posts</h2>
        <Button className="bg-tst-purple flex items-center" onClick={() => router.push('/dashboard/newsletter/create')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Post
        </Button>
      </div>

      <div className="bg-white border-2 border-black rounded-lg shadow-brutalistLg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-black bg-gray-50">
              <tr>
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Tags</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => router.push(`/dashboard/newsletter/${post.id}`)}
                  className="border-b border-gray-200 hover:bg-tst-yellow cursor-pointer"
                >
                  <td className="p-4 font-medium">{post.title}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {(post.tags || []).map((tag, index) => (
                            <span key={tag} className={`px-2 py-1 text-xs font-bold rounded-full text-black ${tagColors[index % tagColors.length]}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                  </td>
                  <td className="p-4">{format(new Date(post.created_at), "PPP")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${statusColors[post.status] || 'bg-gray-100'}`}>
                      {post.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewsletterView;
