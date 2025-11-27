
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

  // --- RHYMES AI ---
  {
    id: 'rhymes-allegro',
    name: 'Rhymes Allegro',
    provider: 'Rhymes',
    capabilities: ['text-to-video'],
    description: 'Open source text-to-video model with high motion coherence.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/rhymes-ai/Allegro',
    safeTensorUrl: 'https://huggingface.co/rhymes-ai/Allegro/resolve/main/allegro.safetensors',
    family: 'allegro'
  },

  // --- PYRAMID FLOW ---
  {
    id: 'pyramid-flow-sd3',
    name: 'Pyramid Flow',
    provider: 'Pyramid',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Efficient flow matching video generation built on SD3 architecture.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/rain1011/pyramid-flow-sd3',
    safeTensorUrl: 'https://huggingface.co/rain1011/pyramid-flow-sd3/resolve/main/pyramid_flow_sd3.safetensors',
    family: 'other'
  },

  // --- COGVIDEOX ---
  {
    id: 'cogvideox-5b',
    name: 'CogVideoX-5B',
    provider: 'CogVideo',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Advanced 5B parameter transformer model for video generation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/THUDM/CogVideoX-5b',
    safeTensorUrl: 'https://huggingface.co/THUDM/CogVideoX-5b/resolve/main/cogvideox_5b.safetensors',
    family: 'cogvideox'
  },
  {
    id: 'cogvideox-2b',
    name: 'CogVideoX-2B',
    provider: 'CogVideo',
    capabilities: ['text-to-video', 'video-to-video'],
    description: 'Lightweight 2B parameter version of CogVideoX.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/THUDM/CogVideoX-2b',
    safeTensorUrl: 'https://huggingface.co/THUDM/CogVideoX-2b/resolve/main/cogvideox_2b.safetensors',
    family: 'cogvideox'
  },

  // --- STEPFUN ---
  {
    id: 'stepvideo-t2v',
    name: 'StepVideo-T2V',
    provider: 'StepFun',
    capabilities: ['text-to-video'],
    description: 'StepFuns dedicated text-to-video generation model.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stepfun-ai/stepvideo-t2v',
    family: 'other'
  },

  // --- NVIDIA COSMOS ---
  {
    id: 'nvidia-cosmos-diffusion',
    name: 'NVIDIA Cosmos Diffusion',
    provider: 'Nvidia',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Foundation world model for physical AI.',
    isLocal: true, // Can be run via NIM or Local
    downloadUrl: 'https://huggingface.co/nvidia/Cosmos-1.0-Diffusion-7B-Video-decoder',
    safeTensorUrl: 'https://huggingface.co/nvidia/Cosmos-1.0-Diffusion-7B/resolve/main/model.safetensors',
    family: 'cosmos'
  },
  {
    id: 'nvidia-cosmos-autoregressive',
    name: 'NVIDIA Cosmos Autoregressive',
    provider: 'Nvidia',
    capabilities: ['text-to-video'],
    description: 'Autoregressive world model for long-form generation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/nvidia/Cosmos-1.0-Autoregressive-5B',
    family: 'cosmos'
  },

  // --- MOCHI ---
  {
    id: 'mochi-1-preview',
    name: 'Mochi 1 (Genmo)',
    provider: 'Mochi',
    capabilities: ['text-to-video'],
    description: 'High quality open video generation model by Genmo.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/genmo/mochi-1-preview',
    safeTensorUrl: 'https://huggingface.co/genmo/mochi-1-preview/resolve/main/model.safetensors',
    family: 'mochi'
  },

  // --- HOTSHOT ---
  {
    id: 'hotshot-xl',
    name: 'Hotshot-XL',
    provider: 'Hotshot',
    capabilities: ['text-to-video'],
    description: 'Efficient GIF/Video generation compatible with SDXL LoRAs.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/hotshotco/Hotshot-XL',
    safeTensorUrl: 'https://huggingface.co/hotshotco/Hotshot-XL/resolve/main/hotshot_xl.safetensors',
    family: 'sdxl'
  },

  // --- SKYREELS ---
  {
    id: 'skyreels-v1',
    name: 'SkyReels V1',
    provider: 'SkyReels',
    capabilities: ['image-to-video'],
    description: 'Specialized I2V model for anime/cinematic scenes.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/Skywork/SkyReels-V1-I2V',
    safeTensorUrl: 'https://huggingface.co/Skywork/SkyReels-V1-I2V/resolve/main/skyreels_v1.safetensors',
    family: 'other'
  },

  // --- OPEN SORA & HPC-AI ---
  {
    id: 'open-sora-hpcai',
    name: 'Open-Sora 1.2 (HPC-AI)',
    provider: 'HPC-AI',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Open source reproduction of Sora architecture (v1.2).',
    isLocal: true,
    downloadUrl: 'https://github.com/hpcaitech/Open-Sora',
    safeTensorUrl: 'https://huggingface.co/hpcai-tech/OpenSora-STDiT-v3/resolve/main/model.safetensors',
    family: 'other'
  },
  {
    id: 'open-sora-v2',
    name: 'Open-Sora 2.0',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Next iteration of Open-Sora with improved coherence.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/hpcai-tech/OpenSora-STDiT-v3', // Placeholder until v2 stable release link
    family: 'other'
  },

  // --- MODELSCOPE ---
  {
    id: 'modelscope-t2v',
    name: 'ModelScope Text2Video',
    provider: 'ModelScope',
    capabilities: ['text-to-video'],
    description: 'The classic foundation model for open source video.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/damo-vilab/modelscope-damo-text-to-video-synthesis',
    family: 'sd15' // compatible with some 1.5 adapters
  },

  // --- PIKA ---
  {
    id: 'pika-labs-api',
    name: 'Pika Labs (API)',
    provider: 'Pika',
    capabilities: ['text-to-video', 'image-to-video', 'video-inpainting'],
    description: 'Popular AI video generation platform API.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'pika-open-nodes',
    name: 'Pika Open Nodes (ComfyUI)',
    provider: 'Local',
    capabilities: ['text-to-video', 'node'],
    description: 'Unofficial nodes for interfacing with Pika workflows locally.',
    isLocal: true,
    downloadUrl: 'https://github.com/StartHua/ComfyUI_Pika_Nodes',
    family: 'other'
  },
  
  // --- ANIMATEDIFF ---
  {
    id: 'animatediff-v3',
    name: 'AnimateDiff V3 Motion',
    provider: 'Local',
    capabilities: ['motion-module'],
    description: 'Motion module for Stable Diffusion 1.5.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/guoyww/animatediff/blob/main/v3_sd15_mm.ckpt',
    safeTensorUrl: 'https://huggingface.co/guoyww/animatediff/resolve/main/v3_sd15_mm.ckpt',
    family: 'animatediff'
  },
  {
    id: 'animatediff-sdxl-beta',
    name: 'AnimateDiff SDXL (Beta)',
    provider: 'Local',
    capabilities: ['motion-module'],
    description: 'Motion module for SDXL.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/guoyww/animatediff',
    family: 'animatediff'
  },

  // --- UPSCALERS / ENHANCERS ---
  {
    id: 'letsenhance-api',
    name: 'LetsEnhance (Upscale)',
    provider: 'LetsEnhance',
    capabilities: ['upscaler'],
    description: 'Cloud API for video upscaling and enhancement.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'realesrgan-x4plus',
    name: 'RealESRGAN x4 Plus',
    provider: 'Local',
    capabilities: ['upscaler'],
    description: 'High quality local image upscaling model.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/ai-forever/Real-ESRGAN/blob/main/RealESRGAN_x4plus.pth',
    family: 'other'
  },
  {
    id: 'swinir-4x',
    name: 'SwinIR 4x',
    provider: 'Local',
    capabilities: ['upscaler'],
    description: 'Image restoration using Swin Transformer.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/JingyunLi/SwinIR',
    family: 'other'
  },

  // --- STABILITY AI ---
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
    id: 'sd3.5-large-local',
    name: 'Stable Diffusion 3.5 Large',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: '8B parameter model, superior prompt adherence and typography.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-3.5-large',
    safeTensorUrl: 'https://huggingface.co/stabilityai/stable-diffusion-3.5-large/resolve/main/sd3.5_large.safetensors',
    family: 'sd3'
  },
  {
    id: 'sd3.5-large-turbo-local',
    name: 'Stable Diffusion 3.5 Large Turbo',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Fast 4-step distilled version of SD 3.5 Large.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-3.5-large-turbo',
    safeTensorUrl: 'https://huggingface.co/stabilityai/stable-diffusion-3.5-large-turbo/resolve/main/sd3.5_large_turbo.safetensors',
    family: 'sd3'
  },
  {
    id: 'sd3.5-medium-local',
    name: 'Stable Diffusion 3.5 Medium',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Balanced performance for consumer GPUs (2.5B params).',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-3.5-medium',
    safeTensorUrl: 'https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/resolve/main/sd3.5_medium.safetensors',
    family: 'sd3'
  },
  {
    id: 'sd-2.1',
    name: 'Stable Diffusion 2.1',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Classic 2.1 model, good for landscapes and architecture.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-2-1',
    safeTensorUrl: 'https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors',
    family: 'other'
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
  {
    id: 'svd-xt-local',
    name: 'SVD XT (Local)',
    provider: 'Local',
    capabilities: ['image-to-video'],
    description: 'Stable Video Diffusion XT 1.1 Local Weights.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt-1-1',
    safeTensorUrl: 'https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt-1-1/resolve/main/svd_xt_1_1.safetensors',
    family: 'svd'
  },

  // --- BLACK FOREST LABS (FLUX) ---
  {
    id: 'flux-1-pro-api',
    name: 'Flux.1 Pro (API)',
    provider: 'BlackForest',
    capabilities: ['text-to-image'],
    description: 'State-of-the-art image generation via BFL API.',
    isLocal: false,
    family: 'flux'
  },
  {
    id: 'flux-1-dev',
    name: 'Flux.1 Dev',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'The current SOTA open-weights image model by Black Forest Labs.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-dev',
    safeTensorUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors',
    family: 'flux'
  },
  {
    id: 'flux-1-schnell',
    name: 'Flux.1 Schnell',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Fastest version of Flux, distilled for 4-step inference.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-schnell',
    safeTensorUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/flux1-schnell.safetensors',
    family: 'flux'
  },

  // --- OPENAI (SORA/DALLE) ---
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
    capabilities: ['text-to-video'],
    description: 'Faster, more efficient iteration of Sora.',
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
  {
    id: 'dalle-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    capabilities: ['text-to-image'],
    description: 'Easy to use semantic image generation.',
    isLocal: false,
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
    capabilities: ['text-to-video', 'image-to-video', 'video-inpainting'],
    description: 'Standard model for reliable generation.',
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
    id: 'kling-1.0',
    name: 'Kling 1.0',
    provider: 'Kling',
    capabilities: ['text-to-video'],
    description: 'Standard fast generation model.',
    isLocal: false,
    family: 'other'
  },

  // --- WAN MODELS ---
  {
    id: 'wan-2.1-14b',
    name: 'Wan 2.1 (14B)',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
    description: 'Full sized 14B parameter model for maximum quality.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/alibaba-pai/Wan2.1-14B',
    safeTensorUrl: 'https://huggingface.co/alibaba-pai/Wan2.1-14B/resolve/main/wan2.1_14b.safetensors',
    family: 'wan'
  },
  {
    id: 'wan-2.1-1.3b',
    name: 'Wan 2.1 (1.3B)',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Efficient 1.3B parameter model for consumer GPUs.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/alibaba-pai/Wan2.1-1.3B',
    safeTensorUrl: 'https://huggingface.co/alibaba-pai/Wan2.1-1.3B/resolve/main/wan2.1_1.3b.safetensors',
    family: 'wan'
  },
  {
    id: 'wan-api',
    name: 'Wan Cloud (API)',
    provider: 'Wan',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Cloud API access for Wan models.',
    isLocal: false,
    family: 'wan'
  },
  {
    id: 'wan-2.2-vace',
    name: 'Wan 2.2 VACE Inpainting',
    provider: 'Local',
    capabilities: ['video-inpainting', 'magic-quill'],
    description: 'Advanced inpainting with VACE architecture.',
    isLocal: true,
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
    safeTensorUrl: 'https://huggingface.co/ByteDance/Seed-Story/resolve/main/pytorch_model.bin',
    family: 'other'
  },

  // --- PLAYGROUND AI ---
  {
    id: 'playground-v2.5',
    name: 'Playground v2.5',
    provider: 'Local',
    capabilities: ['text-to-image'],
    description: 'Aesthetic-focused model based on SDXL architecture.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/playgroundai/playground-v2.5-1024px-aesthetic',
    safeTensorUrl: 'https://huggingface.co/playgroundai/playground-v2.5-1024px-aesthetic/resolve/main/playground-v2.5-1024px-aesthetic.safetensors',
    family: 'sdxl'
  },
  {
    id: 'playground-v3-beta',
    name: 'Playground v3 (Beta)',
    provider: 'Playground',
    capabilities: ['text-to-image'],
    description: 'Next-gen playground model (API/Cloud).',
    isLocal: false,
    family: 'other'
  },

  // --- PIXART ---
  {
    id: 'pixart-sigma',
    name: 'PixArt-Sigma',
    provider: 'Local',
    capabilities: ['text-to-image'],
    description: 'DiT based model, high fidelity 4K image generation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/PixArt-alpha/PixArt-Sigma-XL-2-1024-MS',
    safeTensorUrl: 'https://huggingface.co/PixArt-alpha/PixArt-Sigma-XL-2-1024-MS/resolve/main/PixArt-Sigma-XL-2-1024-MS.safetensors',
    family: 'pixart'
  },
  {
    id: 'pixart-alpha',
    name: 'PixArt-Alpha',
    provider: 'Local',
    capabilities: ['text-to-image'],
    description: 'Efficient text-to-image transformer model.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/PixArt-alpha/PixArt-XL-2-1024-MS',
    family: 'pixart'
  },

  // --- RECRAFT & IDEOGRAM ---
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    provider: 'Recraft',
    capabilities: ['text-to-image'],
    description: 'Specialized in vector art, icons, and professional design assets.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'ideogram-v2',
    name: 'Ideogram V2',
    provider: 'Ideogram',
    capabilities: ['text-to-image'],
    description: 'Market leader in typography and text rendering within images.',
    isLocal: false,
    family: 'other'
  },

  // --- OMNIGEN ---
  {
    id: 'omnigen-v1',
    name: 'OmniGen V1',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'Unified image generation model supporting multi-modal inputs.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/Shitao/OmniGen-v1',
    family: 'other'
  },

  // --- DEEPFLOYD ---
  {
    id: 'deepfloyd-if',
    name: 'DeepFloyd IF',
    provider: 'DeepFloyd',
    capabilities: ['text-to-image'],
    description: 'Pixel-based cascaded diffusion model, great at text.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/DeepFloyd/IF-I-XL-v1.0',
    family: 'other'
  },

  // --- LIP SYNC & ANIMATION ---
  {
    id: 'live-portrait',
    name: 'LivePortrait',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Efficient portrait animation with driving video/audio.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/KwaiVGI/LivePortrait',
    safeTensorUrl: 'https://huggingface.co/KwaiVGI/LivePortrait/resolve/main/live_portrait.safetensors',
    family: 'other'
  },
  {
    id: 'musetalk',
    name: 'MuseTalk',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Real-time high quality lip sync.',
    isLocal: true,
    downloadUrl: 'https://github.com/TMElyralab/MuseTalk',
    family: 'other'
  },
  {
    id: 'sadtalker',
    name: 'SadTalker',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Single image audio driven animation.',
    isLocal: true,
    downloadUrl: 'https://github.com/OpenTalker/SadTalker',
    family: 'other'
  },
  {
    id: 'hallo-v1',
    name: 'Hallo',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Hierarchical audio-driven visual synthesis.',
    isLocal: true,
    downloadUrl: 'https://github.com/fudan-generative-vision/hallo',
    safeTensorUrl: 'https://huggingface.co/fudan-generative-vision/hallo/resolve/main/hallo.safetensors',
    family: 'other'
  },
  {
    id: 'hallo-v2',
    name: 'Hallo 2',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Long-duration, high-resolution portrait image-to-video.',
    isLocal: true,
    downloadUrl: 'https://github.com/fudan-generative-vision/hallo2',
    family: 'other'
  },
  {
    id: 'latentsync',
    name: 'LatentSync',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Audio-conditioned latent diffusion for lip sync.',
    isLocal: true,
    downloadUrl: 'https://github.com/bytedance/LatentSync',
    safeTensorUrl: 'https://huggingface.co/bytedance/LatentSync/resolve/main/latentsync.safetensors',
    family: 'other'
  },
  {
    id: 'facefusion',
    name: 'FaceFusion',
    provider: 'Local',
    capabilities: ['lip-sync', 'image-to-image'],
    description: 'Next gen face swapper and enhancer.',
    isLocal: true,
    downloadUrl: 'https://github.com/facefusion/facefusion',
    family: 'other'
  },
  {
    id: 'fantasy-talker',
    name: 'Fantasy Talker',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Stylized portrait animation model.',
    isLocal: true,
    downloadUrl: 'https://github.com/example/fantasy-talker',
    family: 'other'
  },
  {
    id: 'infinite-talker',
    name: 'InfiniteTalker',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Long-form talking head generation.',
    isLocal: true,
    downloadUrl: 'https://github.com/example/infinite-talker',
    family: 'other'
  },
  {
    id: 'kdtalker',
    name: 'KDtalker',
    provider: 'Local',
    capabilities: ['lip-sync'],
    description: 'Knowledge-distilled talking head generation.',
    isLocal: true,
    downloadUrl: 'https://github.com/example/kdtalker',
    family: 'other'
  },
  
  // --- LIP SYNC APIs ---
  {
    id: 'hedra-api',
    name: 'Hedra (API)',
    provider: 'Hedra',
    capabilities: ['lip-sync'],
    description: 'Character Video Generation API.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'elai-api',
    name: 'Elai.io (API)',
    provider: 'Elai',
    capabilities: ['lip-sync'],
    description: 'Enterprise grade AI video generation.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'remaker-api',
    name: 'Remaker.ai (API)',
    provider: 'Remaker',
    capabilities: ['lip-sync'],
    description: 'Face swap and lip-sync services.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'mango-api',
    name: 'Mango Animate (API)',
    provider: 'Mango',
    capabilities: ['lip-sync'],
    description: 'Talking photo and avatar animation API.',
    isLocal: false,
    family: 'other'
  },

  // --- VIDEO INPAINTING & MAGIC QUILL ---
  {
    id: 'sora-2-inpaint',
    name: 'Sora 2 Inpainting',
    provider: 'Sora',
    capabilities: ['video-inpainting'],
    description: 'Powered by OpenAI Sora 2 architecture.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'mootion-api',
    name: 'Mootion',
    provider: 'Mootion',
    capabilities: ['video-inpainting', 'magic-quill'],
    description: 'Professional SaaS for video manipulation.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'deepai-oneshot',
    name: 'DeepAI One-Shot',
    provider: 'DeepAI',
    capabilities: ['video-inpainting'],
    description: 'Fast single-shot video inpainting.',
    isLocal: false,
    family: 'other'
  },
  {
    id: 'generative-omnimatte',
    name: 'Generative Omnimatte',
    provider: 'Local',
    capabilities: ['video-inpainting', 'magic-quill'],
    description: 'Google Research: Layer-based video decomposition.',
    isLocal: true,
    downloadUrl: 'https://github.com/google-research/generative-omnimatte',
    family: 'other'
  },
  {
    id: 'e2fgvi',
    name: 'E2FGVI',
    provider: 'Local',
    capabilities: ['video-inpainting'],
    description: 'Edge-Connect Flow-Guided Video Inpainting.',
    isLocal: true,
    downloadUrl: 'https://github.com/MCG-NKU/E2FGVI',
    family: 'other'
  },
  {
    id: 'fgvc',
    name: 'FGVC',
    provider: 'Local',
    capabilities: ['video-inpainting'],
    description: 'Flow-Guided Video Completion.',
    isLocal: true,
    downloadUrl: 'https://github.com/vt-vl-lab/FGVC',
    family: 'other'
  },
  {
    id: 'sd-video-inpaint',
    name: 'SD Video Inpainting',
    provider: 'Local',
    capabilities: ['video-inpainting', 'magic-quill'],
    description: 'Community forks for Deforum/AnimateDiff inpainting.',
    isLocal: true,
    family: 'other'
  },
  {
    id: 'diffuman4d',
    name: 'Diffuman4D',
    provider: 'Local',
    capabilities: ['video-inpainting'],
    description: 'Human-centric video generation and editing.',
    isLocal: true,
    family: 'other'
  },
  {
    id: 'davis-benchmark',
    name: 'DAVIS Benchmark Dataset',
    provider: 'Local',
    capabilities: ['video-inpainting'],
    description: 'Standard dataset for evaluating video segmentation.',
    isLocal: true,
    downloadUrl: 'https://davischallenge.org/',
    family: 'other'
  },

  // --- LOCAL VIDEO MODELS ---
  {
    id: 'hunyuan-video',
    name: 'Hunyuan Video',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Tencents powerful open-source video generation model.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/tencent/HunyuanVideo',
    safeTensorUrl: 'https://huggingface.co/tencent/HunyuanVideo/resolve/main/hunyuan_video.safetensors',
    family: 'hunyuan'
  },
  {
    id: 'videocrafter2',
    name: 'VideoCrafter2',
    provider: 'Local',
    capabilities: ['video-to-video', 'text-to-video'],
    description: 'Specialized in video-to-video style transfer and transformation.',
    isLocal: true,
    downloadUrl: 'https://github.com/AILab-CVC/VideoCrafter',
    safeTensorUrl: 'https://huggingface.co/VideoCrafter/VideoCrafter2/resolve/main/model.ckpt',
    family: 'other'
  },
  {
    id: 'ltx-video',
    name: 'LTX-Video',
    provider: 'Local',
    capabilities: ['text-to-video', 'image-to-video'],
    description: 'Fast, production-ready local video generation.',
    isLocal: true,
    downloadUrl: 'https://github.com/Lightricks/LTX-Video',
    safeTensorUrl: 'https://huggingface.co/Lightricks/LTX-Video/resolve/main/ltx_video.safetensors',
    family: 'other'
  },

  // --- LOCAL IMAGE MODELS ---
  {
    id: 'sdxl-1.0',
    name: 'SDXL 1.0',
    provider: 'Local',
    capabilities: ['text-to-image', 'image-to-image'],
    description: 'The standard for high-resolution open-source image generation.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
    safeTensorUrl: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors',
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
    safeTensorUrl: 'https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors',
    family: 'sd15'
  },

  // --- CONTROLNET ADAPTERS ---
  {
    id: 'cn-union-promax-sdxl',
    name: 'ControlNet Union Promax (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Unified ControlNet for SDXL handling multiple control types efficiently.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/xinsir/controlnet-union-sdxl-1.0',
    safeTensorUrl: 'https://huggingface.co/xinsir/controlnet-union-sdxl-1.0/resolve/main/diffusion_pytorch_model.safetensors',
    family: 'sdxl'
  },
  {
    id: 'cn-canny-sdxl',
    name: 'ControlNet Canny (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Detects edges. Good for retaining structure/composition.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/diffusers/controlnet-canny-sdxl-1.0',
    safeTensorUrl: 'https://huggingface.co/diffusers/controlnet-canny-sdxl-1.0/resolve/main/diffusion_pytorch_model.safetensors',
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
    safeTensorUrl: 'https://huggingface.co/diffusers/controlnet-depth-sdxl-1.0/resolve/main/diffusion_pytorch_model.safetensors',
    family: 'sdxl'
  },
  {
    id: 'cn-openpose-sdxl',
    name: 'ControlNet OpenPose (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Detects human poses for character consistency.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0',
    safeTensorUrl: 'https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors',
    family: 'sdxl'
  },
  {
    id: 'cn-softedge-sdxl',
    name: 'ControlNet SoftEdge (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Softer edge detection for artistic freedom.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/diffusers/controlnet-softedge-sdxl-1.0',
    safeTensorUrl: 'https://huggingface.co/diffusers/controlnet-softedge-sdxl-1.0/resolve/main/diffusion_pytorch_model.safetensors',
    family: 'sdxl'
  },
  {
    id: 'cn-lineart-sdxl',
    name: 'ControlNet LineArt (SDXL)',
    provider: 'Local',
    capabilities: ['control-adapter'],
    description: 'Converts sketches or photos to line art structure.',
    isLocal: true,
    downloadUrl: 'https://huggingface.co/libero/controlnet-lineart-sdxl',
    family: 'sdxl'
  },

  // --- CUSTOM NODES (INTEGRATIONS) ---
  {
    id: 'node-animate-diff',
    name: 'AnimateDiff Node Pack',
    provider: 'Local',
    capabilities: ['node'],
    description: 'ComfyUI nodes for AnimateDiff motion generation.',
    isLocal: true,
    downloadUrl: 'https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved',
    family: 'other'
  },
  {
    id: 'node-controlnet-aux',
    name: 'ControlNet Preprocessors',
    provider: 'Local',
    capabilities: ['node'],
    description: 'Auxiliary preprocessors for Canny, Depth, OpenPose.',
    isLocal: true,
    downloadUrl: 'https://github.com/Fannovel16/comfyui_controlnet_aux',
    family: 'other'
  },
  {
    id: 'node-ip-adapter',
    name: 'IP-Adapter Nodes',
    provider: 'Local',
    capabilities: ['node'],
    description: 'Image Prompt adapters for style transfer.',
    isLocal: true,
    downloadUrl: 'https://github.com/cubiq/ComfyUI_IPAdapter_plus',
    family: 'other'
  }
];

export const getModelsByCapability = (capability: string) => {
  return AVAILABLE_MODELS.filter(m => m.capabilities.includes(capability as any));
};
