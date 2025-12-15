import React, { useState } from 'react';
import { Session, EmotionConfig } from '../types';
import { EMOTIONS } from '../constants';
import { Calendar, ChevronRight, MessageSquare, ArrowLeft } from 'lucide-react';
import { parseCardData } from './FinalCard';

interface CalendarViewProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ sessions, onSelectSession, onBack }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group sessions by date string (YYYY-MM-DD)
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = new Date(session.timestamp).toLocaleDateString('zh-CN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  // Get current month days
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handle clicking a day
  const handleDayClick = (day: number) => {
    const dateStr = new Date(today.getFullYear(), today.getMonth(), day).toLocaleDateString('zh-CN');
    setSelectedDate(dateStr);
  };

  const getSessionsForDay = (day: number) => {
    const dateStr = new Date(today.getFullYear(), today.getMonth(), day).toLocaleDateString('zh-CN');
    return sessionsByDate[dateStr] || [];
  };

  const currentDisplayDate = selectedDate || new Date().toLocaleDateString('zh-CN');
  const activeSessions = sessionsByDate[currentDisplayDate] || [];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-3 shadow-sm">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={20} className="text-teal-500" />
          情绪日历
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Month Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {today.getFullYear()}年 {today.getMonth() + 1}月
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center text-xs text-slate-400 font-medium py-2">{d}</div>
            ))}
            {days.map(day => {
              const daySessions = getSessionsForDay(day);
              const isSelected = new Date(today.getFullYear(), today.getMonth(), day).toLocaleDateString('zh-CN') === selectedDate;
              
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                    ${isSelected ? 'bg-slate-800 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}
                  `}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {/* Dots for emotions */}
                  <div className="flex gap-0.5 mt-1 max-w-[80%] flex-wrap justify-center">
                    {daySessions.slice(0, 4).map((s, idx) => {
                      // Find color from emotion config
                      const emotionConfig = EMOTIONS.find(e => e.type === s.emotion.type);
                      // Extract color class, simplistic parsing for 'text-color-600' to bg
                      let colorClass = "bg-slate-400";
                      if (emotionConfig) {
                         if (emotionConfig.color.includes('red')) colorClass = 'bg-red-500';
                         else if (emotionConfig.color.includes('blue')) colorClass = 'bg-blue-500';
                         else if (emotionConfig.color.includes('purple')) colorClass = 'bg-purple-500';
                         else if (emotionConfig.color.includes('emerald')) colorClass = 'bg-emerald-500';
                         else if (emotionConfig.color.includes('amber')) colorClass = 'bg-amber-500';
                         else if (emotionConfig.color.includes('pink')) colorClass = 'bg-pink-500';
                      }
                      
                      return (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day List */}
        <div>
          <h3 className="text-slate-500 text-sm font-medium mb-3 uppercase tracking-wider flex items-center justify-between">
            {currentDisplayDate} 的记录
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{activeSessions.length}</span>
          </h3>
          
          {activeSessions.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
              这一天没有记录
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map(session => {
                const cardData = session.cardData;
                return (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${session.emotion.bgColor}`}>
                         {/* We assume icons are handled in parent or we simplisticly render emoji for now to save imports */}
                         <span className="text-xl">
                            {session.emotion.type === 'Anger' && '🔥'}
                            {session.emotion.type === 'Sadness' && '🌧️'}
                            {session.emotion.type === 'Fear' && '🛡️'}
                            {session.emotion.type === 'Disgust' && '🤢'}
                            {session.emotion.type === 'Surprise' && '⚡'}
                            {session.emotion.type === 'Happiness' && '☀️'}
                         </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                           {session.emotion.label}
                           <span className="text-xs font-normal text-slate-400">
                             {new Date(session.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {cardData ? cardData.trigger : "未完成的对话"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors" size={20} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;