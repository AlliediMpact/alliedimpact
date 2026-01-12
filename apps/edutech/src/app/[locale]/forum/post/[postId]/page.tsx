'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  CheckCircle2,
  Pin,
  Clock,
  Send,
  Edit2,
  Trash2,
  Award,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import {
  getPost,
  getReplies,
  createReply,
  votePost,
  voteReply,
  markPostAsSolved,
  acceptReply,
  deletePost,
  deleteReply,
} from '@/services/forumService';
import { useAuth } from '@/contexts/AuthContext';
import type { ForumPost, ForumReply } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailPage({
  params,
}: {
  params: { locale: string; postId: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPostAndReplies();
  }, [params.postId]);

  async function loadPostAndReplies() {
    try {
      setLoading(true);
      const [fetchedPost, fetchedReplies] = await Promise.all([
        getPost(params.postId),
        getReplies(params.postId),
      ]);

      if (!fetchedPost) {
        router.push(`/${params.locale}/forum`);
        return;
      }

      setPost(fetchedPost);
      setReplies(fetchedReplies);
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to reply');
      return;
    }

    if (replyContent.trim().length < 10) {
      setError('Reply must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await createReply(
        params.postId,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        replyContent.trim()
      );

      setReplyContent('');
      await loadPostAndReplies();
    } catch (error: any) {
      setError(error.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVotePost(voteType: 'upvote' | 'downvote') {
    if (!user || !post) return;

    try {
      await votePost(params.postId, user.uid, voteType);
      await loadPostAndReplies();
    } catch (error: any) {
      alert(error.message || 'Failed to vote');
    }
  }

  async function handleVoteReply(replyId: string, voteType: 'upvote' | 'downvote') {
    if (!user) return;

    try {
      await voteReply(replyId, user.uid, voteType);
      await loadPostAndReplies();
    } catch (error: any) {
      alert(error.message || 'Failed to vote');
    }
  }

  async function handleAcceptReply(replyId: string) {
    if (!user || !post) return;

    if (post.authorId !== user.uid) {
      alert('Only the post author can accept answers');
      return;
    }

    try {
      await acceptReply(replyId, params.postId);
      await loadPostAndReplies();
    } catch (error: any) {
      alert(error.message || 'Failed to accept reply');
    }
  }

  async function handleMarkSolved() {
    if (!user || !post) return;

    if (post.authorId !== user.uid) {
      alert('Only the post author can mark as solved');
      return;
    }

    try {
      await markPostAsSolved(params.postId, !post.isSolved);
      await loadPostAndReplies();
    } catch (error: any) {
      alert(error.message || 'Failed to update post');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
          <Link
            href={`/${params.locale}/forum`}
            className="text-primary-blue hover:underline"
          >
            Return to Forum
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.uid === post.authorId;
  const hasVoted = post.votedBy.includes(user?.uid || '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href={`/${params.locale}/forum`}
          className="inline-flex items-center text-primary-blue hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Link>

        {/* Post Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {post.isPinned && (
                  <span className="flex items-center text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </span>
                )}
                {post.isSolved && (
                  <span className="flex items-center text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Solved
                  </span>
                )}
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

              {/* Post Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center text-sm font-bold">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{post.authorName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimestamp(post.createdAt)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount} views</span>
                </div>
              </div>
            </div>

            {isAuthor && (
              <button
                onClick={handleMarkSolved}
                className={`px-4 py-2 rounded-lg transition ${
                  post.isSolved
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {post.isSolved ? 'Mark Unsolved' : 'Mark as Solved'}
              </button>
            )}
          </div>

          {/* Post Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Voting */}
          <div className="flex items-center space-x-6 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVotePost('upvote')}
                disabled={hasVoted || !user}
                className={`p-2 rounded-lg transition ${
                  hasVoted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-green-50 text-gray-600 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <span className="font-semibold text-lg">{post.upvotes - post.downvotes}</span>
              <button
                onClick={() => handleVotePost('downvote')}
                disabled={hasVoted || !user}
                className={`p-2 rounded-lg transition ${
                  hasVoted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.replyCount} replies</span>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {user ? (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Your Reply</h2>
            <form onSubmit={handleSubmitReply}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts... (minimum 10 characters)"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none mb-4"
                required
                minLength={10}
              />

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{replyContent.length} characters</p>
                <button
                  type="submit"
                  disabled={submitting || replyContent.length < 10}
                  className="bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Post Reply</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-gray-700 mb-4">You must be logged in to reply</p>
            <Link
              href={`/${params.locale}/auth/signin`}
              className="bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            replies.map((reply) => {
              const hasVotedReply = reply.votedBy.includes(user?.uid || '');
              const isReplyAuthor = user?.uid === reply.authorId;

              return (
                <div
                  key={reply.replyId}
                  className={`bg-white rounded-xl shadow-md p-6 ${
                    reply.isAccepted ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {reply.isAccepted && (
                    <div className="mb-4 flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Accepted Answer</span>
                    </div>
                  )}

                  {/* Reply Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold">
                        {reply.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{reply.authorName}</p>
                        <p className="text-sm text-gray-500">{formatTimestamp(reply.createdAt)}</p>
                      </div>
                      {reply.isEdited && (
                        <span className="text-xs text-gray-500 italic">(edited)</span>
                      )}
                    </div>

                    {isAuthor && !reply.isAccepted && (
                      <button
                        onClick={() => handleAcceptReply(reply.replyId)}
                        className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 px-3 py-1 rounded-lg hover:bg-green-50 transition"
                      >
                        <Award className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Content */}
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>

                  {/* Reply Voting */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVoteReply(reply.replyId, 'upvote')}
                      disabled={hasVotedReply || !user}
                      className={`p-1.5 rounded transition ${
                        hasVotedReply
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-green-50 text-gray-600 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{reply.upvotes - reply.downvotes}</span>
                    <button
                      onClick={() => handleVoteReply(reply.replyId, 'downvote')}
                      disabled={hasVotedReply || !user}
                      className={`p-1.5 rounded transition ${
                        hasVotedReply
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
