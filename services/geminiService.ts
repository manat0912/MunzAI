import { GoogleGenAI } from "@google/genai";
import { VideoConfig } from "../types";

// Helper to ensure API key is selected for Veo/Imagen models
export const ensureApiKey = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
};

const getClient = () => {
  // Always create a new client to pick up the potentially newly selected key
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImage = async (
  prompt: string,
  aspectRatio: string = "1:1",
  negativePrompt?: string
): Promise<string> => {
  await ensureApiKey();
  const ai = getClient();
  
  // Construct a rich prompt if negative prompt is present
  const fullPrompt = negativePrompt 
    ? `${prompt} \n\n(Negative prompt: ${negativePrompt}. Do not include these elements.)`
    : prompt;

  // Using Gemini 2.5 Flash Image for general tasks as per guidelines, 
  // or switch to Pro if high quality needed. Defaulting to Pro for "state-of-the-art" request.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: fullPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any, 
        imageSize: "2K",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editImage = async (
  imageFile: File,
  prompt: string,
  negativePrompt?: string,
  maskBlob?: Blob | null
): Promise<string> => {
  await ensureApiKey();
  const ai = getClient();
  
  const base64Data = await fileToBase64(imageFile);
  const fullPrompt = negativePrompt 
    ? `${prompt}. Avoid: ${negativePrompt}`
    : prompt;

  const parts: any[] = [
    {
      inlineData: {
        data: base64Data,
        mimeType: imageFile.type,
      },
    }
  ];

  if (maskBlob) {
      const maskBase64 = await blobToBase64(maskBlob);
      // Pass mask as a second image part. 
      // Gemini models can interpret multiple images. We provide context in the prompt.
      parts.push({
          inlineData: {
              data: maskBase64,
              mimeType: 'image/png'
          }
      });
      parts.push({ text: "Use the second image (black and white) as a mask. Only edit the white areas of the first image based on the following instruction." });
  }

  parts.push({ text: fullPrompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts,
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image generated");
};

export const generateVideo = async (
  prompt: string,
  imageFile: File | null,
  videoFile: File | null,
  config: VideoConfig,
  maskBlob?: Blob | null,
  audioBlob?: Blob | null
): Promise<string> => {
  await ensureApiKey();
  const ai = getClient();

  let operation;

  const validAspectRatio = config.aspectRatio; // Veo strictly supports 16:9 or 9:16
  
  // Map extended resolutions to API supported ones (720p or 1080p)
  // 480p and 560p are mapped to 720p for the API call to ensure success.
  let validResolution: '720p' | '1080p' = '720p';
  if (config.resolution === '1080p') {
    validResolution = '1080p';
  } else {
    validResolution = '720p';
  }

  // Note: Current Veo 3.1 Preview API via GoogleGenAI SDK primarily supports text/image inputs.
  // Audio blob is accepted here for architectural support. 
  // If the backend model supports audio-driven video (like specific local models), it would be passed here.
  
  // For standard generation, we focus on prompt and image.
  // If videoFile is present (e.g. video-to-video or inpainting), it would typically be processed 
  // by a specific model endpoint. For now, we simulate handling by prioritizing image input 
  // if available (as a frame reference) or fallback to text-to-video.
  
  if (imageFile) {
    const base64Data = await fileToBase64(imageFile);
    
    // Check if mask is present for "image-based video inpainting" simulation
    // (Veo currently doesn't support direct mask blob via this SDK method, but we structure it)
    
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: base64Data,
        mimeType: imageFile.type,
      },
      config: {
        numberOfVideos: 1,
        resolution: validResolution,
        aspectRatio: validAspectRatio,
      }
    });
  } else {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: validResolution,
        aspectRatio: validAspectRatio,
      }
    });
  }

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed or returned no URI");

  const downloadUrl = `${videoUri}&key=${process.env.API_KEY}`;
  
  const videoResponse = await fetch(downloadUrl);
  if(!videoResponse.ok) throw new Error("Failed to download generated video");
  
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

// Utils
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}