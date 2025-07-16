// src/app/dashboard/newsletter/[id]/page.tsx
"use client";

import React,  { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import NewsletterEditor from "@/components/NewsletterEditor";
import { Post } from "@/types"; // We will create this type definition next

const NewsletterPostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    const fetchPost = useCallback(async () => {
        // If the id is 'create', we are making a new post
        if (id === 'create') {
            setLoading(false);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching post:', error);
        } else {
            setPost(data);
        }
        setLoading(false);
    }, [id, supabase]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    if (loading) {
        return <div className="p-10">Loading editor...</div>;
    }

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <NewsletterEditor post={post} />
        </div>
    );
};

export default NewsletterPostPage;
