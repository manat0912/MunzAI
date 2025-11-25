
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
  | 'Kling'
  | 'Runway'
  | 'Luma'
  | 'Sora'
  | 'Wan';

export type ModelCapability = 
  | 'text-to-video' 
  | 'image-to-video' 
  | 'video-to-video' 
  | 'text-to-image' 
  | 'image-to-image'
  | 'control-adapter'
  | 'lip-sync'
  | 'lora'
  | 'motion-brush'; // New capability

export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  capabilities: ModelCapability[];
  description: string;
  isLocal?: boolean;
  downloadUrl?: string; // For local weights
  family?: 'sdxl' | 'flux' | 'sd15' | 'sd3' | 'wan' | 'svd' | 'hunyuan' | 'other'; // Architecture family for LoRA compatibility
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
    kling?: string;
    runway?: string;
    luma?: string;
    wan?: string;
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
