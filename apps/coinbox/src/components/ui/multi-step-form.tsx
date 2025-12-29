'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { StepProgress } from './animated-progress';
import { AnimatedButton } from './animated-button';
import { Check, Save } from 'lucide-react';
import { slideInLeft, slideInRight } from '@/lib/animations';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: (data: any) => void | Promise<void>;
  onStepChange?: (currentStep: number) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  initialData?: any;
  className?: string;
}

export function MultiStepForm({
  steps,
  onComplete,
  onStepChange,
  autoSave = false,
  autoSaveInterval = 3000,
  initialData = {},
  className,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isValidating, setIsValidating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Auto-save functionality
  const saveFormData = useCallback(async () => {
    if (!autoSave) return;
    setIsSaving(true);
    
    try {
      // Save to localStorage or API
      localStorage.setItem('form-autosave', JSON.stringify({
        data: formData,
        step: currentStep,
        timestamp: new Date().toISOString(),
      }));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, currentStep, autoSave]);

  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      saveFormData();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, saveFormData]);

  // Load saved data on mount
  useEffect(() => {
    if (!autoSave) return;

    try {
      const saved = localStorage.getItem('form-autosave');
      if (saved) {
        const { data, step } = JSON.parse(saved);
        setFormData(data);
        setCurrentStep(step);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, [autoSave]);

  const handleNext = async () => {
    if (currentStepData.validate) {
      setIsValidating(true);
      const isValid = await currentStepData.validate();
      setIsValidating(false);
      
      if (!isValid) return;
    }

    if (isLastStep) {
      await onComplete(formData);
      // Clear auto-save after completion
      if (autoSave) {
        localStorage.removeItem('form-autosave');
      }
    } else {
      setDirection('forward');
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setDirection('backward');
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    }
  };

  const getAnimationVariant = () => {
    return direction === 'forward' ? slideInRight : slideInLeft;
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Progress indicator */}
      <div className="mb-8">
        <StepProgress
          steps={steps.map((step) => step.title)}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Auto-save indicator */}
      {autoSave && (
        <motion.div
          className="flex items-center justify-end gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isSaving ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Save size={14} />
              </motion.div>
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check size={14} className="text-green-600" />
              <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
            </>
          ) : null}
        </motion.div>
      )}

      {/* Form content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={getAnimationVariant()}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Step header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentStepData.title}
                </h2>
                {currentStepData.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentStepData.description}
                  </p>
                )}
              </div>

              {/* Step content */}
              <div>{currentStepData.component}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <AnimatedButton
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className={cn(isFirstStep && 'invisible')}
          >
            Back
          </AnimatedButton>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>

          <AnimatedButton
            onClick={handleNext}
            loading={isValidating}
            disabled={isValidating}
          >
            {isLastStep ? 'Complete' : 'Next'}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

// Form section with animated collapse
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={cn(
          'w-full px-6 py-4 text-left bg-gray-50 dark:bg-gray-900/50 transition-colors',
          collapsible && 'hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
