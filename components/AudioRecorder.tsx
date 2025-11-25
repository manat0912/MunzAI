import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audio: Blob) => void;
  onClear: () => void;
  existingAudioUrl?: string | null;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, onClear, existingAudioUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (existingAudioUrl) {
      setAudioUrl(existingAudioUrl);
    } else {
        setAudioUrl(null);
    }
  }, [existingAudioUrl]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioReady(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const clearAudio = () => {
    setAudioUrl(null);
    onClear();
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
      {error && (
        <div className="mb-2 text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}

      {!audioUrl && !isRecording && (
        <button
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors border border-zinc-800 border-dashed hover:border-zinc-600 group"
        >
          <div className="p-1.5 bg-red-500/10 rounded-full text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
             <Mic className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Record Audio</span>
        </button>
      )}

      {isRecording && (
        <div className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg p-3">
           <div className="flex items-center gap-3">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-mono text-red-400 font-bold">{formatTime(recordingTime)}</span>
           </div>
           <button 
                onClick={stopRecording}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
                <Square className="w-4 h-4 fill-current" />
           </button>
        </div>
      )}

      {audioUrl && (
        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-2 border border-zinc-800">
            <audio 
                ref={audioPlayerRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
            />
            
            <button 
                onClick={togglePlayback}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex-shrink-0"
            >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            
            <div className="flex-1 overflow-hidden">
                <div className="h-6 w-full flex items-center gap-0.5">
                     {/* Fake visualizer bars */}
                     {[...Array(20)].map((_, i) => (
                         <div 
                            key={i} 
                            className="flex-1 bg-indigo-500/40 rounded-full" 
                            style={{ 
                                height: `${30 + Math.random() * 70}%`,
                                opacity: isPlaying ? 1 : 0.5
                            }}
                        />
                     ))}
                </div>
            </div>

            <button 
                onClick={clearAudio}
                className="p-2 hover:bg-red-500/10 hover:text-red-400 text-zinc-500 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
