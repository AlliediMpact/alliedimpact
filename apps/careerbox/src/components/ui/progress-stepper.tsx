"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  description?: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
  allowClickPrevious?: boolean
}

export function ProgressStepper({ 
  steps, 
  currentStep, 
  onStepClick,
  allowClickPrevious = true 
}: ProgressStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isClickable = allowClickPrevious && step.id < currentStep

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1"
            >
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  isCompleted && "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white",
                  isCurrent && "bg-white border-blue-600 text-blue-600",
                  !isCompleted && !isCurrent && "bg-white border-gray-300 text-gray-400",
                  isClickable && "cursor-pointer hover:shadow-lg"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </button>

              <div className={cn(
                "mt-2 text-center max-w-[120px]",
                isCurrent && "opacity-100",
                !isCurrent && "opacity-60"
              )}>
                <p className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-gray-900",
                  !isCurrent && "text-gray-600"
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
