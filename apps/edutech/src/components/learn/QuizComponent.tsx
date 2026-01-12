'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  questionId: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizComponentProps {
  lessonId: string;
  onComplete?: () => void;
}

// Mock quiz questions
const mockQuizQuestions: QuizQuestion[] = [
  {
    questionId: '1',
    text: 'What is the "brain" of the computer that processes instructions?',
    options: ['Hard Drive', 'CPU (Central Processing Unit)', 'RAM', 'Motherboard'],
    correctAnswer: 'CPU (Central Processing Unit)',
    explanation:
      'The CPU (Central Processing Unit) is often called the "brain" of the computer because it processes all instructions and performs calculations.',
  },
  {
    questionId: '2',
    text: 'Which type of storage is temporary and loses data when the computer is turned off?',
    options: ['Hard Drive', 'SSD', 'RAM (Random Access Memory)', 'USB Drive'],
    correctAnswer: 'RAM (Random Access Memory)',
    explanation:
      'RAM is temporary storage that holds data for programs currently in use. When the computer is turned off, all data in RAM is lost.',
  },
  {
    questionId: '3',
    text: 'Which device is an INPUT device?',
    options: ['Monitor', 'Printer', 'Keyboard', 'Speakers'],
    correctAnswer: 'Keyboard',
    explanation:
      'A keyboard is an input device because it allows you to input data (text) into the computer. Monitor, printer, and speakers are output devices.',
  },
  {
    questionId: '4',
    text: 'What does SSD stand for?',
    options: [
      'Super Speed Drive',
      'Solid State Drive',
      'System Storage Device',
      'Software Storage Disk',
    ],
    correctAnswer: 'Solid State Drive',
    explanation:
      'SSD stands for Solid State Drive. It\'s a type of storage device that uses flash memory and has no moving parts, making it faster than traditional hard drives.',
  },
  {
    questionId: '5',
    text: 'What is the main function of the motherboard?',
    options: [
      'Store files permanently',
      'Display graphics',
      'Connect all computer components together',
      'Provide internet connection',
    ],
    correctAnswer: 'Connect all computer components together',
    explanation:
      'The motherboard is the main circuit board that connects all components of the computer together, allowing them to communicate with each other.',
  },
];

export default function QuizComponent({ lessonId, onComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = mockQuizQuestions[currentQuestionIndex];
  const totalQuestions = mockQuizQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.questionId]: answer,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
      calculateResults();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResults = () => {
    const correctAnswers = mockQuizQuestions.filter(
      (q) => selectedAnswers[q.questionId] === q.correctAnswer
    ).length;

    const percentage = (correctAnswers / totalQuestions) * 100;

    // Pass if score >= 70%
    if (percentage >= 70) {
      setQuizCompleted(true);
      onComplete?.();
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
  };

  const getResults = () => {
    const correctAnswers = mockQuizQuestions.filter(
      (q) => selectedAnswers[q.questionId] === q.correctAnswer
    ).length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    const passed = percentage >= 70;

    return { correctAnswers, totalQuestions, percentage, passed };
  };

  // Results View
  if (showResults) {
    const { correctAnswers, totalQuestions, percentage, passed } = getResults();

    return (
      <div className="bg-background border rounded-xl p-8">
        <div className="text-center mb-8">
          {passed ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-700 mb-2">Congratulations!</h2>
              <p className="text-lg text-muted-foreground">You passed the quiz!</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                <XCircle className="h-10 w-10 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-orange-700 mb-2">Keep Learning!</h2>
              <p className="text-lg text-muted-foreground">
                You need 70% to pass. Try again!
              </p>
            </>
          )}
        </div>

        <div className="bg-muted/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-blue">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Correct Answers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-blue">{percentage.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground mt-1">Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-blue">
                {passed ? 'Pass' : 'Retry'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Result</div>
            </div>
          </div>
        </div>

        {/* Review Answers */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-bold">Review Your Answers</h3>
          {mockQuizQuestions.map((question, index) => {
            const userAnswer = selectedAnswers[question.questionId];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div key={question.questionId} className="border rounded-xl p-6">
                <div className="flex items-start space-x-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">
                      Question {index + 1}: {question.text}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Your answer:</span>{' '}
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer || 'Not answered'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm">
                          <span className="font-medium">Correct answer:</span>{' '}
                          <span className="text-green-600">{question.correctAnswer}</span>
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-muted-foreground mt-2">
                          💡 {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleRetry}
            className="flex items-center space-x-2 px-6 py-3 border rounded-lg hover:bg-muted"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Retry Quiz</span>
          </button>
          {passed && (
            <button
              onClick={onComplete}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
            >
              <span>Continue</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="bg-background border rounded-xl p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-blue transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6">{currentQuestion.text}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.questionId] === option;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full text-left p-4 border-2 rounded-xl transition-colors ${
                  isSelected
                    ? 'border-primary-blue bg-primary-blue/5'
                    : 'border-muted hover:border-primary-blue/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary-blue bg-primary-blue'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={isSelected ? 'font-semibold' : ''}>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQuestion.questionId]}
          className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
