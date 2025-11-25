
import React, { useState, useEffect } from 'react';
import { AVAILABLE_MODELS } from '../services/modelRegistry';
import { AIModel } from '../types';
import { Server, Cloud, Loader2, Download, Key, CheckCircle, ExternalLink, HardDrive, Box, ScanLine, Trash2, FileCode, PlayCircle, Search, Cpu, Activity, Zap, Cookie, ChevronDown, Mic, Palette, Video } from 'lucide-react';

const Settings: React.FC = () => {
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:7860');
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [hedraKey, setHedraKey] = useState('');
  const [remakerKey, setRemakerKey] = useState('');
  const [elaiKey, setElaiKey] = useState('');
  const [hfToken, setHfToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Video Generation API Keys
  const [klingKey, setKlingKey] = useState('');
  const [runwayKey, setRunwayKey] = useState('');
  const [lumaKey, setLumaKey] = useState('');
  const [wanKey, setWanKey] = useState('');
  
  // GPU Config
  const [gpuBackend, setGpuBackend] = useState('cuda');
  const [deviceIds, setDeviceIds] = useState('0');
  
  // Persistence for installed models
  const [installedModels, setInstalledModels] = useState<Record<string, boolean>>({});
  const [downloadingModels, setDownloadingModels] = useState<Record<string, boolean>>({});
  const [uninstallingModels, setUninstallingModels] = useState<Record<string, boolean>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Download Queue
  interface DownloadQueueItem {
    modelId: string;
    status: 'pending' | 'downloading' | 'paused' | 'completed';
    priority: 'low' | 'normal' | 'high';
    progress: number;
  }
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueueItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('munzai_installed_models');
    if (saved) {
        try {
            setInstalledModels(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse installed models");
        }
    }
    
    const savedHf = localStorage.getItem('munzai_hf_token');
    if (savedHf) setHfToken(savedHf);
  }, []);

  const handleHfTokenChange = (val: string) => {
      setHfToken(val);
      localStorage.setItem('munzai_hf_token', val);
  };

  const updateInstalledState = (newState: Record<string, boolean>) => {
      setInstalledModels(newState);
      localStorage.setItem('munzai_installed_models', JSON.stringify(newState));
  };

  // Queue Processing Loop
  useEffect(() => {
      const interval = setInterval(() => {
          const downloadingCount = downloadQueue.filter(i => i.status === 'downloading').length;
          if (downloadingCount >= 2) return; // Max 2 concurrent downloads

          const nextItem = downloadQueue
            .filter(i => i.status === 'pending')
            .sort((a, b) => {
                const prioOrder = { high: 3, normal: 2, low: 1 };
                return prioOrder[b.priority] - prioOrder[a.priority];
            })[0];

          if (nextItem) {
              startDownloadSimulation(nextItem.modelId);
          }
      }, 1000);

      return () => clearInterval(interval);
  }, [downloadQueue]);

  const startDownloadSimulation = (id: string) => {
      setDownloadQueue(prev => prev.map(i => i.modelId === id ? { ...i, status: 'downloading' } : i));
      setDownloadingModels(prev => ({ ...prev, [id]: true }));
      
      let progress = 0;
      const interval = setInterval(() => {
          setDownloadQueue(prev => {
              const item = prev.find(i => i.modelId === id);
              if (!item || item.status === 'paused') {
                   // If paused or removed, stop simulation but keep state
                   return prev; 
              }
              
              progress += 2; // Speed
              if (progress >= 100) {
                  clearInterval(interval);
                  setDownloadingModels(prevDL => ({ ...prevDL, [id]: false }));
                  setInstalledModels(prevI => {
                      const newState = { ...prevI, [id]: true };
                      localStorage.setItem('munzai_installed_models', JSON.stringify(newState));
                      return newState;
                  });
                  return prev.filter(i => i.modelId !== id); // Remove from queue when done
              }

              setDownloadProgress(prevP => ({ ...prevP, [id]: progress }));
              return prev.map(i => i.modelId === id ? { ...i, progress } : i);
          });
      }, 100);
  };

  const handleModelAction = (id: string) => {
    if (installedModels[id]) {
        // Uninstall flow
        setUninstallingModels(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            const newState = { ...installedModels, [id]: false };
            updateInstalledState(newState);
            setUninstallingModels(prev => {
                 const next = { ...prev };
                 delete next[id];
                 return next;
            });
            setDownloadProgress(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }, 1000);
    } else {
        // Add to Queue
        if (!downloadQueue.find(i => i.modelId === id)) {
            setDownloadQueue(prev => [...prev, { modelId: id, status: 'pending', priority: 'normal', progress: 0 }]);
        }
    }
  };

  const handleInstallAll = (models: AIModel[]) => {
      const toInstall = models.filter(m => !installedModels[m.id]);
      const newQueueItems: DownloadQueueItem[] = toInstall
        .filter(m => !downloadQueue.find(q => q.modelId === m.id))
        .map(m => ({ modelId: m.id, status: 'pending', priority: 'normal', progress: 0 }));
      
      setDownloadQueue(prev => [...prev, ...newQueueItems]);
  };

  const downloadRequirements = () => {
      const content = `
# MunzAI Studio - Advanced Dependencies
# CUDA 12.1 Compatible Stack

torch>=2.2.0+cu121
torchvision>=0.17.0+cu121
torchaudio>=2.2.0+cu121
--extra-index-url https://download.pytorch.org/whl/cu121

diffusers>=0.26.0
transformers>=4.38.0
accelerate>=0.27.0
xformers>=0.0.24
gradio>=4.19.0
numpy>=1.26.0
opencv-python-headless>=4.9.0
controlnet-aux>=0.0.7
mediapipe>=0.10.9
wandb>=0.16.3
safetensors>=0.4.2
peft>=0.8.2
scikit-image>=0.22.0
einops>=0.7.0
omegaconf>=2.3.0
protobuf>=4.25.0
sentencepiece>=0.2.0
huggingface-hub>=0.20.0
# Lip Sync Dependencies
facexlib>=0.3.0
gfpgan>=1.3.8
moviepy>=1.0.3
`.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'requirements.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const filterModels = (models: AIModel[]) => {
      if (!searchQuery) return models;
      const lowerQuery = searchQuery.toLowerCase();
      return models.filter(m => 
          m.name.toLowerCase().includes(lowerQuery) || 
          m.description.toLowerCase().includes(lowerQuery)
      );
  };

  const localVideoModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && (m.capabilities.includes('text-to-video') || m.capabilities.includes('image-to-video'))));
  const localImageModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('text-to-image') && !localVideoModels.includes(m)));
  const controlNetModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('control-adapter')));
  const loraModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('lora')));
  const lipSyncModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('lip-sync')));

  const renderModelList = (models: AIModel[], title: string, icon: React.ReactNode) => {
    if (models.length === 0) return null; 

    const allInstalled = models.every(m => installedModels[m.id]);
    const isInstallingAny = models.some(m => downloadQueue.find(q => q.modelId === m.id));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    {icon} {title}
                </h4>
                {!allInstalled && (
                    <button 
                        onClick={() => handleInstallAll(models)}
                        disabled={isInstallingAny}
                        className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-50"
                    >
                        {isInstallingAny ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        Install All Weights
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 gap-3">
                {models.map(model => {
                    const isInstalled = installedModels[model.id];
                    const queueItem = downloadQueue.find(q => q.modelId === model.id);
                    const isDownloading = queueItem?.status === 'downloading';
                    const isPending = queueItem?.status === 'pending';
                    const isUninstalling = uninstallingModels[model.id];
                    const progress = queueItem ? queueItem.progress : (downloadProgress[model.id] || 0);
                    const isHF = model.downloadUrl?.includes('huggingface');

                    return (
                        <div key={model.id} className="bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-zinc-200">{model.name}</span>
                                        {isHF && (
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded flex items-center gap-1" title="Hosted on Hugging Face">
                                                <span className="font-serif italic font-bold">hf</span>
                                            </span>
                                        )}
                                        {isInstalled && !isUninstalling && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">INSTALLED</span>}
                                        {isDownloading && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium animate-pulse">DOWNLOADING {Math.round(progress)}%</span>}
                                        {isPending && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">QUEUED</span>}
                                        {isUninstalling && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium animate-pulse">REMOVING</span>}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1 max-w-md">{model.description}</p>
                                    {model.family && <p className="text-[10px] text-zinc-600 mt-0.5">Base: {model.family.toUpperCase()}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleModelAction(model.id)}
                                        disabled={isDownloading || isUninstalling || isPending}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border min-w-[100px] justify-center
                                            ${isUninstalling
                                                ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-wait'
                                                : isInstalled 
                                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 group' 
                                                    : (isDownloading || isPending)
                                                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 cursor-wait'
                                                        : 'bg-zinc-100 text-zinc-900 hover:bg-white border-transparent shadow-lg shadow-white/5'
                                            }`}
                                    >
                                        {isUninstalling ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>Removing...</span>
                                            </>
                                        ) : (isDownloading || isPending) ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>{isPending ? 'Queued' : 'Running...'}</span> 
                                            </>
                                        ) : isInstalled ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 group-hover:hidden" />
                                                <Trash2 className="w-3 h-3 hidden group-hover:block" />
                                                <span className="group-hover:hidden">Ready</span>
                                                <span className="hidden group-hover:block">Uninstall</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-3 h-3" />
                                                <span>Install</span>
                                            </>
                                        )}
                                    </button>
                                    <a 
                                        href={model.downloadUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"
                                        title="View on HuggingFace/Github"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                            
                            {isDownloading && (
                                <div className="w-full h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Server className="w-8 h-8" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white">System Configuration</h1>
            <p className="text-zinc-400">Manage Model Runtimes, Local Weights, and API Connectors</p>
        </div>
      </div>

      {/* Cloud Connectors */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
            <Cloud className="w-6 h-6 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Cloud API Keys</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Google Gemini & Veo</label>
                <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected via Environment</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">OpenAI API Key</label>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                        type="password" 
                        value={openAIKey}
                        onChange={(e) => setOpenAIKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Anthropic API Key</label>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                        type="password" 
                        value={anthropicKey}
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>
            
            {/* New Video Gen APIs */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Video className="w-3 h-3 text-pink-400" /> Runway ML Key
                </label>
                <input 
                    type="password" 
                    value={runwayKey}
                    onChange={(e) => setRunwayKey(e.target.value)}
                    placeholder="runway-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-pink-500 outline-none"
                />
            </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Video className="w-3 h-3 text-blue-400" /> Luma Dream Machine Key
                </label>
                <input 
                    type="password" 
                    value={lumaKey}
                    onChange={(e) => setLumaKey(e.target.value)}
                    placeholder="luma-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                />
            </div>
            
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Video className="w-3 h-3 text-purple-400" /> Kling AI Key
                </label>
                <input 
                    type="password" 
                    value={klingKey}
                    onChange={(e) => setKlingKey(e.target.value)}
                    placeholder="kling-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                />
            </div>
            
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Video className="w-3 h-3 text-orange-400" /> Wan API Key (Cloud)
                </label>
                <input 
                    type="password" 
                    value={wanKey}
                    onChange={(e) => setWanKey(e.target.value)}
                    placeholder="wan-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
            </div>

            {/* Lip Sync Keys */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Hedra API Key</label>
                <input 
                    type="password" 
                    value={hedraKey}
                    onChange={(e) => setHedraKey(e.target.value)}
                    placeholder="hedra-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none"
                />
            </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Remaker.ai API Key</label>
                <input 
                    type="password" 
                    value={remakerKey}
                    onChange={(e) => setRemakerKey(e.target.value)}
                    placeholder="remaker-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none"
                />
            </div>
        </div>
      </section>

      {/* Local Model Manager */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div className="flex items-center gap-3">
                <HardDrive className="w-6 h-6 text-pink-400" />
                <h2 className="text-lg font-bold text-white">Local Library Manager</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                {/* Hugging Face Token Slot */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                         <Cookie className="w-3 h-3" />
                    </div>
                    <input 
                        type="password"
                        value={hfToken}
                        onChange={(e) => handleHfTokenChange(e.target.value)}
                        placeholder="HF Access Token"
                        className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:border-yellow-500 outline-none w-40 focus:w-56 transition-all"
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        Required for restricted models (Wan2.1, LTX)
                    </div>
                </div>

                <button 
                    onClick={downloadRequirements}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                    title="Download requirements.txt"
                >
                    <FileCode className="w-4 h-4" />
                    <span>Requirements.txt</span>
                </button>
                <div className="hidden md:flex items-center gap-2 pl-3 border-l border-zinc-800">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-zinc-400">{localEndpoint}</span>
                </div>
            </div>
        </div>

        {/* Hardware Monitoring Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Cpu className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-bold mb-2">
                    <Activity className="w-3 h-3" /> GPU Status
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    NVIDIA RTX 4090
                </div>
                <div className="text-xs text-zinc-600 mt-1">Driver Version: 536.23</div>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-bold mb-2">
                    <HardDrive className="w-3 h-3" /> VRAM Capacity
                </div>
                <div className="text-lg font-bold text-white">24.0 GB</div>
                <div className="text-xs text-zinc-600 mt-1">Micron GDDR6X</div>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Box className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-bold mb-2">
                    <Cpu className="w-3 h-3" /> Runtime Stack
                </div>
                <div className="text-lg font-bold text-white">Torch 2.2.0</div>
                <div className="text-xs text-zinc-600 mt-1">CUDA 12.1 + cuDNN 8.9</div>
            </div>
        </div>

        {/* GPU Acceleration Section */}
        <div className="p-5 bg-zinc-950/30 border border-zinc-800 rounded-xl mb-6 space-y-4">
             <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                <Zap className="w-4 h-4 text-yellow-500" />
                <h3>GPU Acceleration & Compute Strategy</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">Preferred Backend</label>
                    <div className="relative">
                        <select
                            value={gpuBackend}
                            onChange={(e) => setGpuBackend(e.target.value)}
                            className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer transition-colors hover:bg-zinc-800"
                        >
                            <option value="cuda">NVIDIA CUDA (Recommended)</option>
                            <option value="rocm">AMD ROCm</option>
                            <option value="mps">Apple Metal (MPS)</option>
                            <option value="vulkan">Vulkan (Experimental)</option>
                            <option value="directml">DirectML (Windows)</option>
                            <option value="cpu">CPU Only (Slow)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 flex justify-between">
                        <span>Compute Device IDs</span>
                        <span className="text-[10px] text-zinc-600">Multi-GPU: 0,1</span>
                    </label>
                    <input
                        type="text"
                        value={deviceIds}
                        onChange={(e) => setDeviceIds(e.target.value)}
                        placeholder="0"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none font-mono"
                    />
                </div>
            </div>
        </div>

        <div className="space-y-6">
            {/* Connection & Search Panel */}
            <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-sm font-medium text-zinc-300">Local Backend URL (Gradio/ComfyUI)</label>
                        <input 
                            type="text" 
                            value={localEndpoint}
                            onChange={(e) => setLocalEndpoint(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-pink-500 outline-none font-mono text-sm"
                        />
                    </div>
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Test Connection
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models by name or description..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="space-y-8">
                {renderModelList(localVideoModels, 'Video Generation Models', <Box className="w-4 h-4 text-pink-400" />)}
                {renderModelList(localImageModels, 'Image Generation Models', <Box className="w-4 h-4 text-indigo-400" />)}
                {renderModelList(controlNetModels, 'ControlNet Adapters', <ScanLine className="w-4 h-4 text-emerald-400" />)}
                {renderModelList(loraModels, 'LoRA & Style Adapters', <Palette className="w-4 h-4 text-purple-400" />)}
                {renderModelList(lipSyncModels, 'Lip Sync & Face Animation', <Mic className="w-4 h-4 text-orange-400" />)}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
