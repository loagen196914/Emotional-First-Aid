import React from 'react';
import { EMOTIONS } from '../constants';
import { EmotionConfig } from '../types';
import { Flame, CloudRain, ShieldAlert, XCircle, Zap, Sun } from 'lucide-react';

interface EmotionSelectorProps {
  onSelect: (emotion: EmotionConfig) => void;
}

const IconMap: Record<string, React.FC<any>> = {
  Flame,
  CloudRain,
  ShieldAlert,
  XCircle,
  Zap,
  Sun
};

const EmotionSelector: React.FC<EmotionSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto p-6 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">你现在感觉如何？</h2>
        <p className="text-slate-500">选择最符合你当下状态的情绪，让我来陪你。</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {EMOTIONS.map((emotion) => {
          const Icon = IconMap[emotion.icon];
          return (
            <button
              key={emotion.type}
              onClick={() => onSelect(emotion)}
              className={`
                group relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 ease-out
                ${emotion.bgColor} hover:shadow-lg hover:-translate-y-1
              `}
            >
              <div className={`mb-4 p-3 rounded-full bg-white shadow-sm ${emotion.color}`}>
                <Icon size={32} strokeWidth={2} />
              </div>
              <h3 className={`text-lg font-semibold ${emotion.color} mb-1`}>{emotion.label}</h3>
              <p className="text-sm text-slate-600 text-center leading-relaxed">{emotion.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EmotionSelector;