// AI Quantum Tutor - Your personal Richard Feynman
import { useState, useRef, useEffect } from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { apiClient } from '../../api/client';
import ReactMarkdown from 'react-markdown';
import './AITutor.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'Explain my circuit', prompt: 'What does my current circuit do?' },
  { label: 'Create Bell state', prompt: 'How do I create a Bell state? Show me the gates.' },
  { label: "What's superposition?", prompt: 'Explain quantum superposition simply.' },
  { label: 'Debug help', prompt: "My circuit isn't working as expected. Can you help?" },
];

export function AITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_tutorAvailable, setTutorAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { circuit } = useCircuitStore();

  // Check tutor availability on mount
  useEffect(() => {
    apiClient.get('/api/tutor/status')
      .then(res => setTutorAvailable(res.data.available))
      .catch(() => setTutorAvailable(false));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/tutor/chat', {
        message: messageText,
        circuit: {
          numQubits: circuit.numQubits,
          gates: circuit.gates,
          circuitName: circuit.name,
        },
        history: messages.slice(-10),
        mode: 'chat',
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`tutor-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Quantum Tutor"
      >
        {isOpen ? '✕' : '🧠'}
      </button>

      {/* Chat panel */}
      <div className={`tutor-panel ${isOpen ? 'open' : ''}`}>
        <div className="tutor-header">
          <div className="tutor-title">
            <span className="tutor-icon">🧠</span>
            <div>
              <h3>Quantum Tutor</h3>
              <span className="tutor-subtitle">Powered by Claude</span>
            </div>
          </div>
          <div className="tutor-actions">
            <button onClick={clearChat} title="Clear chat" className="tutor-action-btn">
              🗑️
            </button>
            <button onClick={() => setIsOpen(false)} className="tutor-action-btn">
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="tutor-messages">
          {messages.length === 0 && (
            <div className="tutor-welcome">
              <div className="welcome-icon">🔮</div>
              <h4>Welcome to QUANTA AI Tutor!</h4>
              <p>I can help you understand quantum computing, explain your circuits, and guide your learning.</p>

              <div className="quick-actions">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    className="quick-action"
                    onClick={() => sendMessage(action.prompt)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`tutor-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🧠'}
              </div>
              <div className="message-content">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="tutor-message assistant">
              <div className="message-avatar">🧠</div>
              <div className="message-content loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="tutor-input" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about quantum computing..."
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-btn"
            >
              ↑
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </>
  );
}
