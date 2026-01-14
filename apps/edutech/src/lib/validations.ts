/**
 * Validation Schemas
 * 
 * Zod schemas for form validation across the EduTech platform.
 * Provides type-safe validation with user-friendly error messages.
 */

import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const signupSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string(),
  
  userType: z.enum(['learner', 'facilitator', 'content_admin', 'system_admin']),
  
  primaryTrack: z.enum(['computer-skills', 'coding', 'both']).optional(),
  
  languagePreference: z.enum(['en', 'zu', 'xh']).default('en'),
  
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  password: z.string().min(1, 'Password is required'),
  
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============================================================================
// COURSE SCHEMAS
// ============================================================================

export const courseLessonSchema = z.object({
  title: z
    .string()
    .min(5, 'Lesson title must be at least 5 characters')
    .max(100, 'Lesson title must be less than 100 characters'),
  
  type: z.enum(['video', 'reading', 'quiz', 'coding-exercise']),
  
  content: z.string().min(1, 'Lesson content is required'),
  
  durationMinutes: z
    .number()
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration cannot exceed 3 hours'),
  
  order: z.number().min(1, 'Order must be at least 1'),
});

export const courseModuleSchema = z.object({
  title: z
    .string()
    .min(5, 'Module title must be at least 5 characters')
    .max(100, 'Module title must be less than 100 characters'),
  
  description: z
    .string()
    .min(20, 'Module description must be at least 20 characters')
    .max(500, 'Module description must be less than 500 characters'),
  
  order: z.number().min(1, 'Order must be at least 1'),
  
  lessons: z.array(courseLessonSchema).min(1, 'Module must have at least one lesson'),
});

export const courseSchema = z.object({
  title: z
    .string()
    .min(5, 'Course title must be at least 5 characters')
    .max(100, 'Course title must be less than 100 characters'),
  
  description: z
    .string()
    .min(50, 'Course description must be at least 50 characters')
    .max(2000, 'Course description must be less than 2000 characters'),
  
  shortDescription: z
    .string()
    .min(20, 'Short description must be at least 20 characters')
    .max(200, 'Short description must be less than 200 characters'),
  
  track: z.enum(['computer-skills', 'coding'], {
    errorMap: () => ({ message: 'Please select a valid track' }),
  }),
  
  category: z
    .string()
    .min(2, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Please select a difficulty level' }),
  }),
  
  tier: z.enum(['FREE', 'PREMIUM', 'ENTERPRISE'], {
    errorMap: () => ({ message: 'Please select an access tier' }),
  }),
  
  tags: z
    .array(z.string())
    .min(1, 'Add at least one tag')
    .max(10, 'Maximum 10 tags allowed'),
  
  estimatedHours: z
    .number()
    .min(0.5, 'Estimated hours must be at least 0.5')
    .max(500, 'Estimated hours cannot exceed 500'),
  
  thumbnailUrl: z
    .string()
    .url('Please provide a valid thumbnail URL')
    .optional()
    .or(z.literal('')),
  
  modules: z
    .array(courseModuleSchema)
    .min(1, 'Course must have at least one module'),
});

// ============================================================================
// CLASS SCHEMAS
// ============================================================================

export const classSchema = z.object({
  name: z
    .string()
    .min(5, 'Class name must be at least 5 characters')
    .max(100, 'Class name must be less than 100 characters'),
  
  schoolName: z
    .string()
    .min(3, 'School name must be at least 3 characters')
    .max(100, 'School name must be less than 100 characters'),
  
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters'),
  
  track: z.enum(['computer-skills', 'coding', 'both']),
  
  maxLearners: z
    .number()
    .min(5, 'Class must allow at least 5 learners')
    .max(100, 'Class cannot exceed 100 learners'),
  
  facilitatorIds: z
    .array(z.string())
    .min(1, 'Assign at least one facilitator'),
  
  schedule: z
    .string()
    .min(10, 'Please provide class schedule details')
    .max(500, 'Schedule description too long'),
  
  startDate: z.date({
    errorMap: () => ({ message: 'Please select a valid start date' }),
  }),
  
  endDate: z.date({
    errorMap: () => ({ message: 'Please select a valid end date' }),
  }),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ============================================================================
// FORUM SCHEMAS
// ============================================================================

export const forumPostSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  content: z
    .string()
    .min(20, 'Post content must be at least 20 characters')
    .max(10000, 'Post content must be less than 10,000 characters'),
  
  category: z.enum([
    'general',
    'technical-help',
    'course-discussion',
    'career-advice',
    'showcase',
  ]),
  
  tags: z
    .array(z.string())
    .max(5, 'Maximum 5 tags allowed')
    .optional(),
  
  courseId: z.string().optional(),
});

export const forumReplySchema = z.object({
  content: z
    .string()
    .min(10, 'Reply must be at least 10 characters')
    .max(5000, 'Reply must be less than 5,000 characters'),
});

// ============================================================================
// ATTENDANCE SCHEMA
// ============================================================================

export const attendanceSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  
  learnerId: z.string().min(1, 'Learner ID is required'),
  
  date: z.date({
    errorMap: () => ({ message: 'Please select a valid date' }),
  }),
  
  status: z.enum(['present', 'absent', 'late', 'excused']),
  
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// ============================================================================
// PERFORMANCE NOTE SCHEMA
// ============================================================================

export const performanceNoteSchema = z.object({
  learnerId: z.string().min(1, 'Learner ID is required'),
  
  classId: z.string().min(1, 'Class ID is required'),
  
  note: z
    .string()
    .min(20, 'Note must be at least 20 characters')
    .max(1000, 'Note must be less than 1,000 characters'),
  
  category: z.enum([
    'progress',
    'behavior',
    'technical',
    'engagement',
    'other',
  ]),
});

// ============================================================================
// PROFILE UPDATE SCHEMA
// ============================================================================

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  
  languagePreference: z.enum(['en', 'zu', 'xh']).optional(),
  
  learningGoals: z.array(z.string()).max(10, 'Maximum 10 goals allowed').optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type ForumPostInput = z.infer<typeof forumPostSchema>;
export type ForumReplyInput = z.infer<typeof forumReplySchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type PerformanceNoteInput = z.infer<typeof performanceNoteSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
