'use client';

import { useEffect } from 'react';

/**
 * Keyboard Shortcuts Hook
 * Implements keyboard controls for journey gameplay
 * 
 * Shortcuts:
 * - 1, 2, 3, 4: Select answer option
 * - Enter: Submit answer
 * - Escape: Pause journey
 * - N: Next question (after feedback)
 */

interface KeyboardShortcutsOptions {
  onAnswerSelect?: (index: number) => void;
  onSubmit?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onAnswerSelect,
  onSubmit,
  onPause,
  onNext,
  enabled = true,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Number keys 1-4 for answer selection
      if (onAnswerSelect && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        onAnswerSelect(index);
        return;
      }

      // Enter key for submit
      if (onSubmit && event.key === 'Enter') {
        event.preventDefault();
        onSubmit();
        return;
      }

      // Escape key for pause
      if (onPause && event.key === 'Escape') {
        event.preventDefault();
        onPause();
        return;
      }

      // N key for next question
      if (onNext && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        onNext();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onAnswerSelect, onSubmit, onPause, onNext, enabled]);
}

/**
 * Keyboard Shortcuts Legend Component
 * Shows available shortcuts to users
 */
export function KeyboardShortcutsLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">⌨️ Keyboard Shortcuts</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Select answer</span>
          <div className="flex gap-1">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">1</kbd>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">2</kbd>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">3</kbd>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">4</kbd>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Submit answer</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Enter</kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Pause journey</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Esc</kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Next question</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">N</kbd>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Keyboard Shortcuts Hook
 * For application-wide shortcuts
 */
export function useGlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) {
      // Ctrl/Cmd + K for search (common pattern)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Trigger search modal
        const searchButton = document.querySelector('[data-search-trigger]') as HTMLButtonElement;
        searchButton?.click();
        return;
      }

      // Ctrl/Cmd + / for help
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        // Trigger help modal
        const helpButton = document.querySelector('[data-help-trigger]') as HTMLButtonElement;
        helpButton?.click();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
