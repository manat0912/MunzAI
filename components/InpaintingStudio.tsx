import React, { useState } from 'react';
import InpaintingCanvas from './InpaintingCanvas';
import { editImage } from '../services/geminiService';
import { AVAILABLE_MODELS } from '../services/modelRegistry';
import { Brush, Upload, Loader2, Wand2, AlertCircle, ChevronDown, Eraser, Scan } from 'lucide-react';

const InpaintingStudio: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maskBlob, setMaskBlob] = useState<Blob | null>(null);

  const [selectedModelId, setSelectedModelId] = useState<string>('imagen-3');
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSourceFile(e.target.files[0]);
      setResultImage(null);
      setMaskBlob(null);
    }
  };

  const handleGenerate = async () => {
    if (!sourceFile || !prompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      if (selectedModel.provider === 'Google') {
        const url = await editImage(sourceFile, prompt, negativePrompt, maskBlob);
        setResultImage(url);
      } else {
        // Simulation for Local Models
        await new Promise(resolve => setTimeout(resolve, 2500));
        if (selectedModel.isLocal) {
            throw new Error(`Local model '${selectedModel.name}' backend not detected. (Simulated mask sent: ${maskBlob ? 'Yes' : 'No'})`);
        } else {
            throw new Error(`${selectedModel.name} requires API configuration.`);
        }
      }
    } catch (e: any) {
      setError(e.message || "Edit failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left: Controls */}
        <div className="lg:col-span-1 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Brush className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Magic Edit</h2>
                        <p className="text-xs text-zinc-500">Advanced Inpainting</p>
                    </div>
                </div>
            </div>

            {/* Model Selector */}
             <div className="relative">
                <select 
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full appearance-none bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium py-3 pl-4 pr-10 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
                >
                    {AVAILABLE_MODELS.filter(m => m.capabilities.includes('image-to-image') || m.capabilities.includes('image-to-video')).map(m => (
                        <option key={m.id} value={m.id}>{m.name} {m.isLocal ? '(Local)' : ''}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>

            <div className="space-y-4 flex-1">
                {!sourceFile ? (
                    <div className="h-40 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all relative">
                         <Upload className="w-8 h-8 mb-2" />
                         <span className="text-sm">Upload Image to Edit</span>
                         <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                ) : (
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <div className="flex justify-between items-start">
                             <div>
                                <span className="text-xs text-emerald-400 font-medium">Source Loaded</span>
                                <div className="text-sm text-zinc-400 truncate mt-1 max-w-[150px]">{sourceFile.name}</div>
                             </div>
                             <button onClick={() => { setSourceFile(null); setResultImage(null); }} className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20">Remove</button>
                        </div>
                        {maskBlob && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
                                <Scan className="w-3 h-3" />
                                <span>Mask Active</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Edit Instruction / Prompt</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Turn the red car into a futuristic hovercraft, or remove the person in the background..."
                        className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Negative Prompt</label>
                    <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blur, distortion, artifacts..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!sourceFile || !prompt || isGenerating}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg
                    ${isGenerating ? 'bg-zinc-800 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'}`}
            >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                <span>{maskBlob ? 'Inpaint Masked Area' : 'Global Edit'}</span>
            </button>
            {error && (
                <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
            )}
        </div>

        {/* Center: Canvas / Preview */}
        <div className="lg:col-span-2 bg-black rounded-2xl border border-zinc-800 p-1 relative group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 to-zinc-950 -z-10" />
            
            {resultImage ? (
                 <div className="h-full w-full flex items-center justify-center relative">
                    <img src={resultImage} alt="Result" className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
                    <button 
                        onClick={() => setResultImage(null)} 
                        className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md border border-white/10 hover:bg-black/70 flex items-center gap-2"
                    >
                        <Eraser className="w-4 h-4" /> Continue Editing
                    </button>
                 </div>
            ) : sourceFile ? (
                <div className="h-full flex flex-col">
                    <div className="bg-zinc-900 border-b border-zinc-800 p-2 px-4 flex justify-between items-center">
                        <span className="text-xs text-zinc-400">Use Brush or Magic Wand to select areas to edit</span>
                        <div className="flex gap-2">
                             {/* Canvas Toolbar is inside InpaintingCanvas, but we could add external controls here if needed */}
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <InpaintingCanvas 
                            imageFile={sourceFile} 
                            onMaskComplete={(blob) => setMaskBlob(blob)} 
                        />
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                        <Brush className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-medium text-lg text-zinc-500">No Image Loaded</p>
                    <p className="text-sm mt-2">Upload an image to start using advanced inpainting tools</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default InpaintingStudio;