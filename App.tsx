import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import VideoStudio from './components/VideoStudio';
import ImageStudio from './components/ImageStudio';
import InpaintingStudio from './components/InpaintingStudio';
import LocalPipeline from './components/LocalPipeline';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  const renderContent = () => {
    switch (activeTab) {
      case 'video':
        return <VideoStudio />;
      case 'image':
        return <ImageStudio />;
      case 'inpainting':
        return <InpaintingStudio />;
      case 'local-pipeline':
        return <LocalPipeline />;
      case 'settings':
        return <Settings />;
      default:
        return <VideoStudio />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-indigo-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="lg:pl-72 pt-16 lg:pt-0 h-screen overflow-hidden">
        {/* Top Header Mobile/Desktop */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-md z-40 sticky top-0 lg:hidden">
           <span className="font-bold text-xl">MunzAI</span>
        </header>

        {/* Workspace */}
        <div className="h-full p-4 lg:p-6 overflow-hidden">
           {renderContent()}
        </div>
      </main>

      {/* Global Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]" />
      </div>
    </div>
  );
};

export default App;