'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRelativeTime, getInitials } from '@/lib/utils';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: { name: string; url: string; type: string }[];
}

export default function IndividualMessagesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string || 'en';
  const recipientId = searchParams?.get('recipientId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // TODO: Fetch conversations from Firestore
    const fetchConversations = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));

        // Mock conversations
        const mockConversations: Conversation[] = [
          {
            id: 'conv-1',
            participantId: 'company-123',
            participantName: 'TechCorp Solutions',
            participantRole: 'Senior Software Engineer',
            lastMessage: 'Thank you for your interest! When can you start?',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 15),
            unreadCount: 2,
            isOnline: true,
          },
          {
            id: 'conv-2',
            participantId: 'company-456',
            participantName: 'Digital Innovations Ltd',
            participantRole: 'Full Stack Developer',
            lastMessage: "We'd like to schedule an interview with you",
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
            unreadCount: 0,
            isOnline: false,
          },
          {
            id: 'conv-3',
            participantId: 'company-789',
            participantName: 'StartupCo',
            participantRole: 'React Developer',
            lastMessage: 'Great! Looking forward to hearing from you',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
            unreadCount: 0,
            isOnline: false,
          },
        ];

        setConversations(mockConversations);

        // Auto-select conversation if recipientId provided
        if (recipientId) {
          const conv = mockConversations.find(c => c.participantId === recipientId);
          if (conv) {
            setSelectedConversation(conv.id);
          }
        } else if (mockConversations.length > 0) {
          setSelectedConversation(mockConversations[0].id);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [recipientId]);

  useEffect(() => {
    if (!selectedConversation) return;

    // TODO: Fetch messages for selected conversation from Firestore
    const fetchMessages = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 400));

        // Mock messages
        const mockMessages: Message[] = [
          {
            id: 'msg-1',
            senderId: 'company-123',
            content: 'Hi! We came across your profile and think you would be a great fit for our Senior Software Engineer position.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            status: 'read',
          },
          {
            id: 'msg-2',
            senderId: 'current-user',
            content: 'Thank you for reaching out! I\'m definitely interested. Could you tell me more about the role and the team?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'read',
          },
          {
            id: 'msg-3',
            senderId: 'company-123',
            content: 'Of course! Our team consists of 8 engineers working on a cloud-based SaaS platform. You would be leading the frontend team and working closely with product managers.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            status: 'read',
          },
          {
            id: 'msg-4',
            senderId: 'current-user',
            content: 'That sounds exciting! What technologies are you using on the frontend?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: 'read',
          },
          {
            id: 'msg-5',
            senderId: 'company-123',
            content: 'We primarily use React with TypeScript, Next.js for SSR, and Tailwind for styling. We also use GraphQL for our API layer.',
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            status: 'delivered',
          },
          {
            id: 'msg-6',
            senderId: 'company-123',
            content: 'Thank you for your interest! When can you start?',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: 'delivered',
          },
        ];

        setMessages(mockMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // TODO: Set up real-time listener for new messages
    // const unsubscribe = onSnapshot(messagesQuery, (snapshot) => { ... });
    // return () => unsubscribe();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    setIsSending(true);

    try {
      // Create optimistic message
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: 'current-user',
        content: messageInput,
        timestamp: new Date(),
        status: 'sending',
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');

      // TODO: Send message to Firestore
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update message status
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, id: `msg-${Date.now()}`, status: 'sent' } : msg
        )
      );

      setIsSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participantRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Messages
        </h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start messaging companies from your matches
                </p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(conv.participantName)}
                        </div>
                        {conv.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conv.participantName}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatRelativeTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 truncate">{conv.participantRole}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700 truncate flex-1">{conv.lastMessage}</p>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2 flex-shrink-0">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation && currentConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(currentConversation.participantName)}
                  </div>
                  {currentConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{currentConversation.participantName}</h2>
                  <p className="text-sm text-gray-600">
                    {currentConversation.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.senderId === 'current-user';
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-lg ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{formatRelativeTime(message.timestamp)}</span>
                        {isCurrentUser && (
                          <>
                            {message.status === 'sending' && <Clock className="h-3 w-3" />}
                            {message.status === 'sent' && <Check className="h-3 w-3" />}
                            {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                            {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-600" />}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="border-t px-6 py-4">
              <div className="flex items-end gap-3">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h2>
              <p className="text-gray-600">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
