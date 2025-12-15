import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN'; // Set language to Chinese

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!recognitionRef.current) {
    return null; // Don't render if speech recognition is not supported
  }

  return (
    <button
      onClick={toggleListening}
      disabled={disabled}
      className={`
        p-2 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center
        ${isListening 
          ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' 
          : 'bg-slate-100 text-slate-500 hover:bg-teal-100 hover:text-teal-600'}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={isListening ? "点击停止录音" : "点击开始语音输入"}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
};

export default VoiceInput;