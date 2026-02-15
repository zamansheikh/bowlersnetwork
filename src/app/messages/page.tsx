'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Send, Search, MoreHorizontal, CheckCircle, Clock, Paperclip, X, Image, Video, Plus } from 'lucide-react';
import { api } from '@/lib/api';

interface Conversation {
  room_id: number;
  name: string; // This is the room name/ID
  display_name: string; // This is what we'll show to user
  display_image_url: string;
  type: 'private' | 'group';
  last_activity: string;
  last_message: {
    sentByMe: boolean;
    roomID: number;
    sender: {
      user_id: number;
      username: string;
      name: string;
      first_name: string;
      last_name: string;
      email: string;
      profile_picture_url: string;
    };
    timeDetails: {
      sent_at: string;
      timesince: string;
    };
    message: {
      text: string;
      media: string[];
    };
  } | null;
  unreadCount: number; // We'll calculate this locally for now
}

interface Message {
  sentByMe: boolean;
  roomID: number;
  sender: {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
  };
  timeDetails: {
    sent_at: string;
    timesince: string;
  };
  message: {
    text: string;
    media: string[]; // Array of media URLs
  };
}

interface AvailableMember {
  user_id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture_url: string;
}


export default function MessagesPage() {
  const searchParams = useSearchParams();
  const targetRoomId = searchParams.get('room_id');

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'private' | 'group'>('all');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // New message modal state
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch available members for new message
  const fetchAvailableMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await api.get('/api/profile/all');
      setAvailableMembers(response.data);
    } catch (error) {
      console.error('Error fetching available members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat rooms from API
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/chat/rooms');

      // Combine private and group conversations
      const privateRooms: Conversation[] = response.data.private.map((room: { id: number; name: string; avatar?: string; lastMessage?: string; lastMessageTime?: string }) => ({
        ...room,
        type: 'private' as const,
        unreadCount: 0 // We'll implement this later
      }));

      const groupRooms: Conversation[] = response.data.group.map((room: { id: number; name: string; avatar?: string; lastMessage?: string; lastMessageTime?: string }) => ({
        ...room,
        type: 'group' as const,
        unreadCount: 0 // We'll implement this later
      }));

      const allConversations = [...privateRooms, ...groupRooms];
      setConversations(allConversations);

      // Check if we need to select a specific conversation based on room_id query parameter
      if (targetRoomId) {
        const targetConversation = allConversations.find(conv => conv.room_id.toString() === targetRoomId);
        if (targetConversation) {
          setSelectedConversation(targetConversation);
          await fetchMessages(targetConversation.room_id);
          return; // Exit early, don't auto-select first conversation
        }
      }

      // Auto-select first conversation if available and no specific target
      if (allConversations.length > 0) {
        setSelectedConversation(allConversations[0]);
        await fetchMessages(allConversations[0].room_id);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific room
  const fetchMessages = async (roomId: number, shouldScroll: boolean = true) => {
    try {
      setMessagesLoading(true);
      const response = await api.get(`/api/chat/room/${roomId}/messages`);
      setMessages(response.data);

      // Scroll to bottom after messages are loaded
      if (shouldScroll) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch new messages periodically (for polling)
  const fetchNewMessages = async () => {
    if (!selectedConversation) return;

    try {
      const response = await api.get(`/api/chat/room/${selectedConversation.room_id}/messages`);
      const newMessages = response.data;

      // Only update if there are new messages
      if (newMessages.length > messages.length) {
        setMessages(newMessages);
        // Scroll to bottom when new messages arrive
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  };

  // Start polling for new messages
  const startPolling = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval
    intervalRef.current = setInterval(fetchNewMessages, 5000); // Poll every 5 seconds
  };

  // Stop polling for new messages
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [targetRoomId]); // Re-fetch when targetRoomId changes

  // Handle polling when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup on unmount or conversation change
    return () => stopPolling();
  }, [selectedConversation, messages.length]);

  // Handle page visibility change to start/stop polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (selectedConversation) {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [selectedConversation]);

  // Create new conversation with a user
  const handleCreateNewConversation = async (member: AvailableMember) => {
    try {
      const response = await api.post('/api/chat/rooms', {
        other_username: member.username
      });

      if (response.data && response.data.room_id) {
        // Close modal
        setIsNewMessageModalOpen(false);
        setMemberSearchQuery('');

        // Refresh chat rooms to include the new conversation
        await fetchChatRooms();

        // Find and select the new conversation
        const newConversation = conversations.find(conv => conv.room_id === response.data.room_id);
        if (newConversation) {
          setSelectedConversation(newConversation);
          await fetchMessages(newConversation.room_id);
        }
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
      alert('Failed to create conversation. Please try again.');
    }
  };

  // Handle opening new message modal
  const handleOpenNewMessageModal = () => {
    setIsNewMessageModalOpen(true);
    fetchAvailableMembers();
  };

  // Filter available members for search
  const filteredAvailableMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  // Filter conversations
  const filteredConversations = conversations.filter((conversation) => {
    const lastMessageText = conversation.last_message?.message?.text || '';

    const matchesSearch =
      conversation.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessageText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'private' && conversation.type === 'private') ||
      (filterType === 'group' && conversation.type === 'group');

    return matchesSearch && matchesFilter;
  });

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.room_id);

    // Mark conversation as read
    setConversations(prev =>
      prev.map(conv =>
        conv.room_id === conversation.room_id
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Send message with media
  const handleSendReply = async () => {
    if ((!replyText.trim() && selectedFiles.length === 0) || !selectedConversation) return;

    try {
      setSendingMessage(true);

      // Create FormData for the API call
      const formData = new FormData();
      formData.append('text', replyText);

      // Add files to FormData
      selectedFiles.forEach((file, index) => {
        formData.append('media', file);
      });

      // Track upload progress for each file
      const progressTrackers: { [key: string]: number } = {};
      selectedFiles.forEach((file, index) => {
        progressTrackers[file.name] = 0;
      });
      setUploadProgress(progressTrackers);

      // Send message to API
      const response = await api.post(
        `/api/chat/room/${selectedConversation.room_id}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              // Update progress for all files (simplified)
              const updatedProgress: { [key: string]: number } = {};
              selectedFiles.forEach(file => {
                updatedProgress[file.name] = percentCompleted;
              });
              setUploadProgress(updatedProgress);
            }
          },
        }
      );

      // Add the new message to the messages list
      const newMessage: Message = response.data;
      setMessages(prev => [...prev, newMessage]);

      // Update the conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.room_id === selectedConversation.room_id
            ? {
              ...conv,
              last_message: {
                sentByMe: newMessage.sentByMe,
                roomID: newMessage.roomID,
                sender: newMessage.sender,
                timeDetails: newMessage.timeDetails,
                message: {
                  text: newMessage.message.text,
                  media: newMessage.message.media || []
                }
              }
            }
            : conv
        )
      );

      // Clear form
      setReplyText('');
      setSelectedFiles([]);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 100);

      // Keep text box focused after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Helper function to format time
  const formatMessageTime = (timeString: string) => {
    try {
      // For now, we'll use the timesince field for display
      return timeString;
    } catch {
      return 'Now';
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="h-screen md:h-auto md:container md:mx-auto md:px-4 md:py-8">
        <div className="bg-white md:rounded-lg md:shadow-lg overflow-hidden h-full md:h-[calc(100vh-120px)]">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col h-full ${selectedConversation ? 'hidden md:flex' : 'flex'
              }`}>
              <div className="p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MessageCircle className="w-4 md:w-5 h-4 md:h-5" style={{ color: '#8BC342' }} />
                    Messages
                  </h1>
                  <div className="flex items-center gap-3">
                    {/* <div className="text-sm text-gray-500">
                      {conversations.reduce((total, conv) => total + conv.unreadCount, 0)} unread
                    </div> */}
                    <button
                      onClick={handleOpenNewMessageModal}
                      className="p-2 text-white rounded-lg transition-colors hover:opacity-90 flex items-center gap-1"
                      style={{ backgroundColor: '#8BC342' }}
                      title="Create New Message"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="relative mb-2 md:mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex gap-2">
                  {(['all', 'private', 'group'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterType(filter)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filterType === filter ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      style={filterType === filter ? { backgroundColor: '#8BC342' } : {}}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.room_id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.room_id === conversation.room_id ? 'bg-green-50 border-r-2' : ''
                        }`}
                      style={selectedConversation?.room_id === conversation.room_id ? { borderRightColor: '#8BC342' } : {}}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <img
                          src={conversation.display_image_url}
                          className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                          alt="avatar"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
                              <h3 className="font-medium text-sm md:text-base text-gray-800 truncate">{conversation.display_name}</h3>
                              {conversation.type === 'group' && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                                  Group
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {conversation.unreadCount > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#8BC342' }}>
                                  {conversation.unreadCount}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {conversation.last_activity || 'Now'}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 truncate overflow-hidden whitespace-nowrap">
                            {conversation.last_message ? (
                              <>
                                {conversation.last_message.sentByMe && "You: "}
                                {conversation.last_message.message?.text
                                  ? conversation.last_message.message.text.length > 35
                                    ? conversation.last_message.message.text.slice(0, 35) + '…'
                                    : conversation.last_message.message.text
                                  : 'No messages yet'}
                              </>
                            ) : (
                              'No messages yet'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Viewer */}
            <div className={`w-full md:flex-1 flex flex-col h-full ${selectedConversation ? 'flex' : 'hidden md:flex'
              }`}>
              {selectedConversation ? (
                <>
                  <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        {/* Back button for mobile */}
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="md:hidden p-1 text-gray-600 hover:text-gray-800 flex-shrink-0"
                          aria-label="Back to conversations"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <img src={selectedConversation.display_image_url} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex-shrink-0" alt="avatar" />
                        <div className="min-w-0 flex-1">
                          <h2 className="font-semibold text-sm md:text-base text-gray-800 truncate">{selectedConversation.display_name}</h2>
                          <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {selectedConversation.type === 'group' ?
                                'Group conversation' :
                                'Private conversation'
                              }
                            </span>
                            <span className="sm:hidden">
                              {selectedConversation.type === 'group' ? 'Group' : 'Private'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button className="p-1 md:p-2 text-gray-400 hover:text-gray-600 rounded-lg flex-shrink-0">
                        <MoreHorizontal className="w-4 md:w-5 h-4 md:h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-3 md:p-4 overflow-y-auto">
                    {messagesLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading messages...</p>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">No messages yet</p>
                          <p className="text-gray-400 text-sm">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 md:space-y-6">
                        {messages.map((message, index) => (
                          <div key={index} className={`flex ${message.sentByMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 md:gap-3 ${message.sentByMe ? 'flex-row-reverse' : ''}`}>
                              <img src={message.sender.profile_picture_url} className="w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0" alt="avatar" />
                              <div className="max-w-[75%] md:max-w-xs">
                                {/* Show username for group messages */}
                                {selectedConversation?.type === 'group' && (
                                  <p className="text-xs text-gray-500 mb-1 truncate">
                                    {message.sentByMe ? 'You' : message.sender.name}
                                  </p>
                                )}
                                <div className={`p-2 md:p-3 rounded-lg ${message.sentByMe ? 'bg-green-500 text-white' : 'bg-gray-100'
                                  }`}>
                                  <p className="text-xs md:text-sm break-words">{message.message.text}</p>
                                  {/* MEDIA PREVIEW */}
                                  {message.message.media && message.message.media.length > 0 && (
                                    <div className="mt-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        {message.message.media.slice(0, 4).map((mediaUrl: string, idx: number) => {
                                          // Determine if it's a video based on URL extension
                                          const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(mediaUrl);

                                          return (
                                            <div key={idx} className="relative">
                                              {isVideo ? (
                                                <video controls className="w-full h-24 object-cover rounded-md">
                                                  <source src={mediaUrl} type="video/mp4" />
                                                </video>
                                              ) : (
                                                <img
                                                  src={mediaUrl}
                                                  className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                                  alt="media"
                                                  onClick={() => window.open(mediaUrl, '_blank')}
                                                />
                                              )}
                                              {idx === 3 && message.message.media.length > 4 && (
                                                <div className="absolute inset-0 bg-black bg-opacity-60 text-white flex items-center justify-center text-lg font-bold rounded-md">
                                                  +{message.message.media.length - 3}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  {message.timeDetails.timesince}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="p-2 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    {/* File Preview Section */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                          </span>
                          <button
                            onClick={() => {
                              setSelectedFiles([]);
                              setUploadProgress({});
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative bg-white p-2 rounded border">
                              <div className="flex items-center gap-2">
                                {file.type.startsWith('image/') ? (
                                  <Image className="w-4 h-4 text-blue-500" />
                                ) : file.type.startsWith('video/') ? (
                                  <Video className="w-4 h-4 text-purple-500" />
                                ) : (
                                  <Paperclip className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="text-xs text-gray-600 truncate flex-1">
                                  {file.name}
                                </span>
                                <button
                                  onClick={() => removeSelectedFile(index)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              {/* Upload Progress */}
                              {uploadProgress[file.name] > 0 && uploadProgress[file.name] < 100 && (
                                <div className="mt-1">
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div
                                      className="h-1 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${uploadProgress[file.name]}%`,
                                        backgroundColor: '#8BC342'
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">{uploadProgress[file.name]}%</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="flex gap-2 md:gap-3 items-end">
                      <div className="flex-1">
                        <div className="flex items-end gap-1 md:gap-2">
                          {/* File Upload Button */}
                          <div className="relative">
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={sendingMessage}
                              className="p-1.5 md:p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Paperclip className="w-4 md:w-5 h-4 md:h-5" />
                            </button>
                          </div>

                          {/* Text Input */}
                          <textarea
                            ref={textareaRef}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Type a message to ${selectedConversation.display_name}...`}
                            className="flex-1 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                            rows={1}
                            disabled={sendingMessage}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply();
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Send Button */}
                      <button
                        onClick={handleSendReply}
                        disabled={(!replyText.trim() && selectedFiles.length === 0) || sendingMessage}
                        className="px-2 md:px-3 py-2 md:py-3 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm flex-shrink-0 flex items-center gap-2"
                        style={{
                          backgroundColor: ((!replyText.trim() && selectedFiles.length === 0) || sendingMessage) ? '' : '#8BC342'
                        }}
                      >
                        {sendingMessage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-xs hidden md:inline">Sending...</span>
                          </>
                        ) : (
                          <Send className="w-5 h-5 md:w-6 md:h-6" />
                        )}
                      </button>
                    </div>

                    {/* Sending Progress Indicator */}
                    {sendingMessage && (
                      <div className="mt-2 text-center">
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                          {selectedFiles.length > 0 ?
                            `Uploading ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}...` :
                            'Sending message...'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[70vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">New Message</h2>
              <button
                onClick={() => {
                  setIsNewMessageModalOpen(false);
                  setMemberSearchQuery('');
                }}
                className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : filteredAvailableMembers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredAvailableMembers.map((member) => (
                    <div
                      key={member.user_id}
                      onClick={() => handleCreateNewConversation(member)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <img
                        src={member.profile_picture_url}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">@{member.username}</p>
                      </div>
                      <div className="text-gray-400">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
