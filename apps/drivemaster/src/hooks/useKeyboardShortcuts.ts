import { useEffect } from 'react';

export interface KeyboardShortcutsCallbacks {
  onSelectAnswer?: (answerIndex: number) => void;
  onSubmitAnswer?: () => void;
  onPauseJourney?: () => void;
  onNextQuestion?: () => void;
  onQuitJourney?: () => void;
}

export interface KeyboardShortcutsOptions {
  enabled?: boolean;
  callbacks?: KeyboardShortcutsCallbacks;
}

/**
 * Custom hook to handle keyboard shortcuts during journey gameplay
 * 
 * Supported shortcuts:
 * - 1-4: Select answer A, B, C, D
 * - Enter: Submit selected answer
 * - Escape: Pause journey
 * - N: Next question (after answer revealed)
 * - Q: Quit journey (shows confirmation)
 * 
 * @param options - Configuration options including enabled state and callbacks
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { enabled = true, callbacks = {} } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, target } = event;

      // Don't trigger shortcuts if user is typing in an input field
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Prevent default behavior for shortcut keys
      const shortcutKeys = ['1', '2', '3', '4', 'Enter', 'Escape', 'n', 'N', 'q', 'Q'];
      if (shortcutKeys.includes(key)) {
        event.preventDefault();
      }

      switch (key) {
        case '1':
          callbacks.onSelectAnswer?.(0);
          break;
        case '2':
          callbacks.onSelectAnswer?.(1);
          break;
        case '3':
          callbacks.onSelectAnswer?.(2);
          break;
        case '4':
          callbacks.onSelectAnswer?.(3);
          break;
        case 'Enter':
          callbacks.onSubmitAnswer?.();
          break;
        case 'Escape':
          callbacks.onPauseJourney?.();
          break;
        case 'n':
        case 'N':
          callbacks.onNextQuestion?.();
          break;
        case 'q':
        case 'Q':
          callbacks.onQuitJourney?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, callbacks]);
}
