'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedButton } from './animated-button';
import { CircularProgress } from './animated-progress';
import { X, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { modalBackdrop, fadeIn, scaleIn } from '@/lib/animations';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
}

interface OnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  className?: string;
}

export function Onboarding({
  steps,
  onComplete,
  onSkip,
  showProgress = true,
  allowSkip = true,
  className,
}: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    
    if (isLastStep) {
      onComplete();
      setIsVisible(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          variants={scaleIn}
          className={cn(
            'relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden',
            className
          )}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStepData.icon && (
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600">
                    {currentStepData.icon}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentStepData.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>

              {allowSkip && (
                <motion.button
                  onClick={handleSkip}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              )}
            </div>

            {/* Progress bar */}
            {showProgress && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {currentStepData.description}
                </p>
                <div>{currentStepData.content}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <AnimatedButton
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && 'invisible')}
            >
              <ArrowLeft size={16} />
              Back
            </AnimatedButton>

            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentStep
                      ? 'bg-purple-600 w-6'
                      : completedSteps.has(index)
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )}
                  animate={{
                    scale: index === currentStep ? 1.2 : 1,
                  }}
                />
              ))}
            </div>

            <AnimatedButton onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Check size={16} />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </AnimatedButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Feature highlight tooltip
interface FeatureHighlightProps {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onNext?: () => void;
  onSkip?: () => void;
}

export function FeatureHighlight({
  target,
  title,
  description,
  position = 'bottom',
  onNext,
  onSkip,
}: FeatureHighlightProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const element = document.querySelector(target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      const rect = element.getBoundingClientRect();
      
      // Calculate position based on target and desired placement
      let top = rect.top;
      let left = rect.left;

      switch (position) {
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'top':
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          break;
      }

      setCoords({ top, left });
      
      // Highlight the element
      element.style.position = 'relative';
      element.style.zIndex = '51';
      element.style.boxShadow = '0 0 0 4px rgba(147, 51, 234, 0.5)';
      element.style.borderRadius = '8px';
    }

    return () => {
      if (element) {
        element.style.boxShadow = '';
        element.style.zIndex = '';
      }
    };
  }, [target, position]);

  if (!targetElement) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        variants={modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onSkip}
      />

      {/* Tooltip */}
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed z-50 w-80"
        style={{
          top: coords.top,
          left: coords.left,
          transform: position === 'bottom' || position === 'top' 
            ? 'translateX(-50%)' 
            : 'translateY(-50%)',
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          
          <div className="flex items-center gap-2">
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Skip tour
              </button>
            )}
            {onNext && (
              <AnimatedButton onClick={onNext} size="sm" className="ml-auto">
                Next
                <ArrowRight size={14} />
              </AnimatedButton>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Welcome modal
interface WelcomeModalProps {
  title: string;
  description: string;
  features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  onGetStarted: () => void;
  onDismiss?: () => void;
}

export function WelcomeModal({
  title,
  description,
  features,
  onGetStarted,
  onDismiss,
}: WelcomeModalProps) {
  return (
    <motion.div
      variants={modalBackdrop}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        variants={scaleIn}
        className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="relative p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          {onDismiss && (
            <motion.button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          )}
          
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="p-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="initial"
            animate="animate"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="text-center"
              >
                <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <AnimatedButton onClick={onGetStarted} size="lg">
              Get Started
              <ArrowRight size={18} />
            </AnimatedButton>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
