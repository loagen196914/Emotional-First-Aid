import React from 'react';
import { CardData } from '../types';
import { Leaf, Calendar, CloudLightning, Key, Diamond, Pill, Lightbulb } from 'lucide-react';

interface FinalCardProps {
  rawText: string;
}

// Helper to extract data from the specific Markdown format requested
export const parseCardData = (text: string): CardData | null => {
  try {
    const getField = (regex: RegExp) => {
      const match = text.match(regex);
      return match ? match[1].trim() : "N/A";
    };

    // Robust regex to capture text after the emojis until the next emoji or end of line
    const date = getField(/📅.*?(?:日期|Date)：(.*?)(?=\s*[🌊]|$)/i);
    const storm = getField(/🌊.*?(?:风暴|Storm|情绪风暴)：(.*?)(?=\s*[🗝️]|$)/i);
    const trigger = getField(/🗝️.*?(?:触发点|Trigger|核心触发点)：(.*?)(?=\s*[💎]|$)/i);
    const strength = getField(/💎.*?(?:力量|Strength|内在力量)：(.*?)(?=\s*[💊]|$)/i);
    const action = getField(/💊.*?(?:药方|Prescription|行动药方)：(.*?)(?=\s*[💡]|$)/i);
    const note = getField(/💡.*?(?:寄语|Note)：(.*?)$/i);

    if (date === "N/A" && storm === "N/A") return null;

    return { date, storm, trigger, strength, action, note };
  } catch (e) {
    console.error("Failed to parse card", e);
    return null;
  }
};

const FinalCard: React.FC<FinalCardProps> = ({ rawText }) => {
  const data = parseCardData(rawText);

  // If parsing fails, fall back to simple text display
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 whitespace-pre-wrap text-slate-700">
        {rawText}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-scale-in">
      <div className="bg-teal-500 p-4 text-white flex items-center justify-center gap-2">
        <Leaf className="w-5 h-5" />
        <h3 className="font-bold text-lg tracking-wide">你的情绪急救卡</h3>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-center text-xs text-slate-400 font-medium uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {data.date}
          </div>
          <div className="bg-teal-50 text-teal-700 px-2 py-1 rounded-full flex items-center gap-1">
             <CloudLightning className="w-3 h-3" />
             {data.storm}
          </div>
        </div>

        <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                    <Key className="w-4 h-4 text-orange-400" />
                    <h4>核心触发点</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{data.trigger}</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-1">
                    <Diamond className="w-4 h-4 text-indigo-500" />
                    <h4>你的内在力量</h4>
                </div>
                <p className="text-indigo-700 text-sm leading-relaxed">{data.strength}</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-1">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    <h4>当下行动药方</h4>
                </div>
                <p className="text-emerald-700 text-sm leading-relaxed font-medium">{data.action}</p>
            </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-2 text-amber-500">
                <Lightbulb className="w-5 h-5" />
            </div>
            <p className="text-slate-600 italic font-serif text-lg">"{data.note}"</p>
        </div>
      </div>
    </div>
  );
};

export default FinalCard;