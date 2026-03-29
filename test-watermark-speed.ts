// Test script to measure watermark removal API call speed
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import sharp from 'sharp'

// Load config directly
const AI_API = {
  removeBg: {
    apiKey: process.env.REMOVE_BG_API_KEY!,
    apiUrl: 'https://api.remove.bg/v1.0/removebg',
  },
  clipdrop: {
    apiKey: process.env.CLIPDROP_API_KEY!,
    inpaintUrl: 'https://clipdrop-api.co/inpainting/v1',
    cleanupUrl: 'https://clipdrop-api.co/cleanup/v1',
    upscaleUrl: 'https://clipdrop-api.co/image-upscaling/v1',
  },
  cloudmersive: {
    apiKey: process.env.CLOUDMERSIVE_API_KEY || '',
    apiUrl: 'https://api.cloudmersive.com/image/watermark/remove',
  },
}

// Test with a sample image and mask
// Usage: node test-watermark-speed.ts <image-path>
async function testWatermarkRemovalSpeed(imagePath: string) {
  console.log('🚀 Starting watermark removal speed test...')
  
  // Read image from disk
  const imageBuffer = fs.readFileSync(imagePath)
  console.log(`📦 Image loaded: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`)

  // Get image dimensions using sharp
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 1000
  const height = metadata.height || 1000
  console.log(`📏 Image dimensions: ${width} × ${height}`)

  // For this test image (from user), watermark is at bottom right
  // Create mask: white = keep, black = remove (matches Clipdrop API expectation)
  const cornerSize = Math.floor(Math.min(width, height) * 0.25)
  console.log(`🎯 Marking bottom-right ${cornerSize}×${cornerSize} for watermark removal`)
  
  // Create mask with sharp - all white (keep), then black corner (remove)
  const maskBuffer = await sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 } // white = keep everything
    }
  })
  .composite([
    {
      input: {
        create: {
          width: cornerSize,
          height: cornerSize,
          channels: 3,
          background: { r: 0, g: 0, b: 0 } // black = remove this area
        }
      },
      top: height - cornerSize,
      left: width - cornerSize
    }
  ])
  .png()
  .toBuffer()
  
  console.log(`🎭 Mask created: ${(maskBuffer.length / 1024 / 1024).toFixed(2)} MB`)

  // Call Clipdrop API and measure time
  const startTime = Date.now()
  
  try {
    const form = new FormData()
    form.append('image_file', imageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png',
    })
    form.append('mask_file', maskBuffer, {
      filename: 'mask.png',
      contentType: 'image/png',
    })

    console.log('📡 Calling Clipdrop Cleanup API...')
    console.log('⏱️ Starting timer...')

    const response = await fetch(AI_API.clipdrop.cleanupUrl, {
      method: 'POST',
      headers: {
        'x-api-key': AI_API.clipdrop.apiKey,
        ...form.getHeaders(),
      },
      body: form.getBuffer() as any,
      signal: AbortSignal.timeout(120000), // 2 minute timeout
    })

    const apiTime = Date.now() - startTime
    console.log(`⚡ API responded in ${apiTime}ms (${(apiTime/1000).toFixed(2)}s)`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer())
    const totalTime = Date.now() - startTime
    console.log(`✅ Complete! Total time: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`)
    console.log(`📦 Result size: ${(resultBuffer.length / 1024 / 1024).toFixed(2)} MB`)

    // Save result to disk for inspection
    const outputPath = path.join(path.dirname(imagePath), `result-${Date.now()}.png`)
    fs.writeFileSync(outputPath, resultBuffer)
    console.log(`💾 Result saved to: ${outputPath}`)

  } catch (err: any) {
    const totalTime = Date.now() - startTime
    console.error(`❌ Failed after ${totalTime}ms:`, err.message)
    process.exit(1)
  }
}

// Get image path from command line
const imagePath = process.argv[2]
if (!imagePath) {
  console.error('Usage: node test-watermark-speed.ts <path-to-image>')
  console.error('Example: node test-watermark-speed.ts ./test-image.jpg')
  process.exit(1)
}

testWatermarkRemovalSpeed(imagePath)
  .then(() => console.log('\n🏁 Test complete'))
  .catch(err => {
    console.error('💥 Test failed:', err)
    process.exit(1)
  })
