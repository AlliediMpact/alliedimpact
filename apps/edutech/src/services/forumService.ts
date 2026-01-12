/**
 * Forum Service
 * Handles all forum-related Firestore operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ForumPost, ForumReply, ForumCategory, UserReputation } from '@/types';

const POSTS_COLLECTION = 'edutech_forum_posts';
const REPLIES_COLLECTION = 'edutech_forum_replies';
const REPUTATION_COLLECTION = 'edutech_user_reputation';

// ============================================================================
// FORUM POSTS
// ============================================================================

/**
 * Create a new forum post
 */
export async function createPost(
  userId: string,
  userName: string,
  category: ForumCategory,
  title: string,
  content: string,
  tags: string[] = []
): Promise<string> {
  try {
    const postData = {
      authorId: userId,
      authorName: userName,
      category,
      title,
      content,
      tags,
      upvotes: 0,
      downvotes: 0,
      votedBy: [],
      replyCount: 0,
      viewCount: 0,
      status: 'active' as const,
      isPinned: false,
      isSolved: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);
    
    // Update user reputation
    await updateReputation(userId, { postsCreated: 1, totalPoints: 5 });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
}

/**
 * Get all forum posts with optional filtering
 */
export async function getPosts(
  category?: ForumCategory,
  sortBy: 'recent' | 'popular' | 'unanswered' = 'recent',
  limitCount: number = 20
): Promise<ForumPost[]> {
  try {
    let q = query(collection(db, POSTS_COLLECTION));

    // Filter by category
    if (category) {
      q = query(q, where('category', '==', category));
    }

    // Filter by status
    q = query(q, where('status', '==', 'active'));

    // Sort
    switch (sortBy) {
      case 'popular':
        q = query(q, orderBy('upvotes', 'desc'));
        break;
      case 'unanswered':
        q = query(q, where('replyCount', '==', 0), orderBy('createdAt', 'desc'));
        break;
      case 'recent':
      default:
        q = query(q, orderBy('isPinned', 'desc'), orderBy('createdAt', 'desc'));
        break;
    }

    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      postId: doc.id,
      ...doc.data(),
    })) as ForumPost[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string): Promise<ForumPost | null> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    // Increment view count
    await updateDoc(docRef, {
      viewCount: increment(1),
    });

    return {
      postId: docSnap.id,
      ...docSnap.data(),
    } as ForumPost;
  } catch (error) {
    console.error('Error getting post:', error);
    throw new Error('Failed to fetch post');
  }
}

/**
 * Update a post
 */
export async function updatePost(
  postId: string,
  updates: Partial<Pick<ForumPost, 'title' | 'content' | 'tags' | 'category'>>
): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error('Failed to update post');
  }
}

/**
 * Delete a post (soft delete - mark as deleted)
 */
export async function deletePost(postId: string): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      status: 'deleted',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('Failed to delete post');
  }
}

/**
 * Mark post as solved
 */
export async function markPostAsSolved(postId: string, solved: boolean): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      isSolved: solved,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking post as solved:', error);
    throw new Error('Failed to update post');
  }
}

// ============================================================================
// VOTING
// ============================================================================

/**
 * Vote on a post (upvote or downvote)
 */
export async function votePost(
  postId: string,
  userId: string,
  voteType: 'upvote' | 'downvote' | 'remove'
): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Post not found');
    }

    const post = docSnap.data() as ForumPost;
    const hasVoted = post.votedBy.includes(userId);

    if (voteType === 'remove') {
      if (hasVoted) {
        await updateDoc(docRef, {
          votedBy: arrayRemove(userId),
          // Note: Can't determine if it was upvote or downvote without storing more data
          // For simplicity, we'll just remove from votedBy
        });
      }
      return;
    }

    if (hasVoted) {
      // User already voted, can't vote again
      throw new Error('Already voted on this post');
    }

    const updates: any = {
      votedBy: arrayUnion(userId),
    };

    if (voteType === 'upvote') {
      updates.upvotes = increment(1);
      // Award reputation to post author
      await updateReputation(post.authorId, {
        upvotesReceived: 1,
        totalPoints: 2,
      });
    } else {
      updates.downvotes = increment(1);
      await updateReputation(post.authorId, {
        downvotesReceived: 1,
        totalPoints: -1,
      });
    }

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error voting on post:', error);
    throw error;
  }
}

/**
 * Vote on a reply
 */
export async function voteReply(
  replyId: string,
  userId: string,
  voteType: 'upvote' | 'downvote' | 'remove'
): Promise<void> {
  try {
    const docRef = doc(db, REPLIES_COLLECTION, replyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Reply not found');
    }

    const reply = docSnap.data() as ForumReply;
    const hasVoted = reply.votedBy.includes(userId);

    if (voteType === 'remove') {
      if (hasVoted) {
        await updateDoc(docRef, {
          votedBy: arrayRemove(userId),
        });
      }
      return;
    }

    if (hasVoted) {
      throw new Error('Already voted on this reply');
    }

    const updates: any = {
      votedBy: arrayUnion(userId),
    };

    if (voteType === 'upvote') {
      updates.upvotes = increment(1);
      await updateReputation(reply.authorId, {
        upvotesReceived: 1,
        totalPoints: 2,
      });
    } else {
      updates.downvotes = increment(1);
      await updateReputation(reply.authorId, {
        downvotesReceived: 1,
        totalPoints: -1,
      });
    }

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error voting on reply:', error);
    throw error;
  }
}

// ============================================================================
// REPLIES
// ============================================================================

/**
 * Create a reply to a post
 */
export async function createReply(
  postId: string,
  userId: string,
  userName: string,
  content: string,
  parentReplyId?: string
): Promise<string> {
  try {
    const replyData = {
      postId,
      authorId: userId,
      authorName: userName,
      content,
      parentReplyId: parentReplyId || null,
      upvotes: 0,
      downvotes: 0,
      votedBy: [],
      isAccepted: false,
      isEdited: false,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, REPLIES_COLLECTION), replyData);

    // Update post reply count
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      replyCount: increment(1),
      lastReplyAt: serverTimestamp(),
      lastReplyBy: userName,
    });

    // Update user reputation
    await updateReputation(userId, {
      repliesCreated: 1,
      totalPoints: 3,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw new Error('Failed to create reply');
  }
}

/**
 * Get all replies for a post
 */
export async function getReplies(postId: string): Promise<ForumReply[]> {
  try {
    const q = query(
      collection(db, REPLIES_COLLECTION),
      where('postId', '==', postId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      replyId: doc.id,
      ...doc.data(),
    })) as ForumReply[];
  } catch (error) {
    console.error('Error getting replies:', error);
    throw new Error('Failed to fetch replies');
  }
}

/**
 * Update a reply
 */
export async function updateReply(replyId: string, content: string): Promise<void> {
  try {
    const docRef = doc(db, REPLIES_COLLECTION, replyId);
    await updateDoc(docRef, {
      content,
      isEdited: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    throw new Error('Failed to update reply');
  }
}

/**
 * Delete a reply (soft delete)
 */
export async function deleteReply(replyId: string, postId: string): Promise<void> {
  try {
    const docRef = doc(db, REPLIES_COLLECTION, replyId);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });

    // Decrement post reply count
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      replyCount: increment(-1),
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    throw new Error('Failed to delete reply');
  }
}

/**
 * Mark reply as accepted solution
 */
export async function acceptReply(replyId: string, postId: string): Promise<void> {
  try {
    // Mark reply as accepted
    const replyRef = doc(db, REPLIES_COLLECTION, replyId);
    await updateDoc(replyRef, {
      isAccepted: true,
      updatedAt: serverTimestamp(),
    });

    // Mark post as solved
    await markPostAsSolved(postId, true);

    // Get reply author and award reputation
    const replySnap = await getDoc(replyRef);
    if (replySnap.exists()) {
      const reply = replySnap.data() as ForumReply;
      await updateReputation(reply.authorId, {
        solutionsAccepted: 1,
        totalPoints: 10,
      });
    }
  } catch (error) {
    console.error('Error accepting reply:', error);
    throw new Error('Failed to accept reply');
  }
}

// ============================================================================
// REPUTATION
// ============================================================================

/**
 * Get user reputation
 */
export async function getReputation(userId: string): Promise<UserReputation | null> {
  try {
    const docRef = doc(db, REPUTATION_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create initial reputation
      const initialReputation: Omit<UserReputation, 'userId'> = {
        totalPoints: 0,
        postsCreated: 0,
        repliesCreated: 0,
        solutionsAccepted: 0,
        upvotesReceived: 0,
        downvotesReceived: 0,
        badges: [],
      };

      await updateDoc(docRef, initialReputation);

      return {
        userId,
        ...initialReputation,
      };
    }

    return {
      userId: docSnap.id,
      ...docSnap.data(),
    } as UserReputation;
  } catch (error) {
    console.error('Error getting reputation:', error);
    return null;
  }
}

/**
 * Update user reputation
 */
export async function updateReputation(
  userId: string,
  updates: {
    postsCreated?: number;
    repliesCreated?: number;
    solutionsAccepted?: number;
    upvotesReceived?: number;
    downvotesReceived?: number;
    totalPoints?: number;
  }
): Promise<void> {
  try {
    const docRef = doc(db, REPUTATION_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create new reputation document
      const initialReputation: Omit<UserReputation, 'userId'> = {
        totalPoints: updates.totalPoints || 0,
        postsCreated: updates.postsCreated || 0,
        repliesCreated: updates.repliesCreated || 0,
        solutionsAccepted: updates.solutionsAccepted || 0,
        upvotesReceived: updates.upvotesReceived || 0,
        downvotesReceived: updates.downvotesReceived || 0,
        badges: [],
      };

      await updateDoc(docRef, initialReputation);
      return;
    }

    // Increment existing values
    const incrementUpdates: any = {};
    if (updates.postsCreated) incrementUpdates.postsCreated = increment(updates.postsCreated);
    if (updates.repliesCreated) incrementUpdates.repliesCreated = increment(updates.repliesCreated);
    if (updates.solutionsAccepted) incrementUpdates.solutionsAccepted = increment(updates.solutionsAccepted);
    if (updates.upvotesReceived) incrementUpdates.upvotesReceived = increment(updates.upvotesReceived);
    if (updates.downvotesReceived) incrementUpdates.downvotesReceived = increment(updates.downvotesReceived);
    if (updates.totalPoints) incrementUpdates.totalPoints = increment(updates.totalPoints);

    await updateDoc(docRef, incrementUpdates);

    // Check for badge eligibility
    await checkAndAwardBadges(userId);
  } catch (error) {
    console.error('Error updating reputation:', error);
    throw new Error('Failed to update reputation');
  }
}

/**
 * Check and award badges based on reputation
 */
async function checkAndAwardBadges(userId: string): Promise<void> {
  try {
    const reputation = await getReputation(userId);
    if (!reputation) return;

    const newBadges: string[] = [];

    // First Post
    if (reputation.postsCreated >= 1 && !reputation.badges.includes('first-post')) {
      newBadges.push('first-post');
    }

    // Helpful (10+ solutions accepted)
    if (reputation.solutionsAccepted >= 10 && !reputation.badges.includes('helpful')) {
      newBadges.push('helpful');
    }

    // Popular (50+ upvotes)
    if (reputation.upvotesReceived >= 50 && !reputation.badges.includes('popular')) {
      newBadges.push('popular');
    }

    // Expert (100+ points)
    if (reputation.totalPoints >= 100 && !reputation.badges.includes('expert')) {
      newBadges.push('expert');
    }

    // Active (50+ posts + replies)
    const totalContributions = reputation.postsCreated + reputation.repliesCreated;
    if (totalContributions >= 50 && !reputation.badges.includes('active')) {
      newBadges.push('active');
    }

    if (newBadges.length > 0) {
      const docRef = doc(db, REPUTATION_COLLECTION, userId);
      await updateDoc(docRef, {
        badges: arrayUnion(...newBadges),
      });
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

/**
 * Search posts by title or content
 */
export async function searchPosts(searchTerm: string, limitCount: number = 10): Promise<ForumPost[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that searches by tags
    // For production, consider using Algolia or ElasticSearch
    
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('status', '==', 'active'),
      where('tags', 'array-contains-any', [searchTerm.toLowerCase()]),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      postId: doc.id,
      ...doc.data(),
    })) as ForumPost[];
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}
