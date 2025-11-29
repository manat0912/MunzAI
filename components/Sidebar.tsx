
import React, { useState, useEffect } from 'react';
import { Video, Image, Brush, Settings, Command, Cable } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [vramUsage, setVramUsage] = useState(0);
  const totalVram = 16; // 16GB Standard High-End

  useEffect(() => {
    // Simulate VRAM fluctuation
    const interval = setInterval(() => {
      setVramUsage(prev => {
        // Random fluctuation between 2.4GB (idle) and 4.0GB
        const target = 2.4 + Math.random() * 1.5;
        // Smooth interpolation could be done here, but simple set is fine for UI demo
        return target;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'video', label: 'Video Studio', icon: Video, desc: 'Veo / Wan2.1' },
    { id: 'image', label: 'Image Studio', icon: Image, desc: 'Imagen / SDXL' },
    { id: 'inpainting', label: 'Magic Edit', icon: Brush, desc: 'Generative Fill' },
    { id: 'local-pipeline', label: 'Local App Pipeline', icon: Cable, desc: 'AE / UE5 / Blender' },
  ];

  const usagePercent = (vramUsage / totalVram) * 100;

  return (
    <div className="w-20 lg:w-72 h-screen bg-[#09090b] border-r border-zinc-800 flex flex-col justify-between fixed left-0 top-0 z-50 transition-all duration-300">
      <div>
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-800">
          {/* App Icon: Movie Camera in Green Circle */}
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
            <Video className="text-white w-4 h-4 fill-current" />
          </div>
          <span className="ml-3 font-bold text-xl tracking-tight hidden lg:block text-zinc-100">
            Munz<span className="text-emerald-500">AI</span> Studio
          </span>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-zinc-800 text-white shadow-lg shadow-black/40' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <div className="ml-4 text-left hidden lg:block">
                  <div className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</div>
                  <div className="text-xs text-zinc-600 font-medium">{item.desc}</div>
                </div>
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full hidden lg:block" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-800 space-y-2">
        <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group
                ${activeTab === 'settings' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
        >
            <Settings className={`w-6 h-6 flex-shrink-0 ${activeTab === 'settings' ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
            <div className="ml-4 text-left hidden lg:block font-medium">Settings</div>
        </button>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hidden lg:block space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400">System Ready</span>
          </div>
          
          <div className="space-y-1.5">
             <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                <span>VRAM Usage</span>
                <span>{vramUsage.toFixed(1)}GB</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
                    style={{ width: `${usagePercent}%` }}
                />
             </div>
             <div className="flex justify-between text-[10px] text-zinc-600">
                <span>Idle</span>
                <span>{totalVram}GB Max</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
