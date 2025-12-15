export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
}

export enum EmotionType {
  ANGER = 'Anger',
  SADNESS = 'Sadness',
  FEAR = 'Fear',
  DISGUST = 'Disgust',
  SURPRISE = 'Surprise',
  HAPPINESS = 'Happiness'
}

export interface EmotionConfig {
  type: EmotionType;
  label: string;
  icon: string; // Lucide icon name
  color: string;
  bgColor: string;
  description: string;
}

export interface CardData {
  date: string;
  storm: string;
  trigger: string;
  strength: string;
  action: string;
  note: string;
}

export interface Session {
  id: string;
  timestamp: number;
  emotion: EmotionConfig;
  messages: Message[];
  cardData?: CardData;
}