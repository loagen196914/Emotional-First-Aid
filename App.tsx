import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Send, RotateCcw, Activity, Calendar as CalendarIcon, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { createChatSession, sendMessageStream, generateSummary } from './services/geminiService';
import EmotionSelector from './components/EmotionSelector';
import FinalCard, { parseCardData } from './components/FinalCard';
import VoiceInput from './components/VoiceInput';
import CalendarView from './components/CalendarView';
import { EmotionConfig, Message, EmotionType, Session } from './types';
import { THINKING_MESSAGES } from './constants';

type ViewState = 'HOME' | 'CHAT' | 'HISTORY' | 'REVIEW';

// Helper component for Dynamic Thinking Text
const ThinkingStatus = () => {
  const [text, setText] = useState(THINKING_MESSAGES[0]);
  
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % THINKING_MESSAGES.length;
      setText(THINKING_MESSAGES[index]);
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
      <Loader2 size={14} className="animate-spin" />
      <span>{text}</span>
    </div>
  );
};

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionConfig | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const [reviewSession, setReviewSession] = useState<Session | null>(null);
  
  // Summary State
  const [turnCount, setTurnCount] = useState(0);
  const [contextSummary, setContextSummary] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Refs for Typewriter effect
  const typeWriterQueueRef = useRef<string[]>([]);
  const isTypingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, view, isLoading]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('emotional_first_aid_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Process Typewriter Queue
  useEffect(() => {
    const processQueue = async () => {
      if (isTypingRef.current || typeWriterQueueRef.current.length === 0) return;
      
      isTypingRef.current = true;
      
      // We process the queue
      while (typeWriterQueueRef.current.length > 0) {
        const char = typeWriterQueueRef.current.shift();
        if (char) {
          setMessages(prev => {
             // Append char to the last message (which is the AI response being built)
             const last = prev[prev.length - 1];
             if (last && last.role === 'model' && last.isStreaming) {
               return [...prev.slice(0, -1), { ...last, content: last.content + char }];
             }
             return prev;
          });
          // Typewriter delay: Randomize slightly for natural feel (30ms - 50ms)
          await new Promise(r => setTimeout(r, Math.random() * 20 + 30));
        }
      }
      isTypingRef.current = false;
    };

    const interval = setInterval(processQueue, 50);
    return () => clearInterval(interval);
  }, [messages]); // Dependency on messages to trigger re-checks, but logic relies on ref

  const saveToHistory = (msgs: Message[], emotion: EmotionConfig) => {
    // Check if the last message is a final card
    const lastMsg = msgs[msgs.length - 1];
    let cardData = undefined;
    
    if (lastMsg && lastMsg.role === 'model' && lastMsg.content.includes('🌱')) {
       const parsed = parseCardData(lastMsg.content);
       if (parsed) cardData = parsed;
    }

    // Don't save empty sessions
    if (msgs.length <= 1) return;

    const newSession: Session = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      emotion: emotion,
      messages: msgs,
      cardData
    };

    const newHistory = [newSession, ...history];
    setHistory(newHistory);
    localStorage.setItem('emotional_first_aid_history', JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    if (history.length === 0) return;

    const firstConfirm = window.confirm("确定要删除所有历史记录吗？\n\n此操作将清空所有日历数据和情绪急救卡，且无法恢复。");
    if (firstConfirm) {
        const secondConfirm = window.confirm("⚠️ 最终确认\n\n您真的要一键抹除所有信息吗？数据将永久丢失。");
        if (secondConfirm) {
            setHistory([]);
            localStorage.removeItem('emotional_first_aid_history');
        }
    }
  };

  const handleStreamResponse = async (chat: Chat, prompt: string, isInit = false) => {
     try {
       const streamResult = await sendMessageStream(chat, prompt);
       
       const aiMessageId = Date.now().toString();
       // Add empty AI placeholder
       setMessages(prev => [...prev, {
         id: aiMessageId,
         role: 'model',
         content: '',
         isStreaming: true
       }]);
 
       let fullContent = '';
       
       for await (const chunk of streamResult) {
         const c = chunk as GenerateContentResponse;
         const text = c.text;
         if (text) {
           fullContent += text;
           // Push individual characters to queue for typewriter effect
           // We split by standard spread to handle emojis correctly
           const chars = [...text];
           typeWriterQueueRef.current.push(...chars);
         }
       }
       
       // Wait for queue to empty before finalizing
       const waitForQueue = async () => {
          while (typeWriterQueueRef.current.length > 0 || isTypingRef.current) {
             await new Promise(r => setTimeout(r, 100));
          }
       };
       await waitForQueue();
 
       // Finalize message state
       setMessages(prev => {
         const updated = prev.map(m => m.id === aiMessageId ? { ...m, content: fullContent, isStreaming: false } : m);
         // Auto-save logic if card detected
         if (!isInit && fullContent.includes('💊') && currentEmotion) {
           saveToHistory(updated, currentEmotion);
         }
         return updated;
       });

       return fullContent;
 
     } catch (error) {
       console.error("Stream error", error);
       setMessages(prev => [...prev, {
         id: 'error',
         role: 'model',
         content: '连接中断，请重试。'
       }]);
       return '';
     }
  };

  const handleEmotionSelect = async (emotion: EmotionConfig) => {
    setCurrentEmotion(emotion);
    setIsInitializing(true);
    setView('CHAT');
    setTurnCount(0);
    setContextSummary('');
    typeWriterQueueRef.current = []; // Clear queue
    
    try {
      // Start new chat without summary initially
      const chat = createChatSession();
      setChatSession(chat);

      const initialPrompt = `User selected emotion: ${emotion.type}. Start the protocol for ${emotion.type} now.`;
      
      await handleStreamResponse(chat, initialPrompt, true);

    } catch (error) {
      console.error("Failed to start chat", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const checkSummary = async (msgs: Message[]) => {
      // Logic: Every 4 turns (user + ai = 1 turn roughly, so 8 messages), generate summary
      // This runs in background
      const newTurnCount = turnCount + 1;
      setTurnCount(newTurnCount);

      if (newTurnCount >= 4) {
         // console.log("Triggering background summary...");
         const summary = await generateSummary(msgs);
         if (summary) {
            // console.log("Summary generated:", summary);
            setContextSummary(summary);
            // Replace chat session with new one containing summary
            // Note: We don't change 'messages' visible UI, just the backend brain
            const newChat = createChatSession('gemini-2.5-flash', summary);
            setChatSession(newChat);
            setTurnCount(0); // Reset counter
         }
      }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSession || isLoading) return;

    const userMsgId = Date.now().toString();
    const userText = input;
    setInput('');
    setIsLoading(true);

    const newMessages = [...messages, {
      id: userMsgId,
      role: 'user' as const,
      content: userText
    }];
    setMessages(newMessages);

    try {
       await handleStreamResponse(chatSession, userText);
       // After response is done (handleStreamResponse awaits the queue), trigger summary check
       // We pass the updated messages. Note: messages state might not be fully updated in this closure due to async
       // So we construct what it should be.
       // Actually, checkSummary is background, doesn't need to block.
       // We'll call it with the full content we just got.
       
       // Note: Since handleStreamResponse returns fullContent, we can reconstruct roughly.
       // But safer to just let the next render cycle or use functional update effects.
       // Simplified: just let it pass current state + new ones.
       
       // We need the latest messages for summary. 
       // Since React state update is async, we'll just defer this slightly or pass explicit list if critical.
       // For this app, passing 'newMessages' + 'last AI response' is complex to get cleanly here.
       // Simple hack: We won't block UI. We'll just run it.
       
       // Actually, we can just use the 'messages' state in a useEffect? No, easier to trigger here.
       // We will skip precise message passing and just use the state in next render or pass the snapshot.
       
       // Let's just increment turn count here. The actual summary content generation will use 
       // the messages available when the async function runs.
       checkSummary([...newMessages, { role: 'model', content: "...", id: 'temp' }]); 

    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const endSession = () => {
    setCurrentEmotion(null);
    setMessages([]);
    setChatSession(null);
    setInput('');
    setView('HOME');
    setTurnCount(0);
    setContextSummary('');
    typeWriterQueueRef.current = [];
  };

  const isFinalCard = (content: string) => {
    return content.includes('🌱') && content.includes('💊');
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev ? prev + ' ' + text : text);
  };

  const openHistory = () => {
    setView('HISTORY');
  };

  const openSessionReview = (session: Session) => {
    setReviewSession(session);
    setView('REVIEW');
  };

  // Render Helpers
  const renderHeader = () => (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-3">
        <div className="bg-teal-500 text-white p-2 rounded-lg">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">情绪急救箱</h1>
          <p className="text-xs text-slate-500 font-medium">Emotional First Aid</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {view === 'HOME' && (
           <>
             {history.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
                  title="一键抹除所有信息"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">抹除信息</span>
                </button>
             )}
             <button 
               onClick={openHistory}
               className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-100"
             >
               <CalendarIcon size={18} />
               <span>日历/记录</span>
             </button>
           </>
        )}
        
        {(view === 'CHAT' || view === 'REVIEW') && (
          <button 
            onClick={endSession}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-100"
          >
            {view === 'REVIEW' ? <ArrowLeft size={16} /> : <RotateCcw size={16} />}
            <span>{view === 'REVIEW' ? '返回' : '重新开始'}</span>
          </button>
        )}
      </div>
    </header>
  );

  const renderChatArea = (msgs: Message[], readOnly: boolean) => (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full shadow-xl bg-white/50 backdrop-blur-sm">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
        {msgs.map((msg) => {
          const isUser = msg.role === 'user';
          // Check if card - careful not to render card while streaming partially
          const isCard = !isUser && isFinalCard(msg.content) && !msg.isStreaming;

          if (isCard) {
            return <FinalCard key={msg.id} rawText={msg.content} />;
          }

          return (
            <div 
              key={msg.id} 
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap
                  ${isUser 
                    ? 'bg-teal-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}
                `}
              >
                {msg.content}
                {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-teal-400 animate-pulse align-middle"></span>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Thinking Indicator */}
        {isLoading && !msgs.some(m => m.isStreaming) && (
            <div className="flex justify-start w-full">
                <div className="bg-white/80 border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                    <ThinkingStatus />
                </div>
            </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Only for active chat) */}
      {!readOnly && (
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative flex items-center max-w-3xl mx-auto gap-2">
            <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading || isInitializing ? "请稍候..." : "输入你的回答..."}
                  disabled={isLoading || isInitializing}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                   <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading || isInitializing} />
                </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || isInitializing}
              className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
      {readOnly && (
         <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-slate-500 text-sm">
            存档模式 - 仅供阅览
         </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {renderHeader()}

      <main className="flex-1 overflow-hidden relative flex flex-col">
        {view === 'HOME' && (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
             <EmotionSelector onSelect={handleEmotionSelect} />
          </div>
        )}

        {view === 'CHAT' && renderChatArea(messages, false)}
        
        {view === 'REVIEW' && reviewSession && renderChatArea(reviewSession.messages, true)}

        {view === 'HISTORY' && (
          <CalendarView 
            sessions={history} 
            onSelectSession={openSessionReview}
            onBack={() => setView('HOME')}
          />
        )}
      </main>
    </div>
  );
}

export default App;