'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, Search, MoreVertical, Circle, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  sender: 'me' | 'other';
  content: string;
  timestamp: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
  }>;
}

interface Conversation {
  id: string;
  name: string;
  company?: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  typing?: boolean;
}

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'TechCorp Solutions',
      lastMessage: 'Thanks for your application! We\'d love to schedule an interview.',
      timestamp: '2026-01-10T14:30:00',
      unread: 2,
      online: true
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'Innovate Digital',
      lastMessage: 'Your profile looks great! Do you have experience with React?',
      timestamp: '2026-01-10T10:15:00',
      unread: 0,
      online: false,
      typing: false
    },
    {
      id: '3',
      name: 'Emma Williams',
      company: 'Creative Studios',
      lastMessage: 'We received your application and will review it shortly.',
      timestamp: '2026-01-09T16:45:00',
      unread: 0,
      online: true
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'other',
      content: 'Hi! Thanks for applying to the Senior Software Engineer position.',
      timestamp: '2026-01-10T14:20:00'
    },
    {
      id: '2',
      sender: 'me',
      content: 'Thank you for considering my application! I\'m very excited about this opportunity.',
      timestamp: '2026-01-10T14:22:00'
    },
    {
      id: '3',
      sender: 'other',
      content: 'Thanks for your application! We\'d love to schedule an interview. Are you available next week?',
      timestamp: '2026-01-10T14:30:00'
    },
    {
      id: '4',
      sender: 'me',
      content: 'Yes, I\'m available next week. I can do Monday, Wednesday, or Friday afternoon.',
      timestamp: '2026-01-10T14:32:00',
      attachments: [
        {
          id: '1',
          name: 'resume.pdf',
          size: 245000,
          type: 'application/pdf'
        }
      ]
    }
  ]);

  const getConversation = (id: string) => {
    return conversations.find(c => c.id === id);
  };

  const currentConversation = selectedConversation ? getConversation(selectedConversation) : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && attachments.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      content: messageInput,
      timestamp: new Date().toISOString(),
      attachments: attachments.map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setAttachments([]);
    setIsTyping(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.company && conv.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <div className="h-[calc(100vh-8rem)] bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl h-full">
        <div className="flex gap-6 h-full py-6">
          {/* Conversations List */}
          <div className="w-80 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                {totalUnread > 0 && (
                  <Badge variant="destructive" className="rounded-full">
                    {totalUnread}
                  </Badge>
                )}
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {conv.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {conv.online && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 text-green-500 fill-green-500 bg-white rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTimestamp(conv.timestamp)}
                        </span>
                      </div>
                      {conv.company && (
                        <p className="text-xs text-gray-600 mb-1">{conv.company}</p>
                      )}
                      <p className={`text-sm truncate ${
                        conv.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                        {conv.typing ? (
                          <span className="italic text-blue-600">typing...</span>
                        ) : (
                          conv.lastMessage
                        )}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unread > 0 && (
                      <Badge variant="destructive" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          {currentConversation ? (
            <Card className="flex-1 flex flex-col">
              {/* Chat Header */}
              <CardContent className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {currentConversation.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {currentConversation.online && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 text-green-500 fill-green-500 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{currentConversation.name}</h3>
                      {currentConversation.company && (
                        <p className="text-sm text-gray-600">{currentConversation.company}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${message.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-lg p-3`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className={`flex items-center gap-2 p-2 rounded ${
                                message.sender === 'me' ? 'bg-blue-700' : 'bg-gray-300'
                              }`}
                            >
                              {attachment.type.startsWith('image/') ? (
                                <ImageIcon className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.name}</p>
                                <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-600'}`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {currentConversation.typing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <CardContent className="p-4 border-t border-gray-200">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-gray-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="text-gray-900 truncate max-w-xs">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(idx)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* File Attachment Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  {/* Message Input */}
                  <div className="flex-1">
                    <textarea
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        setIsTyping(e.target.value.length > 0);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() && attachments.length === 0}
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
