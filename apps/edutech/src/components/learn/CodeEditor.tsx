'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  lessonId: string;
  onComplete?: () => void;
}

// Mock coding challenge
const mockChallenge = {
  title: 'Write a Function to Add Two Numbers',
  description:
    'Create a function called `add` that takes two parameters (a and b) and returns their sum.',
  instructions: [
    'Define a function named `add`',
    'The function should accept two parameters: `a` and `b`',
    'Return the sum of `a` and `b`',
  ],
  starterCode: `function add(a, b) {
  // Write your code here
  
}

// Test your function
console.log(add(5, 3)); // Should output: 8
console.log(add(10, 20)); // Should output: 30`,
  solution: `function add(a, b) {
  return a + b;
}`,
  testCases: [
    { input: [2, 3], expected: 5 },
    { input: [10, 15], expected: 25 },
    { input: [-5, 5], expected: 0 },
    { input: [100, 200], expected: 300 },
  ],
};

export default function CodeEditor({ lessonId, onComplete }: CodeEditorProps) {
  const [code, setCode] = useState(mockChallenge.starterCode);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<
    { passed: boolean; input: number[]; expected: number; actual: number }[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const handleRun = () => {
    try {
      // Create a safe execution context
      const results: {
        passed: boolean;
        input: number[];
        expected: number;
        actual: number;
      }[] = [];

      // Execute the code
      // eslint-disable-next-line no-new-func
      const userFunction = new Function(`
        ${code}
        return add;
      `)();

      // Run test cases
      let allPassed = true;
      mockChallenge.testCases.forEach((testCase) => {
        const actual = userFunction(...testCase.input);
        const passed = actual === testCase.expected;
        if (!passed) allPassed = false;

        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expected,
          actual,
        });
      });

      setTestResults(results);
      setShowResults(true);
      setAllTestsPassed(allPassed);

      if (allPassed) {
        setOutput('✅ All tests passed! Great job!');
        onComplete?.();
      } else {
        setOutput('❌ Some tests failed. Review your code and try again.');
      }
    } catch (error: any) {
      setOutput(`❌ Error: ${error.message}`);
      setShowResults(false);
    }
  };

  const handleReset = () => {
    setCode(mockChallenge.starterCode);
    setOutput('');
    setTestResults([]);
    setShowResults(false);
    setAllTestsPassed(false);
  };

  const handleShowSolution = () => {
    setCode(mockChallenge.solution);
  };

  return (
    <div className="space-y-6">
      {/* Challenge Description */}
      <div className="bg-background border rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">{mockChallenge.title}</h3>
        <p className="text-muted-foreground mb-4">{mockChallenge.description}</p>

        <div className="bg-primary-blue/5 border border-primary-blue/20 rounded-lg p-4">
          <p className="font-semibold mb-2">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {mockChallenge.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-background border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
          <span className="text-sm font-medium">editor.js</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1 text-sm hover:bg-background rounded transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleShowSolution}
              className="px-3 py-1 text-sm text-primary-blue hover:bg-background rounded transition-colors"
            >
              Show Solution
            </button>
            <button
              onClick={handleRun}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Run Tests</span>
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm bg-background border-0 focus:outline-none resize-none"
          spellCheck={false}
        />
      </div>

      {/* Test Results */}
      {showResults && (
        <div className="bg-background border rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            {allTestsPassed ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h4 className="text-lg font-bold text-green-700">All Tests Passed!</h4>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <h4 className="text-lg font-bold text-red-700">Some Tests Failed</h4>
              </>
            )}
          </div>

          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-mono text-sm">
                      add({result.input.join(', ')})
                    </span>
                  </div>
                  <div className="text-sm">
                    {result.passed ? (
                      <span className="text-green-700">✓ {result.expected}</span>
                    ) : (
                      <span className="text-red-700">
                        Expected: {result.expected}, Got: {result.actual}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output Console */}
      {output && (
        <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-sm">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-400">Console Output:</span>
          </div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}

      {/* Hint */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>💡 Hint:</strong> You can test your code multiple times. Make sure all test
          cases pass before moving to the next lesson!
        </p>
      </div>
    </div>
  );
}
