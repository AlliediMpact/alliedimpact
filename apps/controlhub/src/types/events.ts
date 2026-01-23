/**
 * Event Types - Defines all events that apps can emit to ControlHub
 */

export type AppId = 'coinbox' | 'sportshub' | 'drivemaster' | 'edutech' | 'portal' | 'myprojects';
export type Environment = 'production' | 'staging' | 'development';
export type AppStatus = 'healthy' | 'degraded' | 'offline';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Health Event - App health status ping (every 60s)
 */
export interface HealthEvent {
  appId: AppId;
  status: AppStatus;
  environment: Environment;
  timestamp: string; // ISO 8601
  metrics?: {
    errorRate?: number; // 0-1 (e.g., 0.02 = 2%)
    responseTime?: number; // milliseconds
    activeUsers?: number;
    requestsPerMinute?: number;
  };
  version?: string; // App version
}

/**
 * Auth Event - Login/logout activity
 */
export interface AuthEvent {
  appId: AppId;
  event: 'login_success' | 'login_failure' | 'logout' | 'mfa_required' | 'mfa_success' | 'mfa_failure';
  userId?: string; // Only for success events
  timestamp: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string; // City, Country
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    anomalyDetected?: boolean; // App-detected anomaly
    failureReason?: string; // For failures
  };
}

/**
 * Audit Event - Admin actions and critical operations
 */
export interface AuditEvent {
  appId: AppId;
  action: string; // e.g., "user_verification_approved", "subscription_cancelled"
  actor: string; // Admin email or user ID
  actorRole?: string; // Admin role
  target?: string; // Affected user/entity ID
  targetType?: 'user' | 'transaction' | 'subscription' | 'content' | 'system';
  timestamp: string;
  metadata?: Record<string, any>; // Additional context
  ipAddress?: string;
}

/**
 * Alert - Security or system alert
 */
export interface Alert {
  appId: AppId;
  severity: AlertSeverity;
  title: string;
  description: string;
  category: 'security' | 'system' | 'compliance' | 'performance';
  timestamp: string;
  metadata?: Record<string, any>;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string[];
}

/**
 * Support Metrics - High-level support statistics
 */
export interface SupportMetrics {
  appId: AppId;
  timestamp: string;
  metrics: {
    openTickets: number;
    closedTickets: number;
    averageResponseTime?: number; // hours
    slaCompliance?: number; // 0-1 (e.g., 0.95 = 95%)
    ticketsByCategory?: Record<string, number>;
    ticketsBySeverity?: Record<string, number>;
  };
}

/**
 * API Request - Standard request format for all ControlHub APIs
 */
export interface ApiRequest<T> {
  data: T;
  appId: AppId;
  timestamp: string;
  signature?: string; // Optional HMAC signature for extra security
}

/**
 * API Response - Standard response format
 */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * User Metadata - Minimal user info in ControlHub
 */
export interface UserMetadata {
  userId: string;
  email?: string; // For admin searches only
  lastSeen: string;
  verificationLevel?: 'low' | 'medium' | 'high';
  appsAccessed: AppId[];
  flagged?: boolean; // Security flag
  flagReason?: string;
}

/**
 * App Configuration - Registered apps in ControlHub
 */
export interface AppConfig {
  appId: AppId;
  name: string;
  description: string;
  url: string;
  healthCheckEndpoint?: string;
  environment: Environment;
  enabled: boolean;
  lastHealthCheck?: string;
  currentStatus?: AppStatus;
}

/**
 * ControlHub User Roles
 */
export type ControlHubRole = 
  | 'controlhub_super_admin'
  | 'controlhub_security'
  | 'controlhub_support'
  | 'controlhub_auditor';

/**
 * ControlHub User
 */
export interface ControlHubUser {
  uid: string;
  email: string;
  displayName?: string;
  role: ControlHubRole;
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}
