export const PACKAGES = {
  free: { name: 'Free Trial', points: 3, price: 0 },
  mini: { name: 'Mini', points: 15, price: 4.99 },
  standard: { name: 'Standard', points: 50, price: 14.99 },
  pro: { name: 'Pro', points: 200, price: 29.99 },
} as const

export type PackageType = keyof typeof PACKAGES

export const AI_API = {
  removeBg: {
    apiKey: process.env.REMOVE_BG_API_KEY!,
    apiUrl: 'https://api.remove.bg/v1.0/removebg',
  },
  clipdrop: {
    apiKey: process.env.CLIPDROP_API_KEY!,
    inpaintUrl: 'https://api.clipdrop.co/v1/inpainting',
    cleanupUrl: 'https://api.clipdrop.co/v1/cleanup',
    upscaleUrl: 'https://api.clipdrop.co/v1/image-upscale',
  },
  cloudmersive: {
    apiKey: process.env.CLOUDMERSIVE_API_KEY || '',
    apiUrl: 'https://api.cloudmersive.com/image/watermark/remove',
  },
}

// Using Supabase Storage instead of Cloudflare R2 to avoid extra setup
// Create a bucket called "images" in Supabase Storage and make it public

