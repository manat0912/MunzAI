
import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_MODELS } from '../services/modelRegistry';
import { AIModel } from '../types';
import { Server, Cloud, Loader2, Download, Key, CheckCircle, ExternalLink, HardDrive, Box, ScanLine, Trash2, FileCode, PlayCircle, Search, Cpu, Activity, Zap, Cookie, ChevronDown, Mic, Palette, Video, Terminal, FilePlus, Workflow, Puzzle, Image as ImageIcon, FileDown, Brush, Cuboid } from 'lucide-react';

const Settings: React.FC = () => {
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:7860');
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [hedraKey, setHedraKey] = useState('');
  const [remakerKey, setRemakerKey] = useState('');
  const [elaiKey, setElaiKey] = useState('');
  const [mangoKey, setMangoKey] = useState(''); 
  const [hfToken, setHfToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Video Generation API Keys
  const [klingKey, setKlingKey] = useState('');
  const [runwayKey, setRunwayKey] = useState('');
  const [lumaKey, setLumaKey] = useState('');
  const [wanKey, setWanKey] = useState('');
  const [stabilityKey, setStabilityKey] = useState('');
  const [nvidiaKey, setNvidiaKey] = useState('');
  const [pikaKey, setPikaKey] = useState('');
  const [letsEnhanceKey, setLetsEnhanceKey] = useState('');
  
  // New Image Generation API Keys
  const [recraftKey, setRecraftKey] = useState('');
  const [ideogramKey, setIdeogramKey] = useState('');
  const [bflKey, setBflKey] = useState('');
  const [playgroundKey, setPlaygroundKey] = useState('');

  // Inpainting Keys
  const [mootionKey, setMootionKey] = useState('');
  const [deepAiKey, setDeepAiKey] = useState('');

  // GPU Rental Keys
  const [vastKey, setVastKey] = useState('');
  const [tensorDockKey, setTensorDockKey] = useState('');
  const [runPodKey, setRunPodKey] = useState('');
  const [thunderKey, setThunderKey] = useState('');
  const [lambdaKey, setLambdaKey] = useState('');
  const [awsKey, setAwsKey] = useState('');
  const [gcpKey, setGcpKey] = useState('');
  const [paperspaceKey, setPaperspaceKey] = useState('');
  const [jarvisKey, setJarvisKey] = useState('');
  const [genesisKey, setGenesisKey] = useState('');
  const [saladKey, setSaladKey] = useState('');
  const [skyPilotKey, setSkyPilotKey] = useState('');
  const [colabKey, setColabKey] = useState('');

  // GPU Config
  const [gpuBackend, setGpuBackend] = useState('cuda');
  const [deviceIds, setDeviceIds] = useState('0');
  
  // Persistence for installed models
  const [installedModels, setInstalledModels] = useState<Record<string, boolean>>({});
  const [downloadingModels, setDownloadingModels] = useState<Record<string, boolean>>({});
  const [uninstallingModels, setUninstallingModels] = useState<Record<string, boolean>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [customModels, setCustomModels] = useState<AIModel[]>([]);

  // File Input for Custom Import
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const savedCustom = localStorage.getItem('munzai_custom_models');
    if (savedCustom) {
        try {
            setCustomModels(JSON.parse(savedCustom));
        } catch (e) {
            console.error("Failed to parse custom models");
        }
    }
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

  const handleImportModel = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Create a new Custom Model
          const newModel: AIModel = {
              id: `custom-${Date.now()}`,
              name: file.name.replace('.safetensors', '').replace(/_/g, ' '),
              provider: 'Local',
              capabilities: ['text-to-image', 'image-to-image'], // Default capabilities for generic safetensors
              description: `Imported local model: ${file.name}`,
              isLocal: true,
              family: 'other' // User could technically specify this, but default to other
          };

          const updatedCustom = [...customModels, newModel];
          setCustomModels(updatedCustom);
          localStorage.setItem('munzai_custom_models', JSON.stringify(updatedCustom));
          
          // Mark as installed
          const newInstalled = { ...installedModels, [newModel.id]: true };
          updateInstalledState(newInstalled);

          // Clear input
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const downloadRequirements = () => {
      const content = `
# MunzAI Studio - Advanced Dependencies
# CUDA 12.8 Optimization Stack

--extra-index-url https://download.pytorch.org/whl/cu128

# Core PyTorch (CUDA 12.8)
torch>=2.6.0+cu128
torchvision>=0.21.0+cu128
torchaudio>=2.6.0+cu128

# Server
fastapi>=0.110.0
uvicorn>=0.27.1
python-multipart>=0.0.9

# Diffusion & Transformers
diffusers>=0.32.0
transformers>=4.48.0
accelerate>=1.3.0
xformers>=0.0.29
safetensors>=0.5.0
peft>=0.14.0
huggingface-hub>=0.27.0
sentencepiece>=0.2.0
protobuf>=5.29.0
omegaconf>=2.3.0
einops>=0.8.0

# Video Loading & Processing
decord>=0.6.0
av>=14.0.0
moviepy>=1.0.3
imageio>=2.36.0
imageio-ffmpeg>=0.5.1
easydict>=1.13
rich>=13.9.4

# Audio
librosa>=0.10.2
soundfile>=0.12.1

# 3D & VFX
trimesh>=4.5.3
plyfile>=1.1
kiui>=0.2.10
lpips>=0.1.4
pyglet>=2.0.10

# UI & Processing
gradio>=5.15.0
numpy>=1.26.4
opencv-python-headless>=4.11.0.86
Pillow>=11.1.0
scikit-image>=0.25.0
ftfy>=6.3.1
regex>=2024.11.6
scipy>=1.15.1
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

  const downloadInstallerScript = () => {
    const scriptContent = `
import os
import sys
import subprocess
import platform
import venv
import shutil

# --- EMBEDDED BACKEND SERVER CODE ---
BACKEND_CODE = r"""
import torch
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import sys

# Initialize FastAPI
app = FastAPI(title="MunzAI Studio Backend", version="1.0.0")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:7860",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System Info
def get_system_info():
    info = {
        "status": "online",
        "platform": sys.platform,
        "cuda_available": torch.cuda.is_available(),
        "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "current_device": "cpu"
    }
    
    if info["cuda_available"]:
        info["current_device"] = torch.cuda.get_device_name(0)
        info["vram_allocated"] = f"{torch.cuda.memory_allocated(0) / 1024**3:.2f} GB"
        info["vram_reserved"] = f"{torch.cuda.memory_reserved(0) / 1024**3:.2f} GB"
    
    return info

@app.get("/")
def read_root():
    return {"message": "MunzAI Studio Backend is Running"}

@app.get("/api/v1/system/status")
def health_check():
    return get_system_info()

# --- MODEL MANAGEMENT STUB ---
class ModelManager:
    def __init__(self):
        self.loaded_models = {}
        
    def load_model(self, model_id, model_type):
        print(f"Loading model: {model_id} ({model_type})")
        # Real implementation would use diffusers here
        # pipe = DiffusionPipeline.from_pretrained(...)
        # pipe.to("cuda")
        return True

    def unload_model(self, model_id):
        if model_id in self.loaded_models:
            del self.loaded_models[model_id]
            torch.cuda.empty_cache()

manager = ModelManager()

# --- GENERATION ENDPOINTS ---

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    width: int = 1024
    height: int = 1024
    steps: int = 30
    cfg: float = 7.0

@app.post("/api/v1/generate/image")
async def generate_image(req: GenerateRequest):
    if not torch.cuda.is_available():
        return {"error": "CUDA not available. Running in CPU mode is slow."}
    
    # Placeholder for actual Diffusers generation logic
    return {"status": "success", "message": f"Generated image for '{req.prompt}' on {get_system_info()['current_device']}"}

@app.post("/api/v1/generate/video")
async def generate_video(req: GenerateRequest):
    # Placeholder for Video generation
    return {"status": "success", "message": f"Generated video for '{req.prompt}'"}

if __name__ == "__main__":
    print(f"Starting MunzAI Server on CUDA: {torch.cuda.is_available()}")
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""
# ------------------------------------

def run_command(command):
    print(f"Running: {command}")
    try:
        subprocess.check_call(command, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e}")
        sys.exit(1)

def main():
    print("==========================================")
    print("   MunzAI Studio - Local Installer")
    print("==========================================")

    # 1. System Check
    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")

    if sys.version_info < (3, 10):
        print("Error: Python 3.10 or higher is required.")
        sys.exit(1)

    # 2. Virtual Environment Setup
    venv_dir = "munzai_env"
    if os.path.exists(venv_dir):
        print(f"Virtual environment '{venv_dir}' already exists.")
    else:
        print(f"Creating virtual environment in '{venv_dir}'...")
        venv.create(venv_dir, with_pip=True)

    # Determine paths
    if platform.system() == "Windows":
        python_exe = os.path.join(venv_dir, "Scripts", "python.exe")
        pip_exe = os.path.join(venv_dir, "Scripts", "pip.exe")
        activate_cmd = f"{venv_dir}\\\\Scripts\\\\activate"
    else:
        python_exe = os.path.join(venv_dir, "bin", "python")
        pip_exe = os.path.join(venv_dir, "bin", "pip")
        activate_cmd = f"source {venv_dir}/bin/activate"

    # 3. Upgrade Pip
    print("Upgrading pip...")
    run_command(f'"{python_exe}" -m pip install --upgrade pip')

    # 4. Install Dependencies
    req_file = "requirements.txt"
    if not os.path.exists(req_file):
        print(f"Warning: {req_file} not found. Creating default for CUDA 12.8...")
        default_reqs = """
--extra-index-url https://download.pytorch.org/whl/cu128
torch>=2.6.0+cu128
torchvision>=0.21.0+cu128
torchaudio>=2.6.0+cu128
fastapi>=0.110.0
uvicorn>=0.27.1
python-multipart>=0.0.9
diffusers>=0.32.0
transformers>=4.48.0
accelerate>=1.3.0
xformers>=0.0.29
safetensors>=0.5.0
"""
        with open(req_file, "w") as f:
            f.write(default_reqs.strip())

    print("Installing dependencies...")
    run_command(f'"{pip_exe}" install -r {req_file}')

    # 5. Write Backend Server File
    server_file = "munzai_server.py"
    with open(server_file, "w") as f:
        f.write(BACKEND_CODE)
    print(f"Generated backend server: {server_file}")

    # 6. Post-Install Instructions
    print("\\n==========================================")
    print("Installation Complete!")
    print("To start the MunzAI Backend with CUDA Support:")
    print(f"1. {activate_cmd}")
    print(f"2. python {server_file}")
    print("==========================================")

if __name__ == "__main__":
    main()
`.trim();

    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'install_munzai.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPinokioScript = () => {
    const pinokioJson = {
        "version": "2.0",
        "name": "munzai-studio",
        "icon": "icon.png",
        "description": "Launch MunzAI Studio with full backend support",
        "run": [
            {
                "method": "shell.run",
                "params": {
                    "message": "npm install"
                }
            },
            {
                "method": "shell.run",
                "params": {
                    "message": "python install_munzai.py"
                }
            },
            {
                "method": "shell.run",
                "params": {
                    "message": "npm start"
                }
            }
        ]
    };
    
    const blob = new Blob([JSON.stringify(pinokioJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'munzai-pinokio.json';
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

  const localVideoModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && (m.capabilities.includes('text-to-video') || m.capabilities.includes('image-to-video')) && !m.capabilities.includes('node') && !m.capabilities.includes('motion-module') && !m.capabilities.includes('video-inpainting')));
  const localImageModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('text-to-image') && !localVideoModels.includes(m)));
  const controlNetModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('control-adapter')));
  const loraModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('lora')));
  const lipSyncModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('lip-sync')));
  const integrationNodes = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('node')));
  const motionModules = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('motion-module')));
  const inpaintingModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && (m.capabilities.includes('video-inpainting') || m.capabilities.includes('magic-quill'))));
  const cgVfxModels = filterModels(AVAILABLE_MODELS.filter(m => m.isLocal && m.capabilities.includes('cg-vfx')));
  const filteredCustomModels = filterModels(customModels);

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
                    const hasSafeTensor = !!model.safeTensorUrl;

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
                                        {hasSafeTensor && (
                                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono">.safetensors</span>
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
                                    {/* Install / State Management Button */}
                                    <button 
                                        onClick={() => handleModelAction(model.id)}
                                        disabled={isDownloading || isUninstalling || isPending}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border min-w-[80px] justify-center
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

                                    {/* Direct SafeTensor Download Button */}
                                    {model.safeTensorUrl && (
                                        <a 
                                            href={model.safeTensorUrl}
                                            download
                                            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 border border-zinc-700 hover:border-zinc-600"
                                            title="Download .safetensors file directly"
                                        >
                                            <FileDown className="w-3 h-3" />
                                            <span className="hidden sm:inline">Get .safetensors</span>
                                        </a>
                                    )}

                                    {/* Model Card Link */}
                                    {model.downloadUrl && (
                                        <a 
                                            href={model.downloadUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"
                                            title="View Model Card"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
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
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Google Gemini & Veo</label>
                    <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected via Environment</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">OpenAI API Key</label>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input type="password" value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} placeholder="sk-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Anthropic API Key</label>
                    <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input type="password" value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} placeholder="sk-ant-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Stability AI Key</label>
                    <a href="https://platform.stability.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <input type="password" value={stabilityKey} onChange={(e) => setStabilityKey(e.target.value)} placeholder="sk-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">NVIDIA NIM Key</label>
                    <a href="https://build.nvidia.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <input type="password" value={nvidiaKey} onChange={(e) => setNvidiaKey(e.target.value)} placeholder="nvapi-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Pika Labs API</label>
                    <a href="https://pika.art/login" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <input type="password" value={pikaKey} onChange={(e) => setPikaKey(e.target.value)} placeholder="pika-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">LetsEnhance API</label>
                    <a href="https://letsenhance.io/api" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <input type="password" value={letsEnhanceKey} onChange={(e) => setLetsEnhanceKey(e.target.value)} placeholder="le-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>

            {/* New Image APIs */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Recraft API</label>
                    <a href="https://www.recraft.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={recraftKey} onChange={(e) => setRecraftKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Ideogram API</label>
                    <a href="https://ideogram.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={ideogramKey} onChange={(e) => setIdeogramKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Black Forest Labs (Flux)</label>
                    <a href="https://blackforestlabs.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={bflKey} onChange={(e) => setBflKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Playground AI</label>
                    <a href="https://playgroundai.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={playgroundKey} onChange={(e) => setPlaygroundKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>

            {/* Video API Keys */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Runway ML</label>
                    <a href="https://runwayml.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={runwayKey} onChange={(e) => setRunwayKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Luma Labs (Dream Machine)</label>
                    <a href="https://lumalabs.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={lumaKey} onChange={(e) => setLumaKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Kling AI</label>
                    <a href="https://kling.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={klingKey} onChange={(e) => setKlingKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Wan (Alibaba Cloud)</label>
                    <a href="https://www.alibabacloud.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={wanKey} onChange={(e) => setWanKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>

            {/* Inpainting Keys */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Mootion</label>
                    <a href="https://www.mootion.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={mootionKey} onChange={(e) => setMootionKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">DeepAI</label>
                    <a href="https://deepai.org/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={deepAiKey} onChange={(e) => setDeepAiKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>

            {/* Lip Sync Keys */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Hedra API</label>
                    <a href="https://www.hedra.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={hedraKey} onChange={(e) => setHedraKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Remaker API</label>
                    <a href="https://remaker.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={remakerKey} onChange={(e) => setRemakerKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Elai.io API</label>
                    <a href="https://elai.io/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={elaiKey} onChange={(e) => setElaiKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Mango Animate API</label>
                    <a href="https://mangoanimate.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={mangoKey} onChange={(e) => setMangoKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
        </div>
      </section>

      {/* GPU Rental & Cloud Compute Platforms */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-orange-400" />
            <h2 className="text-lg font-bold text-white">GPU Rental & Cloud Compute Platforms</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Vast.ai API Key</label>
                    <a href="https://vast.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <input type="password" value={vastKey} onChange={(e) => setVastKey(e.target.value)} placeholder="vast-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">TensorDock Key</label>
                    <a href="https://tensordock.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={tensorDockKey} onChange={(e) => setTensorDockKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">RunPod Key</label>
                    <a href="https://www.runpod.io/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={runPodKey} onChange={(e) => setRunPodKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Thunder Compute</label>
                    <a href="https://thundercompute.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={thunderKey} onChange={(e) => setThunderKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Lambda Labs</label>
                    <a href="https://lambdalabs.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={lambdaKey} onChange={(e) => setLambdaKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">AWS Access Key</label>
                    <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={awsKey} onChange={(e) => setAwsKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">GCP Service Key</label>
                    <a href="https://cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={gcpKey} onChange={(e) => setGcpKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Paperspace Key</label>
                    <a href="https://www.paperspace.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={paperspaceKey} onChange={(e) => setPaperspaceKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">JarvisLabs Key</label>
                    <a href="https://jarvislabs.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={jarvisKey} onChange={(e) => setJarvisKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Genesis Cloud</label>
                    <a href="https://www.genesiscloud.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={genesisKey} onChange={(e) => setGenesisKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Salad.io Key</label>
                    <a href="https://salad.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={saladKey} onChange={(e) => setSaladKey(e.target.value)} placeholder="Key..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">SkyPilot Config</label>
                    <a href="https://skypilot.co/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={skyPilotKey} onChange={(e) => setSkyPilotKey(e.target.value)} placeholder="Path/Config..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Google Colab Token</label>
                    <a href="https://colab.research.google.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                </div>
                <input type="password" value={colabKey} onChange={(e) => setColabKey(e.target.value)} placeholder="Token..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none" />
            </div>
        </div>
      </section>

      {/* Integrations & Launchers */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-bold text-white">Integrations & Launchers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between h-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <div className="text-black font-black text-2xl tracking-tighter">P.</div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-200">Pinokio Integration</h3>
                        <p className="text-sm text-zinc-500">Auto-configure via Pinokio browser.</p>
                    </div>
                </div>
                <button 
                    onClick={downloadPinokioScript}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download JSON
                </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between h-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-200">Local Installer Script</h3>
                        <p className="text-sm text-zinc-500">Python script to setup environment & install CUDA 12.8 deps.</p>
                    </div>
                </div>
                <button 
                    onClick={downloadInstallerScript}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Download className="w-4 h-4" />
                    Download install.py
                </button>
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
                </div>
                <button onClick={downloadRequirements} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors">
                    <FileCode className="w-4 h-4" />
                    <span>Requirements.txt</span>
                </button>
                <div className="hidden md:flex items-center gap-2 pl-3 border-l border-zinc-800">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-zinc-400">{localEndpoint}</span>
                </div>
            </div>
        </div>

        {/* Hardware Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Cpu className="w-5 h-5" /></div>
                <div>
                    <div className="text-xs text-zinc-500 font-bold uppercase">GPU Status</div>
                    <div className="text-sm font-medium text-zinc-200">RTX 4090 (Simulated)</div>
                </div>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><Activity className="w-5 h-5" /></div>
                <div>
                    <div className="text-xs text-zinc-500 font-bold uppercase">VRAM Available</div>
                    <div className="text-sm font-medium text-zinc-200">24.0 GB / 24.0 GB</div>
                </div>
            </div>
             <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Zap className="w-5 h-5" /></div>
                <div>
                    <div className="text-xs text-zinc-500 font-bold uppercase">CUDA Version</div>
                    <div className="text-sm font-medium text-zinc-200">v12.8 Detected</div>
                </div>
            </div>
        </div>

        {/* GPU Acceleration */}
        <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> GPU Acceleration & Compute Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs text-zinc-500 font-medium uppercase">Backend / Execution Provider</label>
                    <div className="relative">
                        <select 
                            value={gpuBackend}
                            onChange={(e) => setGpuBackend(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none appearance-none"
                        >
                            <option value="cuda">NVIDIA CUDA (Recommended)</option>
                            <option value="rocm">AMD ROCm</option>
                            <option value="metal">Apple Metal (MPS)</option>
                            <option value="vulkan">Vulkan</option>
                            <option value="directml">DirectML (Windows)</option>
                            <option value="cpu">CPU (Slow)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <label className="text-xs text-zinc-500 font-medium uppercase">Device IDs (Comma Separated)</label>
                    <input 
                        type="text" 
                        value={deviceIds}
                        onChange={(e) => setDeviceIds(e.target.value)}
                        placeholder="0, 1..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                    />
                    <p className="text-[10px] text-zinc-600">Specify GPU indices for multi-gpu setups.</p>
                </div>
            </div>
        </div>

        <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2 w-full">
                    <label className="text-sm font-medium text-zinc-300">Local Backend URL (Gradio/ComfyUI)</label>
                    <input type="text" value={localEndpoint} onChange={(e) => setLocalEndpoint(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-pink-500 outline-none font-mono text-sm" />
                </div>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Test Connection</button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search models by name or description..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
            </div>
        </div>

        {/* Import Custom SafeTensor Model Section */}
        <div className="p-4 bg-zinc-950/80 border border-dashed border-zinc-700 rounded-xl flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                     <FilePlus className="w-5 h-5" />
                 </div>
                 <div>
                     <h4 className="text-sm font-bold text-zinc-200">Import Custom Model (.safetensors)</h4>
                     <p className="text-xs text-zinc-500">Add local weights directly to your library.</p>
                 </div>
             </div>
             <div className="relative">
                 <input type="file" accept=".safetensors,.ckpt,.bin" ref={fileInputRef} onChange={handleImportModel} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2">
                     <Download className="w-3 h-3" /> Import File
                 </button>
             </div>
        </div>

        <div className="space-y-8">
            {renderModelList(filteredCustomModels, 'Custom Imported Models', <HardDrive className="w-4 h-4 text-blue-400" />)}
            {renderModelList(localVideoModels, 'Video Generation Models', <Box className="w-4 h-4 text-pink-400" />)}
            {renderModelList(localImageModels, 'Image Generation Models', <Box className="w-4 h-4 text-indigo-400" />)}
            
            {renderModelList(integrationNodes, 'Community Nodes & Integrations', <Puzzle className="w-4 h-4 text-green-400" />)}
            {renderModelList(motionModules, 'Motion Modules (AnimateDiff)', <Workflow className="w-4 h-4 text-orange-400" />)}

            {renderModelList(controlNetModels, 'ControlNet Adapters', <ScanLine className="w-4 h-4 text-emerald-400" />)}
            {renderModelList(loraModels, 'LoRA & Style Adapters', <Palette className="w-4 h-4 text-purple-400" />)}
            {renderModelList(lipSyncModels, 'Lip Sync & Face Animation', <Mic className="w-4 h-4 text-orange-400" />)}
            
            {renderModelList(inpaintingModels, 'Video Inpainting & Magic Quill Tools', <Brush className="w-4 h-4 text-rose-400" />)}
            
            {renderModelList(cgVfxModels, 'CG / VFX & 3D Models', <Cuboid className="w-4 h-4 text-cyan-400" />)}
        </div>
      </section>
    </div>
  );
};

export default Settings;
