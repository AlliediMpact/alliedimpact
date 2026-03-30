'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// This wrapper provides a 4-step themed wizard for signup

const steps = [
  'Account details',
  'Security & password',
  'Membership tier',
  'Review & pay',
];

export default function SignUpWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="space-y-4">
      {/* Stepper header */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs sm:text-sm text-slate-200/80 font-medium">
          {steps.map((label, index) => {
            const active = index === currentStep;
            const completed = index < currentStep;
            return (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                      completed
                        ? 'bg-emerald-400 text-slate-900 border-emerald-300'
                        : active
                        ? 'bg-blue-500 text-white border-blue-300'
                        : 'bg-slate-900/40 text-slate-300 border-slate-500/60'
                    }`}
                  >
                    {completed ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className={active ? 'text-white' : 'text-slate-300/80'}>{label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block h-0.5 w-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-300/80">
          Step {currentStep + 1} of {steps.length}. You can review everything before paying your security deposit.
        </p>
      </div>

      {/* Content: Placeholder for signup form steps */}
      <div className="mt-2 space-y-4">
        {currentStep === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <Input type="text" placeholder="First name" />
            <Input type="text" placeholder="Last name" />
            <Input type="email" placeholder="Email address" />
          </motion.div>
        )}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <Input type="password" placeholder="Create password" />
            <Input type="password" placeholder="Confirm password" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              <span>Enable two-factor authentication</span>
            </label>
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-sm text-slate-300">Select your membership tier</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border border-slate-600 rounded cursor-pointer">
                <input type="radio" name="tier" defaultChecked /> Standard
              </label>
              <label className="flex items-center gap-2 p-3 border border-blue-600 rounded cursor-pointer bg-blue-950/30">
                <input type="radio" name="tier" /> Premium
              </label>
            </div>
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-sm text-slate-300">Review your information and complete signup</p>
            <Button className="w-full">Complete Signup</Button>
          </motion.div>
        )}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="flex-1"
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
