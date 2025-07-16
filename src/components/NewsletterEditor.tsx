/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/NewsletterEditor.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Button from './Button';
import Input from './Input';
import { Post } from '@/types';
import toast from 'react-hot-toast';
import NewsletterPreviewModal from './NewsletterPreviewModal';
import { coreTags } from '@/data/tagData'; // Import core tags

interface NewsletterEditorProps {
    post: Post | null;
}

const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ post: initialPost }) => {
    const [post, setPost] = useState<Post | null>(initialPost);
    const [title, setTitle] = useState(initialPost?.title || '');
    const [subject, setSubject] = useState(initialPost?.subject || '');
    const [body, setBody] = useState(initialPost?.body || '');
    const [imageUrl, setImageUrl] = useState(initialPost?.image_url || '');
    const [toastyTake, setToastyTake] = useState(initialPost?.toasty_take || '');
    const [archivePosts, setArchivePosts] = useState<string[]>(initialPost?.archive_posts || []);
    const [tags, setTags] = useState<string[]>(initialPost?.tags || []); // State for tags

    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const router = useRouter();
    const supabase = createClientComponentClient();

    // (fetchAllPosts and handleArchiveSelection hooks remain the same)
    const fetchAllPosts = useCallback(async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('id, title')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts for archive:', error);
        } else {
            setAllPosts(data.filter(p => p.id !== post?.id));
        }
    }, [supabase, post?.id]);

    useEffect(() => {
        fetchAllPosts();
    }, [fetchAllPosts]);

    const handleArchiveSelection = (postId: string) => {
        setArchivePosts(prev => {
            if (prev.includes(postId)) {
                return prev.filter(id => id !== postId);
            } else if (prev.length < 3) {
                return [...prev, postId];
            }
            return prev;
        });
    };

    const handleTagSelection = (tag: string) => {
        setTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSaveForLater = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const postData = {
            id: post?.id,
            title,
            subject,
            body,
            image_url: imageUrl,
            toasty_take: toastyTake,
            archive_posts: archivePosts,
            tags: tags, // Include tags
            status: 'draft',
        };

        const { error } = await supabase.from('posts').upsert(postData);

        if (error) {
            toast.error(`Error saving draft: ${error.message}`);
        } else {
            toast.success('Draft saved successfully!');
            router.push('/dashboard?view=Newsletter');
            router.refresh();
        }
        setIsSubmitting(false);
    };

    const handlePreview = async () => {
        setIsSubmitting(true);
        const loadingToast = toast.loading('Generating preview...');

        const currentPostData = {
            title,
            subject,
            body,
            image_url: imageUrl,
            toasty_take: toastyTake,
            archive_posts: archivePosts,
            tags: tags, // Include tags
        };

        try {
            const response = await fetch('/api/newsletter/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPostData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to generate preview.');

            setPreviewHtml(result.html);
            setIsPreviewing(true);
            toast.dismiss(loadingToast);

        } catch (err: any) {
            toast.dismiss(loadingToast);
            toast.error(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSend = async () => {
        setIsSubmitting(true);
        const loadingToast = toast.loading('Sending newsletter...');

        const postData = {
            id: post?.id,
            created_at: post?.created_at,
            title,
            subject,
            body,
            image_url: imageUrl,
            toasty_take: toastyTake,
            archive_posts: archivePosts,
            tags: tags, // Include tags
        };

        try {
            const response = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to send campaign.');

            toast.dismiss(loadingToast);
            toast.success('Newsletter sent successfully!');
            setIsPreviewing(false);
            router.push('/dashboard?view=Newsletter');
            router.refresh();

        } catch (err: any) {
            toast.dismiss(loadingToast);
            toast.error(`Error sending newsletter: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSaveForLater} className="space-y-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold">{post ? 'Edit Newsletter' : 'Create New Newsletter'}</h1>

                {/* Main Content Section (no changes) */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Main Content</h2>
                    <div className="space-y-4">
                        <Input type="text" placeholder="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <Input type="text" placeholder="Email Subject Line" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                        <textarea placeholder="Main body content... (supports Markdown)" value={body} onChange={(e) => setBody(e.target.value)} required className="w-full p-4 font-medium border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple" rows={15} />
                        <Input type="url" placeholder="Main Article Image URL (e.g., https://...)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>
                </div>

                {/* Core Tags Section */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Core Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {coreTags.map(tag => (
                            <label key={tag} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 border-black has-[:checked]:bg-tst-purple">
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    value={tag}
                                    checked={tags.includes(tag)}
                                    onChange={() => handleTagSelection(tag)}
                                />
                                <span className="font-bold text-sm">{tag}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Toasty Take Section (no changes) */}
                <div className="p-6 bg-tst-green border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Toasty Take</h2>
                    <textarea placeholder="Your weekly tip or reflection..." value={toastyTake} onChange={(e) => setToastyTake(e.target.value)} className="w-full p-4 font-medium border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple" rows={5} />
                </div>

                {/* Archive Selection Section (no changes) */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Select 3 Archived Posts</h2>
                    <p className="mb-4 text-sm text-gray-600">You have selected {archivePosts.length} of 3 posts.</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-2">
                        {allPosts.length > 0 ? allPosts.map(p => (
                            <label key={p.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input type="checkbox" checked={archivePosts.includes(p.id)} onChange={() => handleArchiveSelection(p.id)} disabled={archivePosts.length >= 3 && !archivePosts.includes(p.id)} className="h-5 w-5 rounded border-gray-300 text-tst-purple focus:ring-tst-purple" />
                                <span>{p.title}</span>
                            </label>
                        )) : <p className="text-gray-500">No published posts available to select.</p>}
                    </div>
                </div>

                {/* Buttons (no changes) */}
                <div className="flex justify-end items-center gap-4">
                    <Button type="submit" className="bg-tst-purple" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save for Later'}
                    </Button>
                    <Button type="button" onClick={handlePreview} className="bg-tst-yellow" disabled={isSubmitting}>
                        {isSubmitting ? 'Generating...' : 'Preview'}
                    </Button>
                </div>
            </form>

            {isPreviewing && (
                <NewsletterPreviewModal
                    htmlContent={previewHtml}
                    onClose={() => setIsPreviewing(false)}
                    onSend={handleSend}
                    isSending={isSubmitting}
                />
            )}
        </>
    );
};

export default NewsletterEditor;
