/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/NewsletterView.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PlusCircle, X } from "lucide-react";
import Button from "@/components/Button/Button";
import { Post } from "@/types";
import { NewsletterViewSkeleton } from "@/components/skeleton";
import toast from "react-hot-toast";

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({
  post,
  onClose,
  onConfirm,
  isDeleting
}: {
  post: Post;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-black shadow-brutalistLg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Delete Post</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            disabled={isDeleting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this post?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="font-medium text-sm">&quot;{post.title}&quot;</p>
            <p className="text-xs text-gray-500 mt-1">
              {post.status} • {format(new Date(post.created_at), "PPP")}
            </p>
          </div>
          <p className="text-red-600 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-200"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const NewsletterView = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; post: Post | null }>({
    show: false,
    post: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
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
      toast.error("Failed to fetch posts");
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeleteClick = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation(); // Prevent row click
    console.log("Delete button clicked for post:", post.id, post.title); // Debug log
    setDeleteModal({ show: true, post });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.post) {
      console.error("No post selected for deletion");
      return;
    }

    const postToDelete = deleteModal.post;
    console.log("Attempting to delete post:", postToDelete.id, postToDelete.title); // Debug log

    setIsDeleting(true);
    const deleteToast = toast.loading('Deleting post...');

    try {
      // First, let's check if the post exists
      const { data: existingPost, error: checkError } = await supabase
        .from("posts")
        .select("id, title")
        .eq("id", postToDelete.id)
        .single();

      if (checkError) {
        console.error("Error checking if post exists:", checkError);
        throw new Error(`Post not found: ${checkError.message}`);
      }

      console.log("Post exists, proceeding with deletion:", existingPost); // Debug log

      // Now delete the post
      const { error: deleteError, data: deletedData } = await supabase
        .from("posts")
        .delete()
        .eq("id", postToDelete.id)
        .select(); // This will return the deleted rows

      console.log("Delete operation result:", { deleteError, deletedData }); // Debug log

      if (deleteError) {
        console.error("Delete error:", deleteError);
        throw new Error(deleteError.message);
      }

      if (!deletedData || deletedData.length === 0) {
        throw new Error("No rows were deleted. Post may not exist or you may not have permission.");
      }

      console.log("Successfully deleted post:", deletedData); // Debug log

      // Update local state to remove the deleted post
      setPosts(prev => {
        const updated = prev.filter(p => p.id !== postToDelete.id);
        console.log("Updated posts array, removed post:", postToDelete.id); // Debug log
        return updated;
      });

      toast.dismiss(deleteToast);
      toast.success(`Post "${postToDelete.title}" deleted successfully!`);
      setDeleteModal({ show: false, post: null });

    } catch (error: any) {
      console.error("Delete operation failed:", error); // Debug log
      toast.dismiss(deleteToast);
      toast.error(`Failed to delete post: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = (post: Post) => {
    router.push(`/dashboard/newsletter/${post.id}`);
  };

  // Show skeleton while loading
  if (loading) {
    return <NewsletterViewSkeleton rowCount={5} />;
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Newsletter Posts</h2>
          <Button
            className="bg-tst-purple flex items-center"
            onClick={() => router.push('/dashboard/newsletter/create')}
          >
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
                  <th className="p-4 font-bold w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-gray-200 hover:bg-tst-yellow cursor-pointer group"
                  >
                    <td
                      className="p-4 font-medium"
                      onClick={() => handleRowClick(post)}
                    >
                      {post.title}
                    </td>
                    <td
                      className="p-4"
                      onClick={() => handleRowClick(post)}
                    >
                      <div className="flex flex-wrap gap-2">
                        {(post.tags || []).map((tag, index) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 text-xs font-bold rounded-full text-black ${tagColors[index % tagColors.length]}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td
                      className="p-4"
                      onClick={() => handleRowClick(post)}
                    >
                      {format(new Date(post.created_at), "PPP")}
                    </td>
                    <td
                      className="p-4"
                      onClick={() => handleRowClick(post)}
                    >
                      <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${statusColors[post.status] || 'bg-gray-100'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 relative">
                      <div className="wrapper relative">
                        <div className="shadow"></div>
                        <Button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, post)}
                          className="button bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors relative z-10"
                          aria-label={`Delete "${post.title}"`}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No newsletter posts found.</p>
            <Button
              className="bg-tst-purple mt-4"
              onClick={() => router.push('/dashboard/newsletter/create')}
            >
              Create Your First Post
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.post && (
        <DeleteConfirmModal
          post={deleteModal.post}
          onClose={() => setDeleteModal({ show: false, post: null })}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default NewsletterView;
