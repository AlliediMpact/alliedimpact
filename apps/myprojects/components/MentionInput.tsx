'use client';

import { useState, useRef, useEffect } from 'react';
import { getTeamMembersForMentions } from './TeamMembersManager';

interface MentionInputProps {
  projectId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

interface Mention {
  id: string;
  name: string;
  email: string;
}

export default function MentionInput({
  projectId,
  value,
  onChange,
  placeholder = 'Type @ to mention someone...',
  className = '',
  rows = 4,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Mention[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Mention[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadTeamMembers();
  }, [projectId]);

  const loadTeamMembers = async () => {
    const members = await getTeamMembersForMentions(projectId);
    setSuggestions(members);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPosition = e.target.selectionStart;
    
    // Check if user typed @
    if (newValue[cursorPosition - 1] === '@') {
      setMentionStart(cursorPosition - 1);
      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
      setSelectedIndex(0);
      return;
    }

    // If mention is active, filter suggestions
    if (mentionStart >= 0) {
      const searchText = newValue.substring(mentionStart + 1, cursorPosition).toLowerCase();
      
      // Close suggestions if space or newline after @
      if (searchText.includes(' ') || searchText.includes('\n')) {
        setShowSuggestions(false);
        setMentionStart(-1);
        return;
      }

      const filtered = suggestions.filter(
        member =>
          member.name.toLowerCase().includes(searchText) ||
          member.email.toLowerCase().includes(searchText)
      );
      setFilteredSuggestions(filtered);
      setSelectedIndex(0);

      if (filtered.length === 0) {
        setShowSuggestions(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        if (filteredSuggestions.length > 0) {
          e.preventDefault();
          insertMention(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setMentionStart(-1);
        break;
    }
  };

  const insertMention = (member: Mention) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const beforeMention = value.substring(0, mentionStart);
    const afterCursor = value.substring(cursorPosition);
    
    const newValue = `${beforeMention}@${member.name} ${afterCursor}`;
    onChange(newValue);

    setShowSuggestions(false);
    setMentionStart(-1);

    // Set cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = beforeMention.length + member.name.length + 2;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${className}`}
      />

      {/* Mention Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-full max-w-xs bg-background border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {filteredSuggestions.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onClick={() => insertMention(member)}
              className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
            >
              <div className="font-medium text-sm">{member.name}</div>
              <div className="text-xs text-muted-foreground">{member.email}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to extract mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9\s]+?)(?=\s|$|[.,!?])/g;
  const matches = text.matchAll(mentionRegex);
  return Array.from(matches).map(match => match[1].trim());
}

// Helper function to check if a user is mentioned
export function isUserMentioned(text: string, userName: string): boolean {
  const mentions = extractMentions(text);
  return mentions.some(mention => 
    mention.toLowerCase() === userName.toLowerCase()
  );
}
