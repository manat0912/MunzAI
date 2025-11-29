
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface GenerationResult {
  url: string;
  type: MediaType;
  prompt: string;
  timestamp: number;
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  STANDARD = '4:3',
  CINEMATIC = '21:9'
}

export interface VideoConfig {
  resolution: '480p' | '560p' | '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
  negativePrompt?: string;
  category: 'Cinematic' | 'Artistic' | 'Vintage' | 'Custom';
}

export interface AnimationSettings {
  cameraZoom: number;
  cameraPan: 'None' | 'Left' | 'Right' | 'Up' | 'Down';
  cameraRotation: number;
  subjectAction: string;
  trackingEnabled: boolean;
}

// New Types for Multi-Model Support

export type ModelProvider = 
  | 'Google' 
  | 'OpenAI' 
  | 'Anthropic' 
  | 'Microsoft' 
  | 'Local' 
  | 'Hedra' 
  | 'Elai' 
  | 'Remaker'
  | 'Mango'
  | 'Kling'
  | 'Runway'
  | 'Luma'
  | 'Sora'
  | 'Wan'
  | 'StabilityAI'
  | 'Nvidia'      
  | 'Mochi'       
  | 'Hotshot'     
  | 'SkyReels'    
  | 'Pika'        
  | 'LetsEnhance' 
  | 'ModelScope'
  | 'Rhymes'      
  | 'CogVideo'    
  | 'StepFun'     
  | 'Pyramid'     
  | 'HPC-AI'
  | 'Recraft'     
  | 'Ideogram'    
  | 'BlackForest' 
  | 'Playground'  
  | 'DeepFloyd'
  | 'Mootion'     
  | 'DeepAI'
  | 'Meta'        // New
  | 'VastAI'      
  | 'TensorDock'  
  | 'RunPod'      
  | 'Thunder'     
  | 'Lambda'      
  | 'AWS'         
  | 'GCP'         
  | 'Paperspace'  
  | 'Jarvis'      
  | 'Genesis'     
  | 'Salad'       
  | 'SkyPilot';   

export type ModelCapability = 
  | 'text-to-video' 
  | 'image-to-video' 
  | 'video-to-video' 
  | 'text-to-image' 
  | 'image-to-image'
  | 'control-adapter'
  | 'lip-sync'
  | 'lora'
  | 'motion-brush'
  | 'motion-module' 
  | 'upscaler'      
  | 'node'
  | 'video-inpainting' 
  | 'magic-quill'
  | 'cg-vfx'            
  | 'hardware-motion'
  | 'segmentation'      // New
  | 'object-tracking';  // New

export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  capabilities: ModelCapability[];
  description: string;
  isLocal?: boolean;
  downloadUrl?: string; // For local weights repo
  safeTensorUrl?: string; // Direct link to .safetensors file
  family?: 'sdxl' | 'flux' | 'sd15' | 'sd3' | 'wan' | 'svd' | 'hunyuan' | 'cosmos' | 'mochi' | 'animatediff' | 'allegro' | 'cogvideox' | 'pixart' | 'hardware' | 'other'; 
}

export interface AppSettings {
  activeProvider: ModelProvider;
  localEndpoint: string;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    microsoft?: string;
    hedra?: string;
    elai?: string;
    remaker?: string;
    mango?: string;
    kling?: string;
    runway?: string;
    luma?: string;
    wan?: string;
    stability?: string;
    nvidia?: string;      
    pika?: string;        
    letsenhance?: string; 
    recraft?: string;     
    ideogram?: string;    
    bfl?: string;         
    playground?: string;
    mootion?: string;     
    deepai?: string;      
    // GPU Rental Keys
    vastai?: string;
    tensordock?: string;
    runpod?: string;
    thundercompute?: string;
    lambdalabs?: string;
    aws?: string;
    gcp?: string;
    paperspace?: string;
    jarvislabs?: string;
    genesiscloud?: string;
    salad?: string;
    skypilot?: string;
    colab?: string;
  };
}

// ControlNet Types
export type ControlNetType = 'Canny' | 'Depth' | 'OpenPose' | 'SoftEdge' | 'LineArt';

export interface ControlNetSettings {
  enabled: boolean;
  type: ControlNetType;
  modelId: string;
  strength: number; // 0.0 to 2.0
  preprocess: boolean;
}

// LoRA Types
export interface LoraConfig {
  modelId: string;
  strength: number; // 0.0 to 2.0 (usually)
}

// Pipeline / Node Workflow Types
export type PipelineStrategy = 'Standard' | 'AnimateDiff' | 'CosmosEnhance' | 'CustomChain';

export interface PipelineStep {
  id: string;
  name: string;
  type: 'model' | 'adapter' | 'upscaler' | 'interpolator';
  selectedId: string | null;
  config?: any;
}

export interface WorkflowPreset {
  id: string;
  name: string;
  strategy: PipelineStrategy;
  steps: PipelineStep[];
}
