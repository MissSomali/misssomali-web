"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string;
  author: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "",
    isPublished: false,
  });

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle Title input change to auto-fill Slug
  const handleTitleChange = (title: string) => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({
      ...prev,
      title,
      // Only auto-generate slug if the user hasn't modified it manually or it's empty
      slug: prev.slug === "" || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        ? generatedSlug
        : prev.slug,
    }));
  };

  // Open Dialog for Create
  const handleOpenCreate = () => {
    setSelectedBlog(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      author: "",
      isPublished: false,
    });
    setDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content,
      coverImage: blog.coverImage,
      author: blog.author,
      isPublished: blog.status === "published",
    });
    setDialogOpen(true);
  };

  // Handle Save
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        author: formData.author,
        status: formData.isPublished ? "published" : "draft",
      };

      const method = selectedBlog ? "PUT" : "POST";
      const body = selectedBlog ? { id: selectedBlog.id, ...payload } : payload;

      const res = await fetch("/api/admin/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setDialogOpen(false);
        await fetchBlogs();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save blog post");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the blog post.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle publish status directly
  const handleTogglePublish = async (blog: Blog) => {
    try {
      const nextStatus = blog.status === "published" ? "draft" : "published";
      const res = await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blog.id, status: nextStatus }),
      });
      if (res.ok) {
        await fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs?id=${blogToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
        await fetchBlogs();
      } else {
        alert("Failed to delete blog post.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Blogs & News
          </h1>
          <p className="mt-1 text-sm text-dark-6">
            Write, edit, and publish news articles and blog updates for Miss Somali.
          </p>
        </div>
        <div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Write Article
          </Button>
        </div>
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        {blogs.length === 0 ? (
          <div className="py-20 text-center text-dark-6">
            <p>No blog articles created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-6 py-4 text-left font-medium text-dark-6">Article</th>
                  <th className="px-6 py-4 text-left font-medium text-dark-6">Slug</th>
                  <th className="px-6 py-4 text-left font-medium text-dark-6">Author</th>
                  <th className="px-6 py-4 text-left font-medium text-dark-6">Status</th>
                  <th className="px-6 py-4 text-left font-medium text-dark-6">Published Date</th>
                  <th className="px-6 py-4 text-right font-medium text-dark-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                  >
                    <td className="px-6 py-4 font-medium text-dark dark:text-white">
                      <div>
                        <p className="font-semibold">{blog.title}</p>
                        <p className="text-xs text-dark-6 line-clamp-1 max-w-[250px]">{blog.excerpt || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-6 font-mono text-xs">
                      <span className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3 text-dark-6" />
                        {blog.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-6">
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-dark-6" />
                        {blog.author}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(blog)}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                      >
                        {blog.status === "published" ? (
                          <Badge variant="default" className="bg-emerald-600 text-white">
                            <CheckCircle className="mr-1 h-3.5 w-3.5" /> Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3.5 w-3.5 text-dark-6" /> Draft
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-dark-6">
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-dark-6"
                          onClick={() => handleOpenEdit(blog)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setBlogToDelete(blog);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBlog ? "Edit Article" : "Write Article"}</DialogTitle>
            <DialogDescription>
              Write details for the public Miss Somali blog post.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBlog} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="blogTitle">Title</Label>
                <Input
                  id="blogTitle"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Official Launch Event Announced"
                  required
                />
              </div>

              <div>
                <Label htmlFor="blogSlug">Slug (URL Path)</Label>
                <Input
                  id="blogSlug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. official-launch-event"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="blogAuthor">Author</Label>
                <Input
                  id="blogAuthor"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Miss Somali Team"
                  required
                />
              </div>

              <div>
                <Label htmlFor="blogCover">Cover Image URL</Label>
                <Input
                  id="blogCover"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="blogExcerpt">Excerpt / Short Teaser</Label>
              <Textarea
                id="blogExcerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A brief teaser paragraph to display on listings..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="blogContent">Content Body</Label>
              <Textarea
                id="blogContent"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the main article content here..."
                rows={8}
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="blogPublish"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: !!checked })}
              />
              <Label htmlFor="blogPublish" className="cursor-pointer">
                Publish Article Immediately
              </Label>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedBlog ? "Save Changes" : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the blog post <strong>{blogToDelete?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBlog} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
