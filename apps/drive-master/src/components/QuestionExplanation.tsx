'use client';

import { useState } from 'react';
import { HelpCircle, X, Lightbulb } from 'lucide-react';
import { Button } from '@allied-impact/ui';

/**
 * QuestionExplanationModal Component
 * 
 * Shows detailed explanation for a previously answered question
 * Displays:
 * - Question text
 * - User's answer (correct/incorrect)
 * - Correct answer
 * - Detailed explanation
 * - Related tips
 */

interface QuestionData {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  explanation: string;
  tips?: string[];
  category?: string;
}

interface QuestionExplanationModalProps {
  question: QuestionData;
  onClose: () => void;
}

export function QuestionExplanationModal({ question, onClose }: QuestionExplanationModalProps) {
  const isCorrect = question.userAnswer === question.correctAnswer;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div
            className={`sticky top-0 px-6 py-4 flex items-center justify-between border-b ${
              isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className={`w-6 h-6 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
              <h2 className="text-lg font-bold text-gray-900">Question Explanation</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Question */}
            <div>
              <div className="text-sm font-semibold text-gray-600 uppercase mb-2">Question</div>
              <p className="text-lg text-gray-900">{question.questionText}</p>
              {question.category && (
                <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {question.category}
                </span>
              )}
            </div>

            {/* Options */}
            <div>
              <div className="text-sm font-semibold text-gray-600 uppercase mb-3">Answer Options</div>
              <div className="space-y-2">
                {question.options.map((option, index) => {
                  const isUserAnswer = index === question.userAnswer;
                  const isCorrectAnswer = index === question.correctAnswer;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : isUserAnswer && !isCorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCorrectAnswer
                              ? 'bg-green-500 text-white'
                              : isUserAnswer && !isCorrect
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">{option}</p>
                          {isCorrectAnswer && (
                            <span className="inline-block mt-1 text-xs font-semibold text-green-700">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="inline-block mt-1 text-xs font-semibold text-red-700">
                              ✗ Your Answer (Incorrect)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Result Badge */}
            <div
              className={`p-4 rounded-lg border-2 ${
                isCorrect
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                >
                  {isCorrect ? '✓' : '✗'}
                </div>
                <div>
                  <div className={`font-bold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                    {isCorrect ? 'You answered correctly!' : 'You answered incorrectly'}
                  </div>
                  <div className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect
                      ? 'Great job! You have a good understanding of this concept.'
                      : 'Review the explanation below to understand the correct answer.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <div className="text-sm font-semibold text-gray-900 uppercase">Explanation</div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-gray-800 leading-relaxed">{question.explanation}</p>
              </div>
            </div>

            {/* Tips */}
            {question.tips && question.tips.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-600 uppercase mb-3">
                  💡 Pro Tips
                </div>
                <div className="space-y-2">
                  {question.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <Button onClick={onClose} variant="secondary" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ViewExplanationButton Component
 * 
 * Button to trigger the explanation modal
 */
interface ViewExplanationButtonProps {
  question: QuestionData;
  variant?: 'default' | 'compact';
}

export function ViewExplanationButton({ question, variant = 'default' }: ViewExplanationButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Explain
        </button>
        {showModal && <QuestionExplanationModal question={question} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
        className="inline-flex items-center gap-2"
      >
        <HelpCircle className="w-4 h-4" />
        View Explanation
      </Button>
      {showModal && <QuestionExplanationModal question={question} onClose={() => setShowModal(false)} />}
    </>
  );
}
