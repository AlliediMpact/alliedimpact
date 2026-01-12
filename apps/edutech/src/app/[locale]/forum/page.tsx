'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, 
  TrendingUp, 
  HelpCircle, 
  Award, 
  Megaphone,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  MessageCircle,
  Eye,
  CheckCircle2,
  Pin,
  Clock
} from 'lucide-react';
import { getPosts } from '@/services/forumService';
import { useAuth } from '@/contexts/AuthContext';
import type { ForumPost, ForumCategory } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { id: 'general' as ForumCategory, name: 'General Discussion', icon: MessageSquare, color: 'blue' },
  { id: 'help' as ForumCategory, name: 'Help & Support', icon: HelpCircle, color: 'red' },
  { id: 'showcase' as ForumCategory, name: 'Show Your Work', icon: Award, color: 'yellow' },
  { id: 'courses' as ForumCategory, name: 'Course Discussion', icon: TrendingUp, color: 'green' },
  { id: 'announcements' as ForumCategory, name: 'Announcements', icon: Megaphone, color: 'purple' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'unanswered', label: 'Unanswered' },
];

export default function ForumPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, sortBy]);

  async function loadPosts() {
    try {
      setLoading(true);
      const fetchedPosts = await getPosts(
        selectedCategory === 'all' ? undefined : selectedCategory,
        sortBy,
        50
      );
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter((post) =>
    searchTerm
      ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true
  );

  function getCategoryColor(category: ForumCategory) {
    return CATEGORIES.find((c) => c.id === category)?.color || 'blue';
  }

  function formatTimestamp(timestamp: any) {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
              <p className="text-gray-600">Connect, learn, and grow together</p>
            </div>
            <Link
              href={`/${params.locale}/forum/new`}
              className="bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Post</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Categories
              </h2>

              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
                  selectedCategory === 'all'
                    ? 'bg-primary-blue text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">All Posts</span>
                  <span className={`text-sm ${selectedCategory === 'all' ? 'text-white' : 'text-gray-500'}`}>
                    {posts.length}
                  </span>
                </div>
              </button>

              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const categoryPosts = posts.filter((p) => p.category === category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
                      selectedCategory === category.id
                        ? `bg-${category.color}-500 text-white`
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <span className={`text-xs ${selectedCategory === category.id ? 'text-white' : 'text-gray-500'}`}>
                        {categoryPosts.length}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Sort Options */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">Sort By</h3>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition text-sm ${
                      sortBy === option.value
                        ? 'bg-gray-200 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Posts */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try a different search term' : 'Be the first to start a discussion!'}
                </p>
                <Link
                  href={`/${params.locale}/forum/new`}
                  className="inline-flex items-center space-x-2 bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create First Post</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const categoryColor = getCategoryColor(post.category);
                  const categoryInfo = CATEGORIES.find((c) => c.id === post.category);

                  return (
                    <Link
                      key={post.postId}
                      href={`/${params.locale}/forum/post/${post.postId}`}
                      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {post.isPinned && (
                              <span className="flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </span>
                            )}
                            {post.isSolved && (
                              <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Solved
                              </span>
                            )}
                            <span className={`text-xs bg-${categoryColor}-100 text-${categoryColor}-800 px-2 py-1 rounded`}>
                              {categoryInfo?.name}
                            </span>
                          </div>

                          <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-primary-blue transition">
                            {post.title}
                          </h2>

                          <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>

                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{post.upvotes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.replyCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.viewCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTimestamp(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Author */}
                        <div className="ml-6 flex-shrink-0 text-right">
                          <div className="w-12 h-12 rounded-full bg-primary-blue text-white flex items-center justify-center text-lg font-bold mb-2">
                            {post.authorName.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{post.authorName}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
