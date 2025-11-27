import React, { useState, useEffect, useRef } from 'react';
import { Cable, Power, Copy, RefreshCw, Download, CheckCircle, Activity, Terminal, AlertCircle, Layers, Monitor, Video, Image as ImageIcon, Box } from 'lucide-react';

const LocalPipeline: React.FC = () => {
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [port, setPort] = useState('3000');
  const [apiKey, setApiKey] = useState('mz_pipe_' + Math.random().toString(36).substr(2, 9));
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Simulate server activity logs
  useEffect(() => {
    if (!isServerRunning) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const actions = [
          'GET /api/v1/models',
          'POST /api/v1/generate/image [Adobe Photoshop]',
          'POST /api/v1/generate/video [After Effects]',
          'WS connection established: Unreal Engine 5',
          'GET /api/v1/status (Health Check)',
          'POST /api/v1/inpaint/mask [Blender Bridge]'
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const timestamp = new Date().toLocaleTimeString();
        addLog(`[${timestamp}] ${randomAction} - 200 OK`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isServerRunning]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-19), msg]); // Keep last 20 logs
  };

  const toggleServer = () => {
    if (isServerRunning) {
      addLog('Stopping Bridge Server...');
      setTimeout(() => {
        setIsServerRunning(false);
        addLog('Server Stopped.');
      }, 500);
    } else {
      addLog('Initializing MunzAI Bridge Server...');
      setTimeout(() => {
        setIsServerRunning(true);
        addLog(`Server listening on http://localhost:${port}`);
        addLog('Ready for external connections.');
      }, 1000);
    }
  };

  const regenerateKey = () => {
    setApiKey('mz_pipe_' + Math.random().toString(36).substr(2, 9));
    addLog('API Key regenerated.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add visual feedback toast here
  };

  const connectors = [
    { id: 'ae', name: 'Adobe After Effects', icon: Video, ext: '.jsx', desc: 'Direct layer-to-video generation & inpainting.' },
    { id: 'ps', name: 'Adobe Photoshop', icon: ImageIcon, ext: '.ccx', desc: 'Generative Fill & Text-to-Image panel.' },
    { id: 'ue5', name: 'Unreal Engine 5', icon: Box, ext: 'Plugin', desc: 'Real-time texture generation & skybox synthesis.' },
    { id: 'blender', name: 'Blender 4.0+', icon: Box, ext: '.zip', desc: 'Texture projection & AI render pass compositing.' },
    { id: 'resolve', name: 'Davinci Resolve', icon: Video, ext: '.lua', desc: 'Magic Mask & AI Color Grade scripts.' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left: Server Control & Config */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto">
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Cable className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Local Pipeline</h2>
              <p className="text-xs text-zinc-500">Bridge to External Apps</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Server Toggle */}
            <div className={`p-4 rounded-xl border transition-all ${isServerRunning ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950 border-zinc-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isServerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                  <span className={`font-bold ${isServerRunning ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {isServerRunning ? 'BRIDGE ONLINE' : 'BRIDGE OFFLINE'}
                  </span>
                </div>
                <button
                  onClick={toggleServer}
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${isServerRunning ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isServerRunning ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className="space-y-3">
                 <div>
                    <label className="text-xs text-zinc-500 font-medium uppercase">Local Port</label>
                    <input 
                        type="text" 
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        disabled={isServerRunning}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono mt-1 focus:border-blue-500 outline-none disabled:opacity-50"
                    />
                 </div>
              </div>
            </div>

            {/* Connection Details */}
            <div className="space-y-4">
               <div>
                  <label className="text-xs text-zinc-500 font-medium uppercase flex justify-between">
                      <span>API Endpoint</span>
                      <span className="text-[10px] text-zinc-600">For Plugin Config</span>
                  </label>
                  <div className="flex gap-2 mt-1">
                      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 font-mono truncate">
                          http://localhost:{port}/api/v1
                      </div>
                      <button onClick={() => copyToClipboard(`http://localhost:${port}/api/v1`)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                      </button>
                  </div>
               </div>

               <div>
                  <label className="text-xs text-zinc-500 font-medium uppercase flex justify-between">
                      <span>Pipeline Key</span>
                      <button onClick={regenerateKey} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
                  </label>
                  <div className="flex gap-2 mt-1">
                      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono truncate tracking-wide">
                          {apiKey}
                      </div>
                      <button onClick={() => copyToClipboard(apiKey)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                      </button>
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-2 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5" />
                      Use this key in your external app settings to authenticate with MunzAI Studio.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-black rounded-2xl border border-zinc-800 p-4 flex flex-col h-64 font-mono text-xs">
           <div className="flex items-center gap-2 text-zinc-500 mb-2 pb-2 border-b border-zinc-900">
               <Terminal className="w-4 h-4" />
               <span className="font-bold">Live Activity Log</span>
           </div>
           <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
               {logs.length === 0 ? (
                   <span className="text-zinc-700 italic">Server idle. Waiting for logs...</span>
               ) : (
                   logs.map((log, i) => (
                       <div key={i} className="text-zinc-400">
                           <span className="text-blue-500 mr-2">➜</span>
                           {log}
                       </div>
                   ))
               )}
               <div ref={logEndRef} />
           </div>
        </div>
      </div>

      {/* Right: Connectors & Plugins */}
      <div className="lg:col-span-2 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 overflow-y-auto">
         <div className="flex items-center gap-3 mb-6">
            <Layers className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Application Connectors</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {connectors.map((app) => (
                 <div key={app.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group">
                     <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all">
                                 <app.icon className="w-5 h-5" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-zinc-200">{app.name}</h3>
                                 <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{app.ext}</span>
                             </div>
                         </div>
                         <button className="text-zinc-500 hover:text-white transition-colors" title="Download Plugin">
                             <Download className="w-5 h-5" />
                         </button>
                     </div>
                     <p className="text-xs text-zinc-500 mb-4 h-8">{app.desc}</p>
                     
                     <div className="flex items-center gap-2 pt-3 border-t border-zinc-900">
                         <div className={`w-2 h-2 rounded-full ${isServerRunning ? 'bg-emerald-500' : 'bg-red-500'}`} />
                         <span className="text-xs text-zinc-600">
                             {isServerRunning ? 'Ready to connect' : 'Bridge server required'}
                         </span>
                     </div>
                 </div>
             ))}
         </div>

         <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
             <div className="flex items-center gap-2 mb-2">
                 <Monitor className="w-5 h-5 text-blue-400" />
                 <h3 className="font-bold text-blue-100 text-sm">How to use</h3>
             </div>
             <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside ml-1">
                 <li>Start the <strong>Bridge Server</strong> on the left panel.</li>
                 <li>Download and install the connector plugin for your target application.</li>
                 <li>Open the plugin settings in the external app (e.g., Window &gt; Extensions in AE).</li>
                 <li>Enter the <strong>API Endpoint</strong> and <strong>Pipeline Key</strong> shown above.</li>
                 <li>The local app will now offload AI generation tasks to MunzAI Studio's backend.</li>
             </ol>
         </div>
      </div>
    </div>
  );
};

export default LocalPipeline;