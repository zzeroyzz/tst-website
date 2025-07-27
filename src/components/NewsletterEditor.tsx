/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/NewsletterEditor.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Button from './Button';
import Input from './Input';
import { Post } from '@/types';
import toast from 'react-hot-toast';
import NewsletterPreviewModal from './NewsletterPreviewModal';
import { coreTags } from '@/data/tagData';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface NewsletterEditorProps {
    post: Post | null;
}

type ArchivePost = Pick<Post, 'id' | 'title'>;

const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ post: initialPost }) => {
    const [post, setPost] = useState<Post | null>(initialPost);
    const [title, setTitle] = useState(initialPost?.title || '');
    const [subject, setSubject] = useState(initialPost?.subject || '');
    const [body, setBody] = useState(initialPost?.body || '');
    const [imageUrl, setImageUrl] = useState(initialPost?.image_url || '');
    const [toastyTake, setToastyTake] = useState(initialPost?.toasty_take || '');
    const [archivePosts, setArchivePosts] = useState<string[]>(initialPost?.archive_posts || []);
    const [tags, setTags] = useState<string[]>(initialPost?.tags || []);

    const [allPosts, setAllPosts] = useState<ArchivePost[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    const fetchAllPosts = useCallback(async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('id, title')
            .eq('status', 'published')
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

    const handleSaveForLater = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const postData = {
            title,
            subject,
            body,
            image_url: imageUrl,
            toasty_take: toastyTake,
            archive_posts: archivePosts,
            tags: tags,
            status: 'draft',
            slug: slugify(title),
            ...(post?.id && { id: post.id }),
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
            tags: tags,
            slug: slugify(title),
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
            title,
            subject,
            body,
            image_url: imageUrl,
            toasty_take: toastyTake,
            archive_posts: archivePosts,
            tags: tags,
            slug: slugify(title),
            ...(post?.id && { id: post.id }),
            ...(post?.created_at && { created_at: post.created_at }),
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

                {/* Main Content Section */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Main Content</h2>
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Article Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <Input
                            type="text"
                            placeholder="Email Subject Line"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Main body content..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                            className="w-full p-4 font-medium border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple"
                            rows={15}
                        />

                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <label className="block font-bold text-gray-700">Main Article Image</label>

                            {/* Current Image Display */}
                            {imageUrl && (
                                <div className="relative inline-block">
                                    <Image
                                        src={imageUrl}
                                        alt="Article preview"
                                        width={192}
                                        height={128}
                                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
                                    />
                                    <Button
                                        type="button"
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
                                    type="button"
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
                        placeholder="Your weekly tip or reflection..."
                        value={toastyTake}
                        onChange={(e) => setToastyTake(e.target.value)}
                        className="w-full p-4 font-medium border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple"
                        rows={5}
                    />
                </div>

                {/* Archive Selection Section */}
                <div className="p-6 bg-white border-2 border-black rounded-lg shadow-brutalistLg">
                    <h2 className="text-2xl font-bold mb-4">Select 3 Archived Posts</h2>
                    <p className="mb-4 text-sm text-gray-600">You have selected {archivePosts.length} of 3 posts.</p>
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

                {/* Buttons */}
                <div className="flex justify-end items-center gap-4">
                    <Button type="submit" className="bg-tst-purple" disabled={isSubmitting || isUploading}>
                        {isSubmitting ? 'Saving...' : 'Save for Later'}
                    </Button>
                    <Button type="button" onClick={handlePreview} className="bg-tst-yellow" disabled={isSubmitting || isUploading}>
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
