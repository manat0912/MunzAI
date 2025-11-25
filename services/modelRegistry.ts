
import { AIModel } from '../types';

export const AVAILABLE_MODELS: AIModel[] = [
  // --- CLOUD MODELS (GOOGLE) ---
  {
    id: 'veo-3.1',
    name: 'Google Veo 3.1',
    provider: 'Google',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'State-of-the-art cinematic video generation (Cloud).',
    family: 'other'
  },
  {
    id: 'veo-2-legacy',
    name: 'Google Veo 2 (Legacy)',
    provider: 'Google',
    capabilities: ['text-to-video'],
    description: 'Previous generation cinematic video model.',
    family: 'other'
  },
  {
    id: 'imagen-3',
    name: 'Google Imagen 3 Pro',
    provider: 'Google',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'High-fidelity image generation with superior photorealism.',
    family: 'other'
  },

  // --- STABILITY AI (API) ---
  {
    id: 'sd3-medium-api',
    name: 'Stable Diffusion 3 (API)',
    provider: 'StabilityAI',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Next-gen text-to-image model via Stability AI Cloud.',
    isLocal: false,
    family: 'sd3'
  },
  {
    id: 'svd-xt-api',
    name: 'Stable Video Diffusion XT (API)',
    provider: 'StabilityAI',
    capabilities: ['image-to-video'],
    description: 'High quality image-to-video generation via Stability AI Cloud.',
    isLocal: false,
    family: 'svd'
  },

  // --- OPENAI (SORA) ---
  {
    id: 'sora-v1',
    name: 'Sora 1.0 (OpenAI)',
    provider: 'Sora',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Highly coherent realistic scene generation.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'sora-v2-turbo',
    name: 'Sora 2.0 Turbo (OpenAI)',
    provider: 'Sora',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Next-gen fast inference Sora model.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    capabilities: ['text-to-image', 'text-to-video'],
    description: 'Multimodal flagship model from OpenAI.',
    family: 'other'
  },

  // --- RUNWAY AI ---
  {
    id: 'runway-gen3-alpha',
    name: 'Runway Gen-3 Alpha',
    provider: 'Runway',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video', 'motion-brush'],
    description: 'Photorealistic video generation with precise control.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'runway-gen2',
    name: 'Runway Gen-2',
    provider: 'Runway',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Standard model for stylized video creation.',
    isLocal: false,
    family: 'other'
  },

  // --- LUMA LABS ---
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    provider: 'Luma',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'High-quality, physics-aware video generation.',
    isLocal: false,
    family: 'other'
  },

  // --- KLING AI ---
  {
    id: 'kling-1.5-pro',
    name: 'Kling 1.5 Pro',
    provider: 'Kling',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Professional grade high-resolution video generation.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'kling-1.5-standard',
    name: 'Kling 1.5 Standard',
    provider: 'Kling',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Balanced performance and quality.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'kling-1.0',
    name: 'Kling 1.0',
    provider: 'Kling',
    capabilities: ['text-to-video'],
    description: 'Legacy Kling model.',
    isLocal: false,
    family: 'other'
  },

  // --- WAN MODELS (API & CLOSED) ---
  {
    id: 'wan-2.5-preview',
    name: 'Wan 2.5 Preview',
    provider: 'Wan',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Next generation Wan architecture.',
    isLocal: false,
    family: 'wan'
  },
  {
    id: 'wan-2.1-api',
    name: 'Wan 2.1 (Cloud API)',
    provider: 'Wan',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Cloud-hosted version of Wan 2.1.',
    isLocal: false,
    family: 'wan'
  },

  // --- SEED DANCE (BYTEDANCE) ---
  {
    id: 'seed-dance-v1',
    name: 'Seed Dance V1',
    provider: 'Local',
    capabilities: ['image-to-video'],
    description: 'Specialized model for music-synced dance generation.',
    isLocal: true,
    downloadUrl: 'https://github.com/ByteDance/Seed-Story',
    family: 'other'
  },

  // --- ANTHROPIC ---
  {
    id: 'claude-3-opus',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    capabilities: ['text-to-image'],
    description: 'Advanced reasoning and prompt enhancement.',
    family: 'other'
  },

  // --- LIP SYNC & ANIMATION (CLOSED SOURCE API) ---
  {
    id: 'hedra-character-1',
    name: 'Hedra Character-1',
    provider: 'Hedra',
    capabilities: ['lip-sync'],
    description: 'Generates highly expressive talking characters from audio.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'remaker-sync',
    name: 'Remaker.ai Face Sync',
    provider: 'Remaker',
    capabilities: ['lip-sync'],
    description: 'Professional face swap and lip-sync API.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'elai-io',
    name: 'Elai.io Avatar',
    provider: 'Elai',
    capabilities: ['lip-sync'],
    description: 'Enterprise grade avatar generation.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'mango-animate',
    name: 'Mango Animate',
    provider: 'Local', // Placeholder
    capabilities: ['lip-sync'],
    description: 'Animation suite for talking heads.',
    isLocal: false,
    family: 'other'
  },

  // --- LIP SYNC (OPEN SOURCE LOCAL) ---
  {
    id: 'live-portrait',
    name: 'LivePortrait',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Efficient portrait animation with driving video/audio.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/KwaiVGI/LivePortrait',
    family: 'other'
  },
  {
    id: 'musetalk',
    name: 'MuseTalk',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Real-time high quality lip synchronization.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/TMElyralab/MuseTalk',
    family: 'other'
  },
  {
    id: 'sadtalker',
    name: 'SadTalker',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Single image to talking head generation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/Winfredy/SadTalker',
    family: 'other'
  },
  {
    id: 'hallo-2',
    name: 'Hallo 2',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Long-duration portrait image animation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/fudan-generative-ai/hallo2',
    family: 'other'
  },
  {
    id: 'latentsync',
    name: 'LatentSync',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Lip sync with latent diffusion models.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/byte-dance/LatentSync',
    family: 'other'
  },
  {
    id: 'facefusion',
    name: 'FaceFusion',
    provider: 'Local',
    capabilities: ['lip-sync', 'image-to-image'],
    description: 'Next generation face swapper and enhancer.',
    isLocal: true,
    downloadUrl: 'https://github.com/facefusion/facefusion',
    family: 'other'
  },
  {
    id: 'fantasy-talker',
    name: 'Fantasy Talker',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Stylized character animation.',
    isLocal: true,
    downloadUrl: 'https://github.com/Spycsh/FantasyTalker',
    family: 'other'
  },

  // --- LOCAL VIDEO MODELS ---
  {
    id: 'wan-2.2',
    name: 'Wan 2.2 (Alibaba)',
    provider: 'Local',
    capabilities: ['image-to-video', 'video-to-video'],
    description: 'Latest update to Wan. Improved motion stability and coherence.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/alibaba-pai/Wan2.2',
    family: 'wan'
  },
  {
    id: 'wan-2.1-14b',
    name: 'Wan 2.1 (14B)',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Full sized 14B parameter model for maximum quality.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/alibaba-pai/Wan2.1-14B',
    family: 'wan'
  },
  {
    id: 'wan-2.1-1.3b',
    name: 'Wan 2.1 (1.3B)',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Lightweight 1.3B parameter model for efficiency.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/alibaba-pai/Wan2.1-1.3B',
    family: 'wan'
  },
  {
    id: 'hunyuan-video',
    name: 'Hunyuan Video',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Tencents powerful open-source video generation model.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/tencent/HunyuanVideo',
    family: 'hunyuan'
  },
  {
    id: 'cogvideox',
    name: 'CogVideoX (Zhipu)',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Efficient local video generation optimized for consumer GPUs.',
    isLocal: true,
    downloadUrl: 'https://github.com/THUDM/CogVideo',
    family: 'other'
  },
  {
    id: 'videocrafter2',
    name: 'VideoCrafter2',
    provider: 'Local',
    capabilities: ['video-to-video'],
    description: 'Specialized in video-to-video style transfer and transformation.',
    isLocal: true,
    downloadUrl: 'https://github.com/AILab-CVC/VideoCrafter',
    family: 'other'
  },
  {
    id: 'dynamicrafter',
    name: 'DynamiCrafter',
    provider: 'Local',
    capabilities: ['image-to-video'],
    description: 'Animates open-domain images into dynamic sequences.',
    isLocal: true,
    downloadUrl: 'https://github.com/Doubiiu/DynamiCrafter',
    family: 'other'
  },
  {
    id: 'ltx-video',
    name: 'LTX-Video',
    provider: 'Local',
    capabilities: ['text-to-video'],
    description: 'Fast, production-ready local video generation.',
    isLocal: true,
    downloadUrl: 'https://github.com/Lightricks/LTX-Video',
    family: 'other'
  },

  // --- LOCAL IMAGE MODELS ---
  {
    id: 'flux-1-dev',
    name: 'Flux.1 Dev',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'The current SOTA open-weights image model by Black Forest Labs.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-dev',
    family: 'flux'
  },
  {
    id: 'sd-3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Stability AIs latest flagship model for high adherence prompts.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-3.5-large',
    family: 'sd3'
  },
  {
    id: 'sdxl-1.0',
    name: 'SDXL 1.0',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'The standard for high-resolution open-source image generation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
    family: 'sdxl'
  },
  {
    id: 'sd-1.5',
    name: 'Stable Diffusion 1.5',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Legacy model, extremely fast, massive ecosystem of plugins/LoRAs.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/runwayml/stable-diffusion-v1-5',
    family: 'sd15'
  },

  // --- CONTROLNET ADAPTERS ---
  {
    id: 'cn-canny-sdxl',
    name: 'ControlNet Canny (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Detects edges. Good for retaining structure/composition.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/diffusers/controlnet-canny-sdxl-1.0',
    family: 'sdxl'
  },
  {
    id: 'cn-depth-sdxl',
    name: 'ControlNet Depth (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Uses depth maps. Excellent for 3D composition and landscapes.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/diffusers/controlnet-depth-sdxl-1.0',
    family: 'sdxl'
  },
  {
    id: 'cn-openpose-sdxl',
    name: 'ControlNet OpenPose (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Detects human poses. Essential for character animation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0',
    family: 'sdxl'
  },
  {
    id: 'cn-softedge-sdxl',
    name: 'ControlNet SoftEdge (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Soft edge detection. Good for maintaining general shape without rigid details.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/diffusers/controlnet-softedge-sdxl-1.0',
    family: 'sdxl'
  },
  {
    id: 'cn-lineart-sdxl',
    name: 'ControlNet LineArt (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Converts images to line art for coloring or structural guidance.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/diffusers/controlnet-lineart-sdxl-1.0',
    family: 'sdxl'
  },

  // --- LORA ADAPTERS (NEW) ---
  // SDXL LoRAs
  {
    id: 'lora-sdxl-details',
    name: 'Add More Details (SDXL)',
    provider: 'Local',
    capabilities: ['lora'],
    description: 'Enhances micro-details in textures and backgrounds.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/lora-library/detail-tweaker-sdxl',
    family: 'sdxl'
  },
  {
    id: 'lora-sdxl-pixel',
    name: 'Pixel Art Style (SDXL)',
    provider: 'Local',
    capabilities: ['lora'],
    description: 'Converts output into high-quality pixel art.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/nerijs/pixel-art-xl',
    family: 'sdxl'
  },
  {
    id: 'lora-sdxl-ghibli',
    name: 'Studio Ghibli Style (SDXL)',
    provider: 'Local',
    capabilities: ['lora'],
    description: 'Anime style resembling Ghibli movies.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/artificialguybr/StudioGhibli.Redmond-V2',
    family: 'sdxl'
  },
  {
    id: 'lora-sdxl-lego',
    name: 'LEGO Minifigure (SDXL)',
    provider: 'Local',
    capabilities: ['lora'],
    description: 'Turns characters into LEGO minifigures.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/lora-library/lego-sdxl',
    family: 'sdxl'
  },
  // Flux LoRAs
  {
    id: 'lora-flux-realism',
    name: 'Realism Ultimate (Flux)',
    provider: 'Local',
    capabilities: ['lora'],
    description: 'Push photorealism to the limits for Flux Dev.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/XLabs-AI/flux-RealismLora',
    family: 'flux'
  },
  {
    id: 'lora-flux-anime',
    name: 'Anime Aesthetic (Flux)',
    provider: 'Local',
    capabilities: ['lora'],
    description: 'Flat 2D anime style for Flux.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/alvdansen/flux-anime',
    family: 'flux'
  },
  // Wan LoRAs
  {
    id: 'lora-wan-cinematic',
    name: 'Cinematic Motion (Wan)',
    provider: 'Local',
    capabilities: ['lora'],
    description: 'Enhances cinematic camera movement for Wan Video.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/alibaba-pai/wan-lora-cinematic',
    family: 'wan'
  }
];

export const getModelsByCapability = (capability: string) => {
  return AVAILABLE_MODELS.filter(m => m.capabilities.includes(capability as any));
};