/**
 * Toast Notification Helpers
 * Centralized toast messages for consistent UX
 */

import toast from 'react-hot-toast';

// Journey toasts
export const toastJourneyStarted = (journeyName: string) => {
  toast.success(`🚗 ${journeyName} started!`, {
    duration: 2000,
  });
};

export const toastJourneyCompleted = (score: number, passed: boolean) => {
  if (passed) {
    toast.success(`🎉 Journey complete! You scored ${score}%`, {
      duration: 4000,
    });
  } else {
    toast(`⭐ You scored ${score}%. Keep practicing!`, {
      icon: '💪',
      duration: 3000,
    });
  }
};

export const toastJourneyAbandoned = () => {
  toast('Journey abandoned. Your progress was not saved.', {
    icon: '⚠️',
  });
};

// Answer feedback toasts
export const toastAnswerCorrect = () => {
  const messages = ['✅ Correct!', '🎯 Well done!', '💯 Perfect!', '🌟 Great job!'];
  const random = messages[Math.floor(Math.random() * messages.length)];
  toast.success(random, {
    duration: 1500,
  });
};

export const toastAnswerIncorrect = () => {
  toast.error('❌ Incorrect. Review the explanation.', {
    duration: 2000,
  });
};

// Certificate toasts
export const toastCertificateGenerated = (stageName: string) => {
  toast.success(`🎓 Certificate earned for ${stageName}!`, {
    duration: 4000,
  });
};

export const toastCertificateDownloaded = () => {
  toast.success('📥 Certificate downloaded!');
};

// Stage/Achievement toasts
export const toastStageMastered = (stageName: string) => {
  toast.success(`🏆 ${stageName} mastered!`, {
    duration: 4000,
  });
};

export const toastStageUnlocked = (stageName: string) => {
  toast(`🔓 ${stageName} unlocked!`, {
    icon: '🎯',
    duration: 3000,
  });
};

export const toastBadgeEarned = (badgeName: string) => {
  toast.success(`🏅 Badge earned: ${badgeName}!`, {
    duration: 3000,
  });
};

export const toastStreakBonus = (days: number) => {
  toast.success(`🔥 ${days}-day streak! +${days} bonus credits!`, {
    duration: 3000,
  });
};

// Subscription toasts
export const toastSubscriptionUpdated = (tier: string) => {
  toast.success(`✅ Subscription updated to ${tier}!`);
};

export const toastSubscriptionCancelled = () => {
  toast('Subscription cancelled. Access until period ends.', {
    icon: '⚠️',
  });
};

export const toastTrialEnding = (daysLeft: number) => {
  toast(`⏰ Trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Subscribe to continue!`, {
    icon: '⚠️',
    duration: 5000,
  });
};

// School toasts
export const toastSchoolContacted = (schoolName: string) => {
  toast.success(`📧 Message sent to ${schoolName}!`);
};

export const toastSchoolApproved = () => {
  toast.success('✅ School approved!');
};

export const toastSchoolRejected = () => {
  toast('❌ School application rejected.');
};

// Credit toasts
export const toastCreditsEarned = (amount: number) => {
  toast.success(`+${amount} credits earned!`, {
    duration: 2000,
  });
};

export const toastInsufficientCredits = () => {
  toast.error('❌ Not enough credits! Complete daily tasks or purchase more.');
};

// Error toasts
export const toastError = (message: string) => {
  toast.error(message);
};

export const toastNetworkError = () => {
  toast.error('🌐 Network error. Please check your connection.');
};

export const toastOfflineMode = () => {
  toast('📱 You're offline. Some features may be limited.', {
    icon: '⚠️',
    duration: 3000,
  });
};

export const toastSyncComplete = () => {
  toast.success('✅ Data synced successfully!', {
    duration: 2000,
  });
};

export const toastSyncFailed = () => {
  toast.error('❌ Failed to sync data. Retrying...');
};

// Success toasts
export const toastProfileUpdated = () => {
  toast.success('✅ Profile updated!');
};

export const toastDataSaved = () => {
  toast.success('💾 Data saved!', {
    duration: 2000,
  });
};

// Loading toasts
export const toastLoadingStart = (message: string) => {
  return toast.loading(message);
};

export const toastLoadingSuccess = (toastId: string, message: string) => {
  toast.success(message, {
    id: toastId,
  });
};

export const toastLoadingError = (toastId: string, message: string) => {
  toast.error(message, {
    id: toastId,
  });
};

// Generic
export const toastInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

export const toastWarning = (message: string) => {
  toast(message, {
    icon: '⚠️',
    duration: 4000,
  });
};
