'use client';

import BottomBackButton from '@/components/BottomBackButton';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Chat Page - Language chat room with AI corrections
 */
export default function ChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState('Spanish');
  const [chatLoading, setChatLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat/messages?room=${room}&levelGroup=${user?.level || 'beginner'}&limit=30`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [room, user?.level]);

  const connectWebSocket = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/ws-info');
      const data = await response.json();
      if (!data?.wsUrl) return;

      const socket = new WebSocket(data.wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
        socket.send(JSON.stringify({
          type: 'join_room',
          room: `${room}-${user?.level || 'beginner'}`,
        }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'chat_message') {
            setMessages((prev) => [...prev, {
              id: `${payload.userId || 'anon'}-${payload.createdAt}`,
              user: { name: payload.userName || 'Learner' },
              message: payload.message,
              createdAt: payload.createdAt,
              suggestedCorrection: null,
            }]);
          }
        } catch (error) {
          console.error('WebSocket parse error:', error);
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setWsConnected(false);
    }
  }, [room, user?.level]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch messages on mount
  useEffect(() => {
    if (user) {
      fetchMessages();
      connectWebSocket();
      const interval = setInterval(() => {
        if (!wsConnected) {
          fetchMessages();
        }
      }, 3000);
      return () => {
        clearInterval(interval);
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }
  }, [user, room, fetchMessages, connectWebSocket, wsConnected]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatLoading(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room,
          levelGroup: user?.level || 'beginner',
          message: newMessage,
        }),
      });

      if (response.ok) {
        if (socketRef.current && wsConnected) {
          socketRef.current.send(JSON.stringify({
            type: 'chat_message',
            room: `${room}-${user?.level || 'beginner'}`,
            userId: user.id,
            userName: user.name,
            message: newMessage,
          }));
        }
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">💬 Language Chat</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Room Selector */}
        <div className="mb-4 flex gap-2">
          {['Spanish', 'French', 'German'].map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                room === r
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {wsConnected ? 'Live mode: WebSocket connected' : 'Live mode: polling fallback'}
        </p>

        {/* Messages Container */}
        <div className="bg-white rounded-lg shadow-lg p-6 h-96 overflow-y-auto mb-4 border border-gray-200">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="mb-4">
                <div className="font-semibold text-gray-800">{msg.user?.name || 'Anonymous'}</div>
                <p className="text-gray-700 mb-1">{msg.message}</p>
                {msg.suggestedCorrection && (
                  <p className="text-sm text-yellow-600 italic">💡 Suggestion: {msg.suggestedCorrection}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write something in Spanish..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={chatLoading || !newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg"
          >
            Send
          </button>
        </form>

        <BottomBackButton fallbackHref="/learn" />
      </div>
    </div>
  );
}
