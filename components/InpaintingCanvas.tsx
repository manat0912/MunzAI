import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Pen, Undo, Redo, Trash2, Wand2, ZoomIn, ZoomOut, Move, PaintBucket, ArrowLeftRight, Eye, EyeOff, Loader2 } from 'lucide-react';

interface InpaintingCanvasProps {
  imageFile?: File;
  imageUrl?: string;
  onMaskComplete: (maskBlob: Blob | null) => void;
}

type Tool = 'brush' | 'eraser' | 'magic' | 'pan';

const InpaintingCanvas: React.FC<InpaintingCanvasProps> = ({ imageFile, imageUrl, onMaskComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Tools & State
  const [tool, setTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState(30);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [showMagicInput, setShowMagicInput] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [maskVisible, setMaskVisible] = useState(true);
  const [clickPos, setClickPos] = useState<{x: number, y: number} | null>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Load Image
  useEffect(() => {
    if (imageUrl) {
        setImageSrc(imageUrl);
        return;
    }
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => setImageSrc(e.target?.result as string);
        reader.readAsDataURL(imageFile);
    }
  }, [imageFile, imageUrl]);

  // Initialize Canvas
  useEffect(() => {
    if (imageSrc && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Save initial blank state
            const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([initialData]);
            setHistoryStep(0);
        }
        // Reset View
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
    }
  }, [imageSrc]);

  const exportMask = useCallback(() => {
      if (!canvasRef.current) return;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tCtx = tempCanvas.getContext('2d');
      
      if (tCtx) {
          // Black Background
          tCtx.fillStyle = 'black';
          tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw Mask as White
          tCtx.drawImage(canvasRef.current, 0, 0);
          tCtx.globalCompositeOperation = 'source-in';
          tCtx.fillStyle = 'white';
          tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          tempCanvas.toBlob((blob) => {
              onMaskComplete(blob);
          });
      }
  }, [onMaskComplete]);

  const saveState = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(data);
      
      // Limit history size to 20 steps
      if (newHistory.length > 20) newHistory.shift();
      
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
      exportMask();
  }, [history, historyStep, exportMask]);

  const undo = useCallback(() => {
      if (historyStep > 0) {
          const newStep = historyStep - 1;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx && history[newStep]) {
              ctx.putImageData(history[newStep], 0, 0);
              setHistoryStep(newStep);
              exportMask();
          }
      }
  }, [history, historyStep, exportMask]);

  const redo = useCallback(() => {
      if (historyStep < history.length - 1) {
          const newStep = historyStep + 1;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx && history[newStep]) {
              ctx.putImageData(history[newStep], 0, 0);
              setHistoryStep(newStep);
              exportMask();
          }
      }
  }, [history, historyStep, exportMask]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent undo/redo if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);


  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate position based on current scale
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getClientCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Returns coordinates relative to the visible container (for UI overlay positioning)
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'pan') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
    }
    
    // Magic Wand Click Logic
    if (tool === 'magic') {
        if (isProcessing) return;
        const { x, y } = getCoordinates(e);
        const clientCoords = getClientCoordinates(e);
        
        // Show visual feedback at click location
        setClickPos(clientCoords);
        setTimeout(() => setClickPos(null), 800);

        performMagicSelect(x, y);
        return;
    }

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    // Draw initial dot
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        draw(e);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'pan') {
        if (isPanning) {
            setPan({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            });
        }
        return;
    }

    if (!isDrawing || !canvasRef.current || tool === 'magic' || isProcessing) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255, 50, 50, 0.5)'; 
    }

    ctx.beginPath();
    ctx.arc(x, y, (brushSize / zoom) / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleMouseUp = () => {
    if (tool === 'pan') {
        setIsPanning(false);
        return;
    }
    if (isDrawing) {
        setIsDrawing(false);
        saveState();
    }
  };

  const clearMask = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        saveState();
    }
  };

  const fillMask = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        saveState();
    }
  };

  const invertMask = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
          // This clever trick inverts the mask using composition
          ctx.globalCompositeOperation = 'source-out';
          ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          // Reset
          ctx.globalCompositeOperation = 'source-over';
          saveState();
      }
  };

  // Helper to draw organic shapes (not just perfect circles)
  const drawOrganicBlob = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
      const vertexCount = 12;
      ctx.beginPath();
      for (let i = 0; i <= vertexCount; i++) {
          const angle = (i / vertexCount) * Math.PI * 2;
          // Vary the radius to create an organic, non-geometric shape
          const r = radius + (Math.random() - 0.5) * (radius * 0.4); 
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
  };

  const performMagicSelect = (targetX?: number, targetY?: number) => {
     setShowMagicInput(false);
     setIsProcessing(true);
     
     // Simulate AI Inference delay
     setTimeout(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx && canvasRef.current) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
            
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            
            // Use provided coordinates or center
            const cx = targetX ?? w/2;
            const cy = targetY ?? h/2;
            
            // Size depends on whether it's a specific click (smaller/more precise) or global prompt (larger)
            const baseSize = targetX ? Math.min(w, h) / 6 : Math.min(w, h) / 4;
            
            drawOrganicBlob(ctx, cx, cy, baseSize);
            saveState();
        }
        setIsProcessing(false);
     }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
      {/* Granular Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-2 gap-2 bg-zinc-900 border-b border-zinc-800">
        
        {/* Left: Tools */}
        <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-lg border border-zinc-800">
             <button 
                onClick={() => setTool('brush')}
                className={`p-2 rounded-md transition-colors ${tool === 'brush' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                title="Brush Tool"
             >
                 <Pen className="w-4 h-4" />
             </button>
             <button 
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                title="Eraser Tool"
             >
                 <Eraser className="w-4 h-4" />
             </button>
             <button 
                onClick={fillMask}
                className="p-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                title="Fill Mask"
             >
                 <PaintBucket className="w-4 h-4" />
             </button>
             <button 
                onClick={invertMask}
                className="p-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                title="Invert Mask"
             >
                 <ArrowLeftRight className="w-4 h-4" />
             </button>
             <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
             <button 
                onClick={() => setTool('pan')}
                className={`p-2 rounded-md transition-colors ${tool === 'pan' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                title="Pan/Move"
             >
                 <Move className="w-4 h-4" />
             </button>
             <button 
                onClick={() => { setTool('magic'); setShowMagicInput(!showMagicInput); }}
                className={`p-2 rounded-md transition-colors flex items-center gap-2 ${tool === 'magic' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                title="Magic Select (Text-to-Mask)"
             >
                 <Wand2 className="w-4 h-4" />
             </button>
        </div>

        {/* Center: Brush Adjustments */}
        <div className="flex items-center gap-3 bg-zinc-950/50 p-1.5 rounded-lg border border-zinc-800 flex-1 justify-center min-w-[150px]">
            {tool !== 'magic' && tool !== 'pan' && (
                <div className="flex items-center gap-2 w-full max-w-[200px]">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase w-8 text-right">Size {brushSize}</span>
                    <input 
                        type="range" 
                        min="5" 
                        max="150" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="flex-1 accent-indigo-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}
            {tool === 'magic' && (
                <span className="text-xs text-pink-400 font-bold animate-pulse flex items-center gap-2">
                    <span>Click object to select</span>
                    <span className="w-1 h-1 rounded-full bg-pink-400" />
                    <span>or type prompt</span>
                </span>
            )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-lg border border-zinc-800">
             <button 
                onClick={() => setMaskVisible(!maskVisible)} 
                className={`p-2 rounded-md transition-colors ${!maskVisible ? 'bg-zinc-800 text-zinc-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                title={maskVisible ? "Hide Mask" : "Show Mask"}
             >
                 {maskVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
             </button>
             <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
             <button onClick={undo} disabled={historyStep <= 0} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 disabled:opacity-30 transition-colors" title="Undo (Ctrl+Z)">
                 <Undo className="w-4 h-4" />
             </button>
             <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 disabled:opacity-30 transition-colors" title="Redo (Ctrl+Y)">
                 <Redo className="w-4 h-4" />
             </button>
             <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
             <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 transition-colors" title="Zoom In">
                 <ZoomIn className="w-4 h-4" />
             </button>
             <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 transition-colors" title="Zoom Out">
                 <ZoomOut className="w-4 h-4" />
             </button>
             <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
             <button onClick={clearMask} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-md text-zinc-400 transition-colors" title="Clear All">
                 <Trash2 className="w-4 h-4" />
             </button>
        </div>
      </div>

      {/* Magic Input Overlay */}
      {showMagicInput && tool === 'magic' && (
          <div className="bg-zinc-900/90 backdrop-blur-sm p-3 border-b border-zinc-800 flex gap-2 animate-in slide-in-from-top-2 absolute w-full z-20 top-[60px]">
              <div className="flex-1 relative">
                <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                <input 
                    type="text" 
                    autoFocus
                    value={magicPrompt} 
                    onChange={(e) => setMagicPrompt(e.target.value)}
                    placeholder="Describe object (e.g. 'Red car'). Click Auto-Select or click on image."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && performMagicSelect()}
                />
              </div>
              <button 
                onClick={() => performMagicSelect()}
                disabled={isProcessing}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50"
              >
                  {isProcessing ? 'Thinking...' : 'Auto-Select'}
              </button>
          </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 relative bg-[#18181b] flex items-center justify-center overflow-hidden cursor-crosshair" ref={containerRef}>
        <div 
            className="transition-transform duration-75 ease-out relative"
            style={{ 
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: tool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : (tool === 'magic' ? 'crosshair' : 'none')
            }}
        >
            {imageSrc ? (
                <div className="relative shadow-2xl bg-black">
                    <img 
                        src={imageSrc} 
                        alt="Reference" 
                        className="max-w-none pointer-events-none opacity-80"
                        style={{ display: 'block' }} 
                    />
                    
                    {/* Drawing Layer */}
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onMouseMove={draw}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${maskVisible ? 'opacity-100' : 'opacity-20'}`}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-zinc-700 select-none">
                    <Move className="w-12 h-12 mb-2 opacity-20" />
                    <span className="text-sm">Load a video frame</span>
                </div>
            )}
        </div>
        
        {/* Click Ripple Effect */}
        {clickPos && (
            <div 
                className="absolute w-8 h-8 rounded-full border-2 border-pink-500 animate-ping pointer-events-none z-40"
                style={{ 
                    left: clickPos.x - 16, 
                    top: clickPos.y - 16,
                }} 
            />
        )}
        
        {/* Processing Overlay */}
        {isProcessing && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-3" />
                <span className="text-white font-bold tracking-wider">SEGMENTING OBJECT...</span>
                <span className="text-xs text-zinc-400 mt-1">Analyzing features & prompt</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default InpaintingCanvas;