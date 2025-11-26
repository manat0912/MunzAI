
import React, { useState, useEffect } from 'react';
import { generateImage, editImage } from '../services/geminiService';
import { AVAILABLE_MODELS } from '../services/modelRegistry';
import { ControlNetSettings, ControlNetType, LoraConfig, AIModel } from '../types';
import { Loader2, Image as ImageIcon, Download, Wand2, AlertCircle, ChevronDown, ScanLine, Fingerprint, Layers, Activity, Feather, PenTool, Palette, Plus, X, Type } from 'lucide-react';

const ImageStudio: React.FC = () => {
  const [generationMode, setGenerationMode] = useState<'text-to-image' | 'image-to-image'>('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [error, setError] = useState<string | null>(null);

  const [allModels, setAllModels] = useState<AIModel[]>(AVAILABLE_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>('imagen-3');
  
  // Load Custom Models
  useEffect(() => {
     const savedCustom = localStorage.getItem('munzai_custom_models');
     if (savedCustom) {
         try {
             const customModels: AIModel[] = JSON.parse(savedCustom);
             setAllModels([...AVAILABLE_MODELS, ...customModels]);
         } catch (e) {
             console.error("Failed to load custom models");
         }
     }
  }, []);

  const selectedModel = allModels.find(m => m.id === selectedModelId) || allModels[0];

  // ControlNet State
  const [controlNet, setControlNet] = useState<ControlNetSettings>({
    enabled: false,
    type: 'Canny',
    modelId: 'cn-canny-sdxl',
    strength: 1.0,
    preprocess: true
  });

  // LoRA State
  const [activeLoras, setActiveLoras] = useState<LoraConfig[]>([]);
  const [showLoraSelector, setShowLoraSelector] = useState(false);
  
  // Available LoRAs filtered by current model family
  const compatibleLoras = allModels.filter(m => 
      m.capabilities.includes('lora') && 
      selectedModel.family && 
      m.family === selectedModel.family
  );

  // Persistence check for installed models (visual feedback only for this demo)
  const [installedModels, setInstalledModels] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const saved = localStorage.getItem('munzai_installed_models');
    if (saved) setInstalledModels(JSON.parse(saved));
  }, []);

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setSourcePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      
      // Auto-enable ControlNet if a local model is selected
      if(selectedModel.isLocal) {
        setControlNet(prev => ({...prev, enabled: true}));
      }
    }
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
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      if (selectedModel.provider === 'Google') {
        let url = '';
        if (generationMode === 'image-to-image' && sourceImage) {
            url = await editImage(sourceImage, prompt, negativePrompt);
        } else {
            url = await generateImage(prompt, aspectRatio, negativePrompt);
        }
        setResultImage(url);
      } else {
        // Mock simulation for Local/Other providers
        await new Promise(r => setTimeout(r, 2000));
        
        // Log simulation details
        const loraInfo = activeLoras.length > 0 ? ` + ${activeLoras.length} LoRAs` : '';
        const cnInfo = (controlNet.enabled && generationMode === 'image-to-image') 
            ? ` + ControlNet [${controlNet.type} @ ${controlNet.strength}]` 
            : '';

        if (activeLoras.length > 0) {
            console.log(`Applying LoRAs: ${activeLoras.map(l => `${l.modelId} (${l.strength})`).join(', ')}`);
        }
        if (controlNet.enabled) {
            console.log(`Applying ControlNet: ${controlNet.type} (Strength: ${controlNet.strength})`);
        }

        if(selectedModel.isLocal) {
            throw new Error(`Local backend not connected. (Simulated Request: ${selectedModel.name}${loraInfo}${cnInfo})`);
        } else {
            throw new Error(`${selectedModel.name} requires API configuration.`);
        }
      }
    } catch (e: any) {
      setError(e.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSource = () => {
    setSourceImage(null);
    setSourcePreview(null);
    setControlNet(prev => ({...prev, enabled: false}));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Controls */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                    <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Image Studio</h2>
                </div>
            </div>
            
            {/* Model Selector */}
            <div className="relative">
                <select 
                    value={selectedModelId}
                    onChange={(e) => {
                        setSelectedModelId(e.target.value);
                        setActiveLoras([]); // Reset LoRAs on model change
                    }}
                    className="appearance-none bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium py-2 pl-3 pr-8 rounded-lg outline-none focus:border-pink-500 cursor-pointer"
                >
                    {allModels.filter(m => m.capabilities.includes('text-to-image') || m.capabilities.includes('image-to-image')).map(m => (
                        <option key={m.id} value={m.id}>{m.name} {m.isLocal ? '(Local)' : ''}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
        </div>

        <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${selectedModel.isLocal ? 'bg-pink-500' : 'bg-emerald-500'}`} />
             <p className="text-xs text-zinc-500">{selectedModel.description}</p>
        </div>

        {/* Generation Mode Toggle */}
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex">
            <button
                onClick={() => setGenerationMode('text-to-image')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    generationMode === 'text-to-image'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
                <Type className="w-4 h-4" />
                Text-to-Image
            </button>
            <button
                onClick={() => setGenerationMode('image-to-image')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    generationMode === 'image-to-image'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
                <ImageIcon className="w-4 h-4" />
                Image-to-Image
            </button>
        </div>

        <div className="space-y-4">
           {/* Source Image Input - Only visible in Image-to-Image mode */}
          {generationMode === 'image-to-image' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                     <label className="text-sm font-medium text-zinc-300">
                        {controlNet.enabled ? `Source for ${controlNet.type}` : 'Source Image / Structure Reference'}
                     </label>
                     {sourceImage && <button onClick={clearSource} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                </div>
                
                <div className={`relative h-40 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center text-center overflow-hidden
                    ${sourceImage ? (controlNet.enabled ? 'border-emerald-500/50 bg-black' : 'border-pink-500/30 bg-black') : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}>
                    
                    {sourcePreview ? (
                       <>
                           <img src={sourcePreview} className="h-full w-full object-contain" alt="Source" />
                           {controlNet.enabled && (
                               <div className="absolute inset-0 pointer-events-none border-4 border-emerald-500/20 rounded-lg">
                                   <div className="absolute top-2 left-2 bg-emerald-500/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                                       CN: {controlNet.type.toUpperCase()}
                                   </div>
                               </div>
                           )}
                       </>
                    ) : (
                        <>
                            <ImageIcon className="w-8 h-8 text-zinc-600 mb-2" />
                            <span className="text-xs text-zinc-500 px-4">Upload for Img2Img or ControlNet</span>
                        </>
                    )}
                    <input type="file" accept="image/*" onChange={handleSourceUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
          )}

          {/* LoRA & Styles Adapter Section (Visible for local models) */}
          {selectedModel.isLocal && compatibleLoras.length > 0 && (
             <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-400">
                          <Palette className="w-4 h-4" />
                          <span className="text-sm font-bold">LoRA Adapters</span>
                      </div>
                      <div className="relative">
                          <button 
                             onClick={() => setShowLoraSelector(!showLoraSelector)}
                             className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                             <Plus className="w-3 h-3" /> Add LoRA
                          </button>
                          
                          {showLoraSelector && (
                              <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                                  {compatibleLoras.map(lora => (
                                      <button
                                          key={lora.id}
                                          onClick={() => addLora(lora.id)}
                                          disabled={!!activeLoras.find(al => al.modelId === lora.id)}
                                          className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between border-b border-zinc-800 last:border-0"
                                      >
                                          <span>{lora.name}</span>
                                          {installedModels[lora.id] && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
                  
                  {activeLoras.length > 0 ? (
                      <div className="space-y-3">
                          {activeLoras.map(config => {
                              const loraModel = allModels.find(m => m.id === config.modelId);
                              return (
                                  <div key={config.modelId} className="bg-zinc-900 rounded-lg p-2 border border-zinc-800 text-xs">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-medium text-zinc-300">{loraModel?.name}</span>
                                          <button onClick={() => removeLora(config.modelId)} className="text-zinc-500 hover:text-red-400">
                                              <X className="w-3 h-3" />
                                          </button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <input 
                                              type="range" min="0" max="2" step="0.1" 
                                              value={config.strength}
                                              onChange={(e) => updateLoraStrength(config.modelId, parseFloat(e.target.value))}
                                              className="flex-1 h-1 bg-zinc-700 rounded-lg accent-purple-500 cursor-pointer"
                                          />
                                          <span className="w-8 text-right text-zinc-500">{config.strength.toFixed(1)}</span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-2 text-xs text-zinc-600 italic">
                          No adapters active
                      </div>
                  )}
             </div>
          )}

          {/* ControlNet Panel (Only visible if source image is present AND in image-to-image mode) */}
          {generationMode === 'image-to-image' && sourceImage && (
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400">
                          <ScanLine className="w-4 h-4" />
                          <span className="text-sm font-bold">ControlNet</span>
                      </div>
                      <button 
                        onClick={() => setControlNet({...controlNet, enabled: !controlNet.enabled})}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${controlNet.enabled ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${controlNet.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                  </div>

                  {controlNet.enabled && (
                      <div className="space-y-4 pt-2 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2">
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {['Canny', 'Depth', 'OpenPose', 'SoftEdge', 'LineArt'].map((type) => (
                                    <button 
                                        key={type}
                                        onClick={() => setControlNet({...controlNet, type: type as any, modelId: `cn-${type.toLowerCase()}-sdxl`})}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs ${controlNet.type === type ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800/80'}`}
                                    >
                                        {type === 'Canny' && <Fingerprint className="w-4 h-4" />}
                                        {type === 'Depth' && <Layers className="w-4 h-4" />}
                                        {type === 'OpenPose' && <Activity className="w-4 h-4" />}
                                        {type === 'SoftEdge' && <Feather className="w-4 h-4" />}
                                        {type === 'LineArt' && <PenTool className="w-4 h-4" />}
                                        <span>{type}</span>
                                    </button>
                                ))}
                          </div>

                          <div className="space-y-2">
                              <div className="flex justify-between text-xs text-zinc-400">
                                  <span>Control Strength</span>
                                  <span>{controlNet.strength.toFixed(2)}</span>
                              </div>
                              <input 
                                type="range" min="0" max="2" step="0.05"
                                value={controlNet.strength}
                                onChange={(e) => setControlNet({...controlNet, strength: parseFloat(e.target.value)})}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                          </div>
                      </div>
                  )}
              </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image..."
              className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Negative Prompt</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blur, low quality, distortion..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          
           <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
            <div className="grid grid-cols-4 gap-2">
              {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all
                    ${aspectRatio === ratio 
                      ? 'bg-pink-500/10 border-pink-500/50 text-pink-200' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className={`mt-auto w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
            ${isGenerating 
              ? 'bg-zinc-800 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-500/20'
            }`}
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
          <span>
              {generationMode === 'image-to-image' && controlNet.enabled && sourceImage 
                ? `Generate with ${controlNet.type}` 
                : (generationMode === 'image-to-image' && sourceImage ? 'Transform Image' : 'Generate Image')
              }
          </span>
        </button>
         {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Output */}
      <div className="bg-black rounded-2xl border border-zinc-800 p-2 flex items-center justify-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 to-zinc-950 -z-10" />
         {resultImage ? (
           <div className="relative w-full h-full flex items-center justify-center">
             <img src={resultImage} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
             <a 
               href={resultImage} 
               download={`munzai-${Date.now()}.png`}
               className="absolute bottom-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
             >
               <Download className="w-6 h-6" />
             </a>
           </div>
         ) : (
           <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <ImageIcon className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-zinc-500 font-medium">Ready to create</h3>
              <p className="text-zinc-600 text-xs mt-2">Selected: {selectedModel.name}</p>
              {activeLoras.length > 0 && <p className="text-purple-500 text-xs mt-1">{activeLoras.length} LoRAs Active</p>}
              {controlNet.enabled && <p className="text-emerald-500 text-xs mt-1">ControlNet: {controlNet.type}</p>}
           </div>
         )}
      </div>
    </div>
  );
};

export default ImageStudio;
