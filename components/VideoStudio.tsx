
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import { VideoConfig, Preset, AnimationSettings, AIModel, LoraConfig } from '../types';
import { AVAILABLE_MODELS } from '../services/modelRegistry';
import InpaintingCanvas from './InpaintingCanvas';
import AudioRecorder from './AudioRecorder';
import { Loader2, Film, Upload, Play, AlertCircle, Save, Camera, Zap, ChevronDown, Video as VideoIcon, Eraser, Scan, Scissors, Paintbrush, Info, Music, Activity, Waves, Mic2, Crosshair, Users, Palette, Plus, X, Type, Image as ImageIcon } from 'lucide-react';

const DEFAULT_PRESETS: Preset[] = [
  { id: 'scifi', name: 'Sci-Fi', category: 'Cinematic', description: 'Futuristic, neon-lit cyberpunk style', promptModifier: 'Cinematic sci-fi style, cyberpunk aesthetics, neon lighting, futuristic structures, high contrast, volumetric fog' },
  { id: 'fantasy', name: 'Fantasy', category: 'Cinematic', description: 'Ethereal, magical and mythic', promptModifier: 'High fantasy style, ethereal lighting, magical atmosphere, intricate details, painting like, soft glow' },
  { id: 'noir', name: 'Noir', category: 'Artistic', description: 'B&W, high contrast, dramatic', promptModifier: 'Film noir style, black and white, dramatic shadows, high contrast, vintage cinematic feel, 1940s aesthetic' },
  { id: 'vintage', name: 'Vintage Film', category: 'Vintage', description: '8mm film grain, sepia tones', promptModifier: 'Vintage 8mm film look, film grain, sepia tones, dust and scratches, retro aesthetic, analog photography' },
];

const InfoTooltip = ({ text, example }: { text: string, example?: string }) => (
  <div className="relative inline-block ml-1.5 group">
    <Info className="w-3.5 h-3.5 text-zinc-600 hover:text-indigo-400 cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 invisible group-hover:visible">
      <p className="mb-1.5 text-xs text-zinc-200 leading-relaxed">{text}</p>
      {example && <div className="text-[10px] text-zinc-500 italic border-t border-zinc-800 pt-1.5 mt-1">Example: {example}</div>}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
    </div>
  </div>
);

const VideoStudio: React.FC = () => {
  const [videoGenerationMode, setVideoGenerationMode] = useState<'text-to-video' | 'image-to-video' | 'video-to-video'>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  
  // Media Inputs
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  // Audio Inputs
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSettings, setAudioSettings] = useState({
    syncMode: 'Beat' as 'Beat' | 'Flow' | 'Lyrics',
    strength: 'Balanced' as 'Subtle' | 'Balanced' | 'Intense'
  });

  // Inpainting State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inpaintFrame, setInpaintFrame] = useState<string | null>(null);
  const [maskBlob, setMaskBlob] = useState<Blob | null>(null);

  const [config, setConfig] = useState<VideoConfig>({
    resolution: '720p',
    aspectRatio: '16:9'
  });
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'compose' | 'style' | 'animate' | 'inpaint' | 'lipsync'>('compose');
  
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [animation, setAnimation] = useState<AnimationSettings>({
    cameraZoom: 0,
    cameraPan: 'None',
    cameraRotation: 0,
    subjectAction: '',
    trackingEnabled: false
  });
  
  // Model Selection
  const [selectedModelId, setSelectedModelId] = useState<string>('veo-3.1');
  const [error, setError] = useState<string | null>(null);

  // LoRA State
  const [activeLoras, setActiveLoras] = useState<LoraConfig[]>([]);
  const [showLoraSelector, setShowLoraSelector] = useState(false);

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];
  const supportsVideoToVideo = selectedModel.capabilities.includes('video-to-video');
  const compatibleLoras = AVAILABLE_MODELS.filter(m => m.capabilities.includes('lora') && selectedModel.family && m.family === selectedModel.family);

  // Load custom presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('munzai_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPresets([...DEFAULT_PRESETS, ...parsed]);
      } catch (e) {
        console.error("Failed to load presets");
      }
    }
  }, []);

  // Update available models based on active tab
  const getFilteredModels = () => {
      if (activeTab === 'lipsync') {
          return AVAILABLE_MODELS.filter(m => m.capabilities.includes('lip-sync'));
      }
      return AVAILABLE_MODELS.filter(m => m.capabilities.includes('text-to-video') || m.capabilities.includes('image-to-video') || m.capabilities.includes('video-to-video'));
  };

  useEffect(() => {
     // Auto-switch model when tab changes if current model invalid
     const validModels = getFilteredModels();
     const currentIsValid = validModels.find(m => m.id === selectedModelId);
     if (!currentIsValid && validModels.length > 0) {
         setSelectedModelId(validModels[0].id);
         setActiveLoras([]);
     }
  }, [activeTab]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      if (activeTab !== 'lipsync' && videoGenerationMode === 'image-to-video') {
        setUploadedVideo(null); 
        setUploadedVideoUrl(null);
      }
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedVideo(file);
      if (activeTab !== 'lipsync' && activeTab !== 'inpaint' && videoGenerationMode === 'video-to-video') {
         setUploadedImage(null);
         setUploadedImagePreview(null);
      }
      
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAudioBlob(file);
          const url = URL.createObjectURL(file);
          setAudioUrl(url);
      }
  };

  const handleRecordedAudio = (blob: Blob) => {
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
  };

  const clearAudio = () => {
      setAudioBlob(null);
      setAudioUrl(null);
  };

  const captureFrame = () => {
      const video = videoRef.current;
      if (!video) return;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setInpaintFrame(dataUrl);
      setMaskBlob(null); // Reset mask when new frame captured
  };

  const saveCustomPreset = () => {
    if (!newPresetName || !prompt) return;
    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: newPresetName,
      category: 'Custom',
      description: 'Custom user preset',
      promptModifier: prompt,
      negativePrompt: negativePrompt
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    
    const customPresets = updated.filter(p => p.category === 'Custom');
    localStorage.setItem('munzai_presets', JSON.stringify(customPresets));
    setNewPresetName('');
    setSelectedPresetId(newPreset.id);
  };

  const addLora = (modelId: string) => {
      if (!activeLoras.find(l => l.modelId === modelId)) {
          setActiveLoras([...activeLoras, { modelId, strength: 0.8 }]);
      }
      setShowLoraSelector(false);
  };

  const removeLora = (modelId: string) => {
      setActiveLoras(activeLoras.filter(l => l.modelId !== modelId));
  };

  const updateLoraStrength = (modelId: string, strength: number) => {
      setActiveLoras(activeLoras.map(l => l.modelId === modelId ? { ...l, strength } : l));
  };


  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResultVideo(null);

    // Lip Sync Logic
    if (activeTab === 'lipsync') {
        if (!audioBlob || (!uploadedImage && !uploadedVideo)) {
            setError("Lip Sync requires both an Audio Source (Driver) and a Video/Image Source (Face).");
            setIsGenerating(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            // In a real app, we would send formData with audioBlob + source to the specific API
            if (selectedModel.isLocal) {
                 throw new Error(`Local backend for ${selectedModel.name} not connected. Please start your local inference server.`);
            } else {
                 throw new Error(`API Key for ${selectedModel.name} missing or invalid. Please check Settings.`);
            }
        } catch (e: any) {
             setError(e.message);
        } finally {
            setIsGenerating(false);
        }
        return;
    }

    // Standard Video Generation Logic
    if (!prompt && activeTab !== 'inpaint' && !(activeTab === 'compose' && (uploadedVideo || uploadedImage))) {
        // Relaxed validation: prompt optional if media provided in v2v/i2v
        if (!uploadedVideo && !uploadedImage) {
           setIsGenerating(false);
           return; 
        }
    }

    // Construct augmented prompt
    let finalPrompt = prompt;
    const negatives: string[] = [];

    if (negativePrompt) negatives.push(negativePrompt);
    
    if (selectedPresetId) {
      const preset = presets.find(p => p.id === selectedPresetId);
      if (preset) {
        finalPrompt = `${preset.promptModifier}. ${finalPrompt}`;
        if (preset.negativePrompt) negatives.push(preset.negativePrompt);
      }
    }

    if (negatives.length > 0) {
        finalPrompt += ` \n\nAvoid elements: ${negatives.join(', ')}`;
    }

    // Animation Prompts
    const animPrompts = [];
    if (animation.cameraZoom !== 0) animPrompts.push(animation.cameraZoom > 0 ? "Slow zoom in." : "Slow zoom out.");
    if (animation.cameraPan !== 'None') animPrompts.push(`Camera pans ${animation.cameraPan.toLowerCase()}.`);
    if (animation.cameraRotation !== 0) animPrompts.push(`Camera rotates ${animation.cameraRotation} degrees.`);
    if (animation.subjectAction) animPrompts.push(`Subject action: ${animation.subjectAction}.`);
    if (animation.trackingEnabled) animPrompts.push("Maintain stable object tracking, minimize artifacts, smooth motion, high temporal consistency, lock on subject, stabilize footage.");

    if (animPrompts.length > 0) finalPrompt += `\n\nCamera & Motion: ${animPrompts.join(' ')}`;
    
    if (audioBlob) {
        finalPrompt += `\n\n[Audio Sync] Synchronize video motion and pacing with the provided audio track. Focus on ${audioSettings.syncMode} synchronization with ${audioSettings.strength} intensity.`;
    }

    // Inpainting specific prompt injection
    if (activeTab === 'inpaint' && maskBlob) {
        finalPrompt += `\n\n[INPAINT INSTRUCTION] Regenerate the masked area based on the prompt. Maintain temporal coherence with surrounding pixels. Ensure seamless blending and artifact reduction in the inpainted region.`;
    }

    try {
        let imageToPass = uploadedImage;
        let videoToPass = uploadedVideo;

        // Mode specific filtering for Compose tab
        if (activeTab === 'compose') {
            if (videoGenerationMode === 'text-to-video') {
                imageToPass = null;
                videoToPass = null;
            } else if (videoGenerationMode === 'image-to-video') {
                videoToPass = null;
                if (!imageToPass) throw new Error("Image input required for Image-to-Video mode.");
            } else if (videoGenerationMode === 'video-to-video') {
                imageToPass = null; 
                if (!videoToPass) throw new Error("Video input required for Video-to-Video mode.");
            }
        }

        // If in inpainting mode, we convert the captured frame to a file to use as the visual reference/base
        if (activeTab === 'inpaint' && inpaintFrame) {
             const blob = await (await fetch(inpaintFrame)).blob();
             imageToPass = new File([blob], "captured_frame.png", { type: "image/png" });
             
             // Ensure video file is passed if it exists (for reference)
             if (!videoToPass && uploadedVideo) {
                 videoToPass = uploadedVideo;
             }
        }

        if (selectedModel.provider === 'Google') {
            const url = await generateVideo(finalPrompt, imageToPass, videoToPass, config, maskBlob, audioBlob);
            setResultVideo(url);
        } else {
             // Simulation for Local/External Models
             await new Promise(resolve => setTimeout(resolve, 2000));
             
             if (activeLoras.length > 0) {
                console.log(`Applying Video LoRAs: ${activeLoras.map(l => `${l.modelId} (${l.strength})`).join(', ')}`);
             }

             if (selectedModel.isLocal) {
                 throw new Error(`Local model '${selectedModel.name}' is not connected. Please verify settings.`);
             } else {
                 throw new Error(`${selectedModel.name} integration requires a backend proxy for API keys. Feature disabled in demo.`);
             }
        }
    } catch (e: any) {
      setError(e.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Inputs Panel */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        {activeTab === 'lipsync' ? <Users className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{activeTab === 'lipsync' ? 'Lip Sync Studio' : 'Video Studio'}</h2>
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${selectedModel.isLocal ? 'bg-pink-500' : 'bg-emerald-500'}`} />
                             <p className="text-xs text-zinc-500">{selectedModel.name}</p>
                        </div>
                    </div>
                </div>
                {/* Model Selector */}
                <div className="relative">
                    <select 
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="appearance-none bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium py-1.5 pl-3 pr-8 rounded-lg outline-none focus:border-indigo-500 cursor-pointer"
                    >
                        {getFilteredModels().map(m => (
                            <option key={m.id} value={m.id}>{m.name} {m.isLocal ? '(Local)' : ''}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-fit overflow-x-auto max-w-full no-scrollbar">
                <button onClick={() => setActiveTab('compose')} className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'compose' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Compose</button>
                <button onClick={() => setActiveTab('style')} className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'style' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Presets</button>
                <button onClick={() => setActiveTab('animate')} className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'animate' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Animate</button>
                <button onClick={() => setActiveTab('inpaint')} className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'inpaint' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <Paintbrush className="w-3 h-3" /> Inpaint
                </button>
                <button onClick={() => setActiveTab('lipsync')} className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'lipsync' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <Mic2 className="w-3 h-3" /> Lip Sync
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* COMPOSITION TAB */}
            {activeTab === 'compose' && (
                <div className="space-y-6">
                    {/* Generation Mode Toggle */}
                    <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex">
                        <button
                            onClick={() => setVideoGenerationMode('text-to-video')}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                videoGenerationMode === 'text-to-video'
                                    ? 'bg-zinc-800 text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <Type className="w-4 h-4" />
                            Text-to-Video
                        </button>
                        <button
                            onClick={() => setVideoGenerationMode('image-to-video')}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                videoGenerationMode === 'image-to-video'
                                    ? 'bg-zinc-800 text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <ImageIcon className="w-4 h-4" />
                            Image-to-Video
                        </button>
                        <button
                            onClick={() => setVideoGenerationMode('video-to-video')}
                            disabled={!supportsVideoToVideo}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                videoGenerationMode === 'video-to-video'
                                    ? 'bg-zinc-800 text-white shadow-sm'
                                    : supportsVideoToVideo ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-700 cursor-not-allowed opacity-50'
                            }`}
                            title={!supportsVideoToVideo ? "Model does not support Video-to-Video" : ""}
                        >
                            <VideoIcon className="w-4 h-4" />
                            Video-to-Video
                        </button>
                    </div>

                    {/* Prompt */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex justify-between">
                            <span>Prompt</span>
                            <span className="text-xs text-zinc-600">Enhanced Prompting Active</span>
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your scene in detail..."
                            className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    {/* Negative Prompt */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Negative Prompt</label>
                        <input
                            type="text"
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="Elements to avoid..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    
                    {/* LoRA Selection (Video) */}
                    {selectedModel.isLocal && compatibleLoras.length > 0 && (
                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Palette className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Video Styles (LoRA)</span>
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowLoraSelector(!showLoraSelector)}
                                        className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2 py-1 rounded flex items-center gap-1 transition-colors border border-zinc-800"
                                    >
                                        <Plus className="w-3 h-3" /> Add Style
                                    </button>
                                    
                                    {showLoraSelector && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto">
                                            {compatibleLoras.map(lora => (
                                                <button
                                                    key={lora.id}
                                                    onClick={() => addLora(lora.id)}
                                                    disabled={!!activeLoras.find(al => al.modelId === lora.id)}
                                                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-between border-b border-zinc-800 last:border-0"
                                                >
                                                    <span className="truncate">{lora.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {activeLoras.length > 0 && (
                                <div className="space-y-2">
                                    {activeLoras.map(config => {
                                        const loraModel = AVAILABLE_MODELS.find(m => m.id === config.modelId);
                                        return (
                                            <div key={config.modelId} className="bg-zinc-900 rounded-lg p-2 border border-zinc-800 text-xs flex items-center gap-2">
                                                <span className="font-medium text-zinc-300 truncate w-1/3">{loraModel?.name}</span>
                                                <input 
                                                    type="range" min="0" max="2" step="0.1" 
                                                    value={config.strength}
                                                    onChange={(e) => updateLoraStrength(config.modelId, parseFloat(e.target.value))}
                                                    className="flex-1 h-1 bg-zinc-700 rounded-lg accent-purple-500 cursor-pointer"
                                                />
                                                <button onClick={() => removeLora(config.modelId)} className="text-zinc-500 hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dynamic Media Input */}
                    {videoGenerationMode !== 'text-to-video' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
                                <span>Reference Media</span>
                                {videoGenerationMode === 'video-to-video' && <span className="text-xs text-pink-400">Video-to-Video Active</span>}
                            </label>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {/* Image Input (for Image-to-Video) */}
                                {videoGenerationMode === 'image-to-video' && (
                                    <div className={`relative group border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploadedImage ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {uploadedImagePreview ? (
                                            <div className="relative h-24 w-full flex justify-center">
                                                <img src={uploadedImagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                    <span className="text-white text-xs font-medium">Change</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-zinc-500 py-4">
                                                <Upload className="w-5 h-5" />
                                                <span className="text-xs">Image Source</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Video Input (for Video-to-Video) */}
                                {videoGenerationMode === 'video-to-video' && (
                                    <div className={`relative group border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploadedVideo ? 'border-pink-500/50 bg-pink-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}>
                                         <input 
                                            type="file" 
                                            accept="video/*"
                                            onChange={handleVideoUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {uploadedVideo ? (
                                            <div className="flex flex-col items-center justify-center h-24 text-pink-400">
                                                <VideoIcon className="w-8 h-8 mb-1" />
                                                <span className="text-xs truncate max-w-[100px]">{uploadedVideo.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-zinc-500 py-4">
                                                <VideoIcon className="w-5 h-5" />
                                                <span className="text-xs">Video Source</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Audio Soundtrack Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
                            <span>Audio Soundtrack & Sync</span>
                            <span className="text-xs text-zinc-500">Optional</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Upload Audio */}
                             <div className={`relative border border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${audioUrl && !audioBlob?.name?.startsWith('recording') ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}>
                                 <input type="file" accept="audio/*" onChange={handleAudioUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                 <Music className="w-5 h-5 text-zinc-500" />
                                 <span className="text-xs text-zinc-400">Upload Audio File</span>
                             </div>
                             
                             {/* Recorder */}
                             <AudioRecorder 
                                onAudioReady={handleRecordedAudio} 
                                onClear={clearAudio}
                                existingAudioUrl={audioUrl}
                             />
                        </div>

                        {/* Audio Reactivity Controls - Only visible when audio present */}
                        {audioBlob && (
                            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-3 text-xs text-indigo-400 font-bold uppercase tracking-wider">
                                    <Activity className="w-3 h-3" /> Audio Reactivity
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <span className="text-xs text-zinc-500">Sync Mode</span>
                                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                                            {['Beat', 'Flow', 'Lyrics'].map(mode => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setAudioSettings(s => ({...s, syncMode: mode as any}))}
                                                    className={`flex-1 py-1 text-[10px] rounded font-medium transition-all ${audioSettings.syncMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs text-zinc-500">Reactivity Strength</span>
                                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                                            {['Subtle', 'Balanced', 'Intense'].map(lvl => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setAudioSettings(s => ({...s, strength: lvl as any}))}
                                                    className={`flex-1 py-1 text-[10px] rounded font-medium transition-all ${audioSettings.strength === lvl ? 'bg-pink-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resolution & Aspect */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Resolution</label>
                            <select 
                                value={config.resolution}
                                onChange={(e) => setConfig({...config, resolution: e.target.value as any})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                            >
                                <option value="480p">480p (Fast)</option>
                                <option value="560p">560p (Balanced)</option>
                                <option value="720p">720p (HD)</option>
                                <option value="1080p">1080p (Full HD)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
                            <select 
                                value={config.aspectRatio}
                                onChange={(e) => setConfig({...config, aspectRatio: e.target.value as any})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                            >
                                <option value="16:9">16:9 Landscape</option>
                                <option value="9:16">9:16 Portrait</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* LIP SYNC TAB */}
            {activeTab === 'lipsync' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                     <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                        <h3 className="text-orange-400 font-bold flex items-center gap-2 text-sm mb-2">
                            <Mic2 className="w-4 h-4" /> Audio-Driven Lip Sync
                        </h3>
                        <p className="text-xs text-zinc-400">
                            Upload a face image or video clip, then provide an audio track (driver). The AI will animate the lips and face to match the audio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* 1. Source (Face) */}
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-zinc-300">1. Source (Face)</label>
                             <div className="grid grid-cols-2 gap-4">
                                {/* Image Input */}
                                <div className={`relative group border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploadedImage ? 'border-orange-500/50 bg-orange-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {uploadedImagePreview ? (
                                        <div className="relative h-24 w-full flex justify-center">
                                            <img src={uploadedImagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <span className="text-white text-xs font-medium">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-500 py-4">
                                            <Camera className="w-5 h-5" />
                                            <span className="text-xs">Upload Portrait Image</span>
                                        </div>
                                    )}
                                </div>
                                {/* Video Input */}
                                <div className={`relative group border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploadedVideo ? 'border-orange-500/50 bg-orange-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}>
                                     <input 
                                        type="file" 
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {uploadedVideo ? (
                                        <div className="flex flex-col items-center justify-center h-24 text-orange-400">
                                            <VideoIcon className="w-8 h-8 mb-1" />
                                            <span className="text-xs truncate max-w-[100px]">{uploadedVideo.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-500 py-4">
                                            <VideoIcon className="w-5 h-5" />
                                            <span className="text-xs">Upload Video Clip</span>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* 2. Driver (Audio) */}
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-zinc-300">2. Driver (Audio)</label>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className={`relative border border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${audioUrl && !audioBlob?.name?.startsWith('recording') ? 'border-orange-500/50 bg-orange-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}>
                                     <input type="file" accept="audio/*" onChange={handleAudioUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                     <Music className="w-5 h-5 text-zinc-500" />
                                     <span className="text-xs text-zinc-400">Upload Speech/Vocal</span>
                                 </div>
                                 <AudioRecorder 
                                    onAudioReady={handleRecordedAudio} 
                                    onClear={clearAudio}
                                    existingAudioUrl={audioUrl}
                                 />
                            </div>
                        </div>
                        
                        {/* 3. Settings */}
                        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Configuration</label>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-300">Face Restoration</span>
                                <div className="flex items-center bg-zinc-900 rounded-lg p-1">
                                    <button className="px-3 py-1 text-xs rounded bg-zinc-800 text-white shadow">GFPGAN</button>
                                    <button className="px-3 py-1 text-xs rounded text-zinc-500 hover:text-white">CodeFormer</button>
                                    <button className="px-3 py-1 text-xs rounded text-zinc-500 hover:text-white">None</button>
                                </div>
                            </div>
                             
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Lip Sync Strength</span>
                                    <span>1.0</span>
                                </div>
                                <input type="range" min="0.5" max="1.5" step="0.1" defaultValue="1.0" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STYLE / PRESETS TAB */}
            {activeTab === 'style' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        {presets.map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setSelectedPresetId(selectedPresetId === preset.id ? null : preset.id)}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    selectedPresetId === preset.id 
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100' 
                                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                                }`}
                            >
                                <div className="font-semibold text-sm mb-1">{preset.name}</div>
                                <div className="text-xs opacity-70 line-clamp-2">{preset.description}</div>
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-zinc-800 space-y-3">
                        <label className="text-sm font-medium text-zinc-300">Save Current Style</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="My Custom Preset Name"
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm text-white focus:border-indigo-500 outline-none"
                            />
                            <button 
                                onClick={saveCustomPreset}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white"
                                title="Save Preset"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ANIMATION TAB */}
            {activeTab === 'animate' && (
                <div className="space-y-6">
                    {/* Camera Moves */}
                    <div className="space-y-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                            <Camera className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Camera Control</span>
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-xs text-zinc-400">Zoom Level</span>
                                <InfoTooltip text="Controls the camera focal length. Positive values zoom in (telephoto), negative values zoom out (wide-angle)." example="Use +5 for a dramatic push-in." />
                            </div>
                            <div className="flex justify-between text-xs text-zinc-500 mb-1 px-1">
                                <span>Zoom Out</span>
                                <span>Zoom In</span>
                            </div>
                            <input 
                                type="range" min="-10" max="10" step="1"
                                value={animation.cameraZoom}
                                onChange={(e) => setAnimation({...animation, cameraZoom: parseInt(e.target.value)})}
                                className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-xs text-zinc-400">Pan Direction</span>
                                <InfoTooltip text="Moves the camera horizontally or vertically across the scene." example="Select 'Left' to track a subject moving left." />
                            </div>
                            <div className="flex gap-2">
                                {['None', 'Left', 'Right', 'Up', 'Down'].map(dir => (
                                    <button
                                        key={dir}
                                        onClick={() => setAnimation({...animation, cameraPan: dir as any})}
                                        className={`flex-1 py-1 text-xs rounded border ${
                                            animation.cameraPan === dir 
                                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                        }`}
                                    >
                                        {dir}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-xs text-zinc-400">Rotation (-45° to 45°)</span>
                                <InfoTooltip text="Rolls the camera around the lens axis (Dutch Angle). Adds dynamic energy or unease." example="±5° for a handheld feel, ±20° for action scenes." />
                            </div>
                            <input 
                                type="range" min="-45" max="45" step="5"
                                value={animation.cameraRotation}
                                onChange={(e) => setAnimation({...animation, cameraRotation: parseInt(e.target.value)})}
                                className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Subject Actions */}
                    <div className="space-y-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                         <div className="flex items-center gap-2 mb-2 text-emerald-400">
                            <MoveIcon className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Subject & Motion</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <label className="text-xs text-zinc-400">Character/Object Action</label>
                                <InfoTooltip text="Describes specific movement or activity for the primary subject." example="'Running toward camera', 'Sipping coffee', 'Waving goodbye'" />
                            </div>
                            <input 
                                type="text"
                                placeholder="e.g. Running, Dancing, Flying..."
                                value={animation.subjectAction}
                                onChange={(e) => setAnimation({...animation, subjectAction: e.target.value})}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-emerald-500 outline-none"
                            />
                        </div>

                        {/* Artifact Reduction & Tracking Toggle */}
                        <div className={`mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between rounded-xl transition-all duration-300 ${animation.trackingEnabled ? 'bg-yellow-500/5 border border-yellow-500/20 p-3 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'p-1'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${animation.trackingEnabled ? 'bg-yellow-500/10 text-yellow-400' : 'bg-zinc-900 text-zinc-600'}`}>
                                    {animation.trackingEnabled ? <Crosshair className="w-4 h-4 animate-pulse" /> : <Zap className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-zinc-200">Artifact Reduction & Tracking</span>
                                        {animation.trackingEnabled && (
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20 font-medium tracking-wide">
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">Optimizes motion vectors to reduce jitter.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setAnimation({...animation, trackingEnabled: !animation.trackingEnabled})}
                                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 shadow-inner ${animation.trackingEnabled ? 'bg-gradient-to-r from-yellow-600 to-amber-600 shadow-yellow-900/20' : 'bg-zinc-800 shadow-black/20'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${animation.trackingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* INPAINT TAB */}
            {activeTab === 'inpaint' && (
                <div className="space-y-6">
                    {!uploadedVideoUrl ? (
                         <div className="h-32 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all relative">
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-sm">Upload Video to Edit</span>
                            <input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-black rounded-lg overflow-hidden border border-zinc-800 relative group">
                                <video ref={videoRef} src={uploadedVideoUrl} controls className="w-full h-48 object-contain" />
                                <button 
                                    onClick={captureFrame}
                                    className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                                >
                                    <Scan className="w-3 h-3" /> Capture Frame
                                </button>
                            </div>

                            {inpaintFrame ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-zinc-300">Advanced Inpainting Mask</label>
                                        <div className="flex items-center gap-2">
                                            {maskBlob && <span className="text-xs text-pink-400 font-bold px-2 py-0.5 bg-pink-500/10 rounded">Mask Ready</span>}
                                        </div>
                                    </div>
                                    {/* Increased height for granular control surface */}
                                    <div className="h-[500px] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-black">
                                        <InpaintingCanvas imageUrl={inpaintFrame} onMaskComplete={(blob) => setMaskBlob(blob)} />
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Use <strong>Brush</strong>, <strong>Fill</strong>, or <strong>Magic Wand</strong> to define the area. For Magic Wand: <strong>Click on object</strong> or type prompt.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center text-zinc-500">
                                    <span className="text-sm">Capture a frame above to start masking</span>
                                </div>
                            )}

                             <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Inpaint Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe how to fill the masked area..."
                                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
             <button
                onClick={handleGenerate}
                disabled={isGenerating || (activeTab !== 'lipsync' && !prompt && activeTab !== 'inpaint' && !(activeTab === 'compose' && (uploadedVideo || uploadedImage)))}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                    ${isGenerating 
                    ? 'bg-zinc-800 cursor-not-allowed opacity-50' 
                    : activeTab === 'lipsync'
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-500/20'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20'
                    }`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing on {selectedModel.provider}...</span>
                    </>
                ) : (
                    <>
                        {activeTab === 'lipsync' ? <Mic2 className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                        <span>{activeTab === 'inpaint' ? 'Regenerate Masked Area' : activeTab === 'lipsync' ? 'Sync Audio & Face' : 'Generate Video'}</span>
                    </>
                )}
            </button>
             {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-black rounded-2xl border border-zinc-800 p-1 flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 to-zinc-950 -z-10" />
        
        {resultVideo ? (
          <video 
            src={resultVideo} 
            controls 
            autoPlay 
            loop 
            className="w-full h-full object-contain rounded-xl shadow-2xl"
          />
        ) : (
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
              <Film className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-zinc-500 font-medium">No video generated yet</h3>
            <p className="text-zinc-600 text-sm mt-2 max-w-xs mx-auto">
              Use the controls on the left to start generating cinematic videos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const MoveIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
);

export default VideoStudio;
