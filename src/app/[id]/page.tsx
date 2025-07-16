'use client';
import { useState, useRef, useEffect } from 'react';


import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './chat.module.css';
import { BaseAgent } from '@/core/agents/agent';
import { agents } from '@/config/app-config';


interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}


export default function ChatPage() {
  const params = useParams();

  useEffect(() => {
    const agentId = params.id?.toString().replace("%20", " ");
    const agent = agents[agentId as keyof typeof agents] || agents['Real Estate Agent'];
    setAgent(agent)

    setMessages([
      {
        id: '1',
        content: `Hello! I'm ${agent.getDescription()} How can I help you today?`,
        sender: 'agent',
        timestamp: new Date()
      }
    ])

  }, []);


  const [agent, setAgent] = useState<BaseAgent | null>(null);


  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [updateStatus, setUpdateStatus] = useState<string[]>([]);


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setIsTyping(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setInputValue('');

    setMessages(prev => [...prev, userMessage]);


    const res = await agent?.generateResponse(inputValue, (o: string) => {
      if (o) {
        setUpdateStatus(prev => [...prev, o]);
        // setUpdateStatus(o)
      }
    })

    if (res && res.content && typeof res.content === 'string') {

      const newMessage: Message = {
        id: Date.now().toString(),
        content: res.content,
        sender: 'agent',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, newMessage]);
      setInputValue('');

    }

    setUpdateStatus([]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <Link href="/" className={styles.backButton}>
          ← Back to Agents
        </Link>
        <div className={styles.agentInfo}>
          <span className={styles.agentAvatar}>🤖</span>
          <span className={styles.agentName}>{agent?.getName()}</span>
        </div>
        <div></div>
      </header>

      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageWrapper} ${styles[message.sender]}`}
            >
              <div className={styles.message}>
                {message.sender === 'agent' && (
                  <div className={styles.messageAvatar}>🤖</div>
                )}
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.content}</div>
                  <div className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.agent}`}>
              <div className={styles.message}>
                <div className={styles.messageAvatar}>🤖</div>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <div className={styles.textGray} >
                      {updateStatus.map((s) => (
                        <p key={s}>{s}</p>
                      ))}
                    </div>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={styles.messageInput}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={styles.sendButton}
          >
            Send
          </button>
        </div>
      </div>
    </div >
  );
}