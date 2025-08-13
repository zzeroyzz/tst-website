/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/BlogEditor.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { Post } from '@/types';
import toast from 'react-hot-toast';
import BlogPreviewModal from './BlogPreviewModal';
import { coreTags } from '@/data/tagData';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface BlogEditorProps {
    post: Post | null;
}

type ArchivePost = Pick<Post, 'id' | 'title'>;

const BlogEditor: React.FC<BlogEditorProps> = ({ post: initialPost }) => {
    const [post, setPost] = useState<Post | null>(initialPost);
    const [title, setTitle] = useState(initialPost?.title || '');
    const [body, setBody] = useState(initialPost?.body || '');
    const [imageUrl, setImageUrl] = useState(initialPost?.image_url || '');
    const [toastyTake, setToastyTake] = useState(initialPost?.toasty_take || '');
    const [archivePosts, setArchivePosts] = useState<string[]>(initialPost?.archive_posts || []);
    const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
    const [visibleToPublic, setVisibleToPublic] = useState(initialPost?.visible_to_public ?? false);

    const [allPosts, setAllPosts] = useState<ArchivePost[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    const fetchAllPosts = useCallback(async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('id, title')
            .eq('status', 'published')
            .eq('archived', false) // Only show non-archived posts for archive selection
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts for archive:', error);
        } else {
            setAllPosts((data as ArchivePost[]).filter(p => p.id !== post?.id));
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
        setTags(prev => {
            const newTags = prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag];
            return newTags;
        });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadToast = toast.loading('Uploading image...');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to upload image');
            }

            setImageUrl(result.url);
            toast.dismiss(uploadToast);
            toast.success('Image uploaded successfully!');

        } catch (error: any) {
            toast.dismiss(uploadToast);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = () => {
        setImageUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    // Enhanced slug generation to ensure uniqueness
    const generateUniqueSlug = async (title: string, existingPostId?: string) => {
        const baseSlug = slugify(title);

        // Check if this slug already exists (excluding the current post if editing)
        let query = supabase
            .from('posts')
            .select('slug')
            .eq('slug', baseSlug);

        if (existingPostId) {
            query = query.neq('id', existingPostId);
        }

        const { data: existingSlugs, error } = await query;

        if (error) {
            console.error('Error checking slug uniqueness:', error);
            // Fallback to timestamp-based slug
            return `${baseSlug}-${Date.now()}`;
        }

        // If no conflicts, use the base slug
        if (!existingSlugs || existingSlugs.length === 0) {
            return baseSlug;
        }

        // If conflicts exist, append timestamp
        return `${baseSlug}-${Date.now()}`;
    };

    const handleSaveForLater = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Generate unique slug
            const uniqueSlug = await generateUniqueSlug(title, post?.id);

            const postData = {
                title,
                body,
                image_url: imageUrl,
                toasty_take: toastyTake,
                archive_posts: archivePosts,
                tags: tags,
                status: 'draft',
                type: 'blog', // Set type to blog
                archived: false, // New posts are not archived
                visible_to_public: visibleToPublic, // Use the toggle value
                slug: uniqueSlug,
                ...(post?.id && { id: post.id }),
            };

            const { data: savedPost, error } = await supabase.from('posts').upsert(postData).select().single();

            if (error) {
                toast.error(`Error saving draft: ${error.message}`);
            } else {
                toast.success('Blog draft saved successfully!');
                router.push(`/dashboard/mental-health-healing-blog/${savedPost.id}`);
                router.refresh();
            }
        } catch (error: any) {
            toast.error(`Error saving draft: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePreview = async () => {
        // Simple validation
        if (!title.trim()) {
            toast.error('Please enter a title to preview');
            return;
        }
        if (!body.trim()) {
            toast.error('Please enter some content to preview');
            return;
        }

        // Open preview modal with current data - no API call needed!
        setIsPreviewing(true);
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        const loadingToast = toast.loading('Publishing blog post...');

        try {
            // Generate unique slug
            const uniqueSlug = await generateUniqueSlug(title, post?.id);

            const postData = {
                title,
                body,
                image_url: imageUrl,
                toasty_take: toastyTake,
                archive_posts: archivePosts,
                tags: tags,
                type: 'blog',
                archived: false,
                slug: uniqueSlug,
                status: 'published',
                visible_to_public: visibleToPublic, // Use the toggle value for publishing too
                sent_at: new Date().toISOString(), // Set published date
                ...(post?.id && { id: post.id }),
                ...(post?.created_at && { created_at: post.created_at }),
            };

            const { data: publishedPost, error } = await supabase
                .from('posts')
                .upsert(postData)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            toast.dismiss(loadingToast);
            toast.success('Blog post published successfully!');
            setIsPreviewing(false);

            // Redirect to the public post page that was just published
            if (publishedPost.slug) {
                router.push(`/posts/${publishedPost.slug}`);
            } else {
                // Fallback to blog list if no slug returned
                router.push('/dashboard?view=Blog');
            }
            router.refresh();

        } catch (err: any) {
            toast.dismiss(loadingToast);
            toast.error(`Error publishing blog post: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <form onSubmit={handleSaveForLater} className="space-y-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold">{post ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>

                {/* Main Content Section */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Main Content</h2>
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Blog Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Write your blog post content here..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                            className="w-full p-4 font-medium border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple"
                            rows={15}
                        />

                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <label className="block font-bold text-gray-700">Featured Image</label>

                            {/* Current Image Display */}
                            {imageUrl && (
                                <div className="relative inline-block">
                                    <Image
                                        src={imageUrl}
                                        alt="Blog post preview"
                                        width={192}
                                        height={128}
                                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
                                    />
                                    <Button
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        wrapperClassName="absolute -top-2 -right-2"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            )}

                            {/* Upload Controls */}
                            <div className="flex gap-4 items-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 bg-tst-yellow"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Upload Image
                                        </>
                                    )}
                                </Button>

                                {!imageUrl && (
                                    <span className="text-sm text-gray-500">
                                        Or paste an image URL below
                                    </span>
                                )}
                            </div>

                            {/* Manual URL Input */}
                            <Input
                                type="url"
                                placeholder="Or paste image URL here (e.g., https://...)"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Core Tags Section */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Core Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {coreTags.map(tag => (
                            <label
                                key={tag}
                                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 border-black transition-colors ${
                                    tags.includes(tag) ? 'bg-tst-purple text-black' : 'bg-white hover:bg-gray-100'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    value={tag}
                                    checked={tags.includes(tag)}
                                    onChange={() => handleTagSelection(tag)}
                                />
                                <span className="font-bold text-sm select-none">{tag}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Toasty Take Section */}
                <div className="p-6 bg-tst-green border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Toasty Take</h2>
                    <textarea
                        placeholder="Your key insight or takeaway for this blog post..."
                        value={toastyTake}
                        onChange={(e) => setToastyTake(e.target.value)}
                        className="w-full p-4 font-medium border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple"
                        rows={5}
                    />
                </div>

                {/* Archive Selection Section */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
                    <p className="mb-4 text-sm text-gray-600">Select up to 3 related posts to show at the bottom of your blog post. You have selected {archivePosts.length} of 3 posts.</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-2">
                        {allPosts.length > 0 ? allPosts.map(p => (
                            <label key={p.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={archivePosts.includes(p.id)}
                                    onChange={() => handleArchiveSelection(p.id)}
                                    disabled={archivePosts.length >= 3 && !archivePosts.includes(p.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-tst-purple focus:ring-tst-purple"
                                />
                                <span>{p.title}</span>
                            </label>
                        )) : <p className="text-gray-500">No published posts available to select.</p>}
                    </div>
                </div>

                {/* Public Visibility Section */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Public Visibility</h2>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Control whether this blog post appears in public archives and is accessible via URL.
                        </p>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={visibleToPublic}
                                onChange={(e) => setVisibleToPublic(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-tst-purple focus:ring-tst-purple"
                            />
                            <div>
                                <span className="font-bold">Make visible to public</span>
                                <p className="text-sm text-gray-500">
                                    {visibleToPublic
                                        ? 'This post will appear in archives and be accessible via URL'
                                        : 'This post will be hidden from public view (testing mode)'
                                    }
                                </p>
                            </div>
                        </label>

                        {/* Visual indicator */}
                        <div className={`p-3 rounded-lg border-2 ${
                            visibleToPublic
                                ? 'bg-green-50 border-green-200'
                                : 'bg-orange-50 border-orange-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${
                                    visibleToPublic ? 'text-green-800' : 'text-orange-800'
                                }`}>
                                    {visibleToPublic ? '👁️ Public Mode' : '🔒 Testing Mode'}
                                </span>
                            </div>
                            <p className={`text-xs mt-1 ${
                                visibleToPublic ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                {visibleToPublic
                                    ? 'This post will be visible to all website visitors'
                                    : 'This post will only be visible in the dashboard for testing'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-center gap-4">
                    <Button type="submit" className="bg-tst-purple" disabled={isSubmitting || isUploading}>
                        {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button onClick={handlePreview} className="bg-tst-yellow" disabled={isUploading || !title.trim() || !body.trim()}>
                        Preview
                    </Button>
                </div>
            </form>

            {isPreviewing && (
                <BlogPreviewModal
                    title={title}
                    body={body}
                    imageUrl={imageUrl}
                    toastyTake={toastyTake}
                    tags={tags}
                    onClose={() => setIsPreviewing(false)}
                    onPublish={handlePublish}
                    isPublishing={isSubmitting}
                />
            )}
        </div>
    );
};

export default BlogEditor;
