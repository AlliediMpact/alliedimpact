import React from 'react';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserType = 'learner' | 'facilitator' | 'content_admin' | 'system_admin';
export type LearningTrack = 'computer-skills' | 'coding' | 'both';
export type Language = 'en' | 'zu' | 'xh';

export interface EduTechUser {
  userId: string;
  uid?: string;
  userType: UserType;
  displayName: string;
  email: string;
  photoURL?: string;
  
  // Learning preferences (for learners)
  primaryTrack?: LearningTrack;
  learningGoals?: string[];
  languagePreference: Language;
  
  // Progress (for learners)
  totalCoursesCompleted?: number;
  totalHoursLearned?: number;
  currentStreak?: number;
  longestStreak?: number;

  // Gamification (for learners)
  totalXP?: number;
  unlockedBadges?: string[];

  // Onboarding (per user, cross-device)
  onboardingCompleted?: boolean;
  onboardingStepsCompleted?: string[];
  
  // Role-specific data
  assignedClassIds?: string[]; // for facilitators
  schoolName?: string; // for facilitators
  
  // Subscription (for learners)
  subscriptionStatus?: 'trial' | 'active' | 'expired';
  trialStartDate?: Timestamp;
  trialEndDate?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// COURSE TYPES
// ============================================================================

export type CourseTrack = 'computer-skills' | 'coding';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'ENTERPRISE' | 'premium' | 'free';

export interface CourseModule {
  moduleId: string;
  title: string;
  description: string;
  order: number;
  orderIndex?: number;
  lessons: CourseLesson[];
  durationMinutes?: number;
}

export type LessonType = 'video' | 'reading' | 'quiz' | 'coding-exercise' | 'interactive';

export interface CourseLesson {
  lessonId: string;
  courseId?: string;
  title: string;
  type?: LessonType;
  contentType?: 'video' | 'interactive' | 'reading' | 'quiz' | 'coding-exercise';
  content?: string; // URL for video, markdown for reading
  contentUrl?: string; // alternative field for video URL
  description?: string;
  durationMinutes?: number;
  estimatedMinutes?: number;
  order: number;
  moduleId?: string;
  isPreview?: boolean;
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  shortDescription: string;
  skillsYouWillLearn?: string[];
  
  // Categorization
  track: CourseTrack;
  category: string;
  level: CourseLevel;
  tags: string[];
  
  // Access control
  tier: SubscriptionTier;
  
  // Content
  modules: CourseModule[];
  
  // Instructor
  instructorId?: string;
  instructorName?: string;
  
  // Prerequisites & certificates
  prerequisites?: string[];
  certificateOffered?: boolean;
  
  // Metadata - ALL COURSES CREATED BY PLATFORM
  createdBy: 'platform'; // all courses created centrally by Content Admins
  contentAdminId?: string; // which content admin created it
  estimatedHours: number;
  thumbnailUrl: string;
  published: boolean;
  status?: 'draft' | 'published' | 'archived';
  publishedAt?: Timestamp;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ============================================================================
// ENROLLMENT TYPES
// ============================================================================

export type EnrollmentStatus = 'in-progress' | 'completed' | 'dropped';

export interface Enrollment {
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseTitle?: string;
  courseTier?: SubscriptionTier;
  enrolledAt: Timestamp;
  
  // Progress
  progress: number; // 0-100
  completedLessons: string[]; // lesson IDs
  currentModuleId: string;
  currentLessonId: string;
  
  // Status
  status: EnrollmentStatus;
  completedAt?: Timestamp;
  
  // Engagement
  lastAccessedAt: Timestamp;
  totalTimeSpent: number; // minutes
}

// ============================================================================
// CERTIFICATE TYPES
// ============================================================================

export interface Certificate {
  certificateId: string;
  userId: string;
  courseId: string;
  
  // Details
  courseName: string;
  courseTitle?: string;
  userName: string;
  learnerName?: string;
  totalHours?: number;
  instructorName?: string;
  completedAt: Timestamp;
  issuedAt: Timestamp;
  
  // Verification
  certificateNumber: string;
  verificationCode?: string;
  verificationUrl: string;
  
  // PDF
  pdfUrl: string;
}

// ============================================================================
// ASSESSMENT TYPES
// ============================================================================

export type AssessmentType = 'quiz' | 'coding-challenge' | 'project';
export type QuestionType = 'multiple-choice' | 'code' | 'essay';

export interface AssessmentQuestion {
  questionId: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  correctAnswer?: string;
  points: number;
}

export interface Assessment {
  assessmentId: string;
  courseId: string;
  moduleId?: string;
  
  // Content
  title: string;
  description: string;
  type: AssessmentType;
  questions: AssessmentQuestion[];
  
  // Requirements
  passingScore: number;
  timeLimit?: number; // minutes
  attemptsAllowed: number;
  
  createdAt: Timestamp;
}

export interface Submission {
  submissionId: string;
  userId: string;
  assessmentId: string;
  courseId: string;
  
  // Submission
  answers: Record<string, string>; // questionId -> answer
  submittedAt: Timestamp;
  attemptNumber: number;
  
  // Grading
  score: number;
  passed: boolean;
  feedback?: string;
  gradedAt?: Timestamp;
  gradedBy?: string; // userId of grader
}

// ============================================================================
// FORUM TYPES
// ============================================================================

export interface ForumPost {
  postId: string;
  courseId: string;
  moduleId?: string;
  
  // Content
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  
  // Engagement
  replyCount: number;
  upvotes: number;
  upvotedBy: string[]; // user IDs
  
  // Status
  resolved: boolean;
  pinned: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ForumReply {
  replyId: string;
  postId: string;
  
  // Content
  body: string;
  authorId: string;
  authorName: string;
  
  // Engagement
  upvotes: number;
  upvotedBy: string[];
  
  // Status
  isFacilitatorResponse: boolean;
  markedAsAnswer: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// PROGRESS & ANALYTICS TYPES
// ============================================================================

export interface LearningStats {
  userId: string;
  
  // Overall
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  
  // Time
  totalHours: number;
  averageWeeklyHours: number;
  currentStreak: number;
  longestStreak: number;
  
  // Achievements
  certificates: number;
  badges: number;
  
  // By track
  computerSkillsProgress: number; // 0-100
  codingProgress: number; // 0-100
  
  updatedAt: Timestamp;
}

// ============================================================================
// FACILITATOR & ADMIN TYPES
// ============================================================================

export interface FacilitatorProfile {
  facilitatorId: string;
  displayName: string;
  email: string;
  schoolName: string;
  assignedClassIds: string[];
  
  // Stats (read-only)
  totalClasses: number;
  totalLearners: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ContentAdminProfile {
  adminId: string;
  displayName: string;
  email: string;
  
  // Stats (read-only)
  coursesCreated: number;
  modulesCreated: number;
  lessonsCreated: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// FORUM/COMMUNITY TYPES
// ============================================================================

export type ForumCategory = 'general' | 'help' | 'showcase' | 'courses' | 'announcements';
export type PostStatus = 'active' | 'locked' | 'archived' | 'deleted';

export interface ForumPost {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: ForumCategory;
  title: string;
  content: string;
  tags: string[];
  
  // Engagement
  upvotes: number;
  downvotes: number;
  votedBy: string[]; // userIds who voted
  replyCount: number;
  viewCount: number;
  
  // Status
  status: PostStatus;
  isPinned: boolean;
  isSolved: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastReplyAt?: Timestamp;
  lastReplyBy?: string;
}

export interface ForumReply {
  replyId: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  
  // Threading
  parentReplyId?: string; // for nested replies
  
  // Engagement
  upvotes: number;
  downvotes: number;
  votedBy: string[]; // userIds who voted
  
  // Status
  isAccepted: boolean; // marked as solution by post author
  isEdited: boolean;
  isDeleted: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserReputation {
  userId: string;
  totalPoints: number;
  postsCreated: number;
  repliesCreated: number;
  solutionsAccepted: number;
  upvotesReceived?: number;
  downvotesReceived?: number;
  badges?: string[];
}

// ============================================================================
// CLASS MANAGEMENT TYPES
// ============================================================================

export interface Class {
  classId: string;
  name: string;
  schoolName: string;
  
  // Assignment
  facilitatorIds: string[];
  learnerIds: string[];
  
  // Details
  track: CourseTrack;
  grade?: string; // e.g., "Grade 10", "Grade 11-12"
  scheduleNotes?: string;
  
  // Stats
  totalLearners: number;
  activeLearnersThisWeek: number;
  averageProgress: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AttendanceRecord {
  recordId: string;
  classId: string;
  learnerId: string;
  date: Timestamp;
  present: boolean;
  notes?: string;
  markedBy: string; // facilitator userId
  createdAt: Timestamp;
}

export interface PerformanceNote {
  noteId: string;
  classId: string;
  learnerId: string;
  facilitatorId: string;
  note: string;
  category?: 'positive' | 'concern' | 'general';
  createdAt: Timestamp;
}

// ============================================================================
// SUBSCRIPTION & TRIAL TYPES
// ============================================================================

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';
export type SubscriptionType = 'monthly' | 'annual';

export interface Subscription {
  subscriptionId: string;
  userId: string;
  track: 'coding'; // only coding track has paid subscription
  
  // Status
  status: SubscriptionStatus;
  
  // Trial
  trialStartDate: Timestamp;
  trialEndDate: Timestamp;
  trialUsed: boolean;
  
  // Subscription details
  subscriptionType?: SubscriptionType; // monthly or annual
  amount?: number; // 99 for monthly, 1000 for annual
  startDate?: Timestamp;
  nextBillingDate?: Timestamp;
  
  // Payment
  paymentMethod?: string;
  lastPaymentDate?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// PLATFORM USER & EXTENDED TYPES
// ============================================================================

export type PlatformUser = EduTechUser; // alias for compatibility

// Firebase Auth User interface - used in useAuth() hook
export interface User {
  uid: string;
  userId?: string; // alias for uid
  email?: string;
  displayName?: string;
  photoURL?: string;
  userType?: UserType;
  emailVerified?: boolean;
  isAnonymous?: boolean;
}

export interface InstructorStats {
  instructorId: string;
  activeCourses: number;
  totalCourses: number;
  completionRate: number;
  totalRevenue: number;
  avgRating: number;
}

export interface CourseWithStats {
  courseId: string;
  title: string;
  enrollments: number;
  revenue: number;
  completionRate: number;
  lastUpdated: Timestamp | string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  item_name: string;
  item_description: string;
  amount: string;
  currency_code: string;
  signature?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  checkoutUrl?: string;
  transactionId?: string;
  error?: string;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export interface FooterSection {
  title: string;
  links?: Array<{ label: string; href: string }>;
  content?: React.ReactNode;
}

export interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

export interface FooterProps {
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  legalLinks?: Array<{ label: string; href: string }>;
  copyrightText?: string;
  description?: string;
  renderLink?: (link: string) => React.ReactElement;
}

export interface PageLoaderProps {
  isLoading?: boolean;
  text?: string;
  message?: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export interface FooterProps {
  appName?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  legalLinks?: Array<{ label: string; href: string }>;
  copyrightText?: string;
  description?: string;
  renderLink?: (link: string) => React.ReactElement;
}

export interface CourseFormProps {
  mode?: 'create' | 'edit';
  onSaveDraft?: (courseData: Partial<Course>) => Promise<void>;
  onPublish?: (courseData: Partial<Course>) => Promise<void>;
  loading?: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export type ErrorCode = 
  | 'AUTH_FAILED'
  | 'AUTH_REQUIRED'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_INVALID'
  | 'AUTH_EMAIL_NOT_VERIFIED'
  | 'COURSE_FETCH_FAILED'
  | 'COURSES_FETCH_FAILED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SUBSCRIPTION_REQUIRED'
  | 'VALIDATION_ERROR'

// ============================================================================
