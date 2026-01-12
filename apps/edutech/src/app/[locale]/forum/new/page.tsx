'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Tag, AlertCircle } from 'lucide-react';
import { createPost } from '@/services/forumService';
import { useAuth } from '@/contexts/AuthContext';
import type { ForumCategory } from '@/types';

const CATEGORIES = [
  { id: 'general', name: 'General Discussion' },
  { id: 'help', name: 'Help & Support' },
  { id: 'showcase', name: 'Show Your Work' },
  { id: 'courses', name: 'Course Discussion' },
  { id: 'announcements', name: 'Announcements' },
];

export default function NewPostPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ForumCategory>('general');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters');
      return;
    }

    if (content.trim().length < 20) {
      setError('Content must be at least 20 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const postId = await createPost(
        user.uid,
        user.displayName || user.email || 'Anonymous',
        category,
        title.trim(),
        content.trim(),
        tags
      );

      // Redirect to the new post
      router.push(`/${params.locale}/forum/post/${postId}`);
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post. Please try again.');
      setSubmitting(false);
    }
  }

  function handleAddTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be logged in to create a post</p>
          <Link
            href={`/${params.locale}/auth/signin`}
            className="bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${params.locale}/forum`}
            className="inline-flex items-center text-primary-blue hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600 mt-2">Share your thoughts, ask questions, or showcase your work</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ForumCategory)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your post about? (minimum 10 characters)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
              minLength={10}
              maxLength={200}
            />
            <p className="mt-2 text-sm text-gray-500">
              {title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide details, context, or ask your question (minimum 20 characters)"
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
              required
              minLength={20}
            />
            <p className="mt-2 text-sm text-gray-500">
              {content.length} characters
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (optional)
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags (press Enter)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  maxLength={20}
                  disabled={tags.length >= 5}
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={tags.length >= 5}
              >
                Add
              </button>
            </div>

            {/* Tag List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary-blue/10 text-primary-blue px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-blue hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {tags.length}/5 tags added
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Link
              href={`/${params.locale}/forum`}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || title.length < 10 || content.length < 20}
              className="bg-primary-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Create Post</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Tips for a great post:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Be clear and specific in your title</li>
            <li>• Provide context and details in the content</li>
            <li>• Use tags to help others find your post</li>
            <li>• Be respectful and follow community guidelines</li>
            <li>• Search for similar posts before creating a new one</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
