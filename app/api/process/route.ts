import { NextResponse } from 'next/server'

// 🔧 Force dynamic rendering - critical for Vercel deployment
// This prevents Next.js from trying to statically optimize this API route
export const dynamic = 'force-dynamic'

// 🎯 构建时检测
// Only treat it as build time during the actual build process
// Vercel: check if we're in the build phase by looking at IS_BUILD_TIME or NETLIFY
// On Vercel runtime, process.env.VERCEL is still true but we shouldn't simulate anymore
const isBuildTime = (
  process.env.NODE_ENV === 'production' && 
  (process.env.IS_BUILD_TIME === 'true' || process.env.NETLIFY === 'true')
)

// 🎯 构建时模拟响应
const buildTimeResponse = NextResponse.json(
  {
    success: true,
    simulated: true,
    message: 'API is simulated during build. Will work with real API keys in runtime.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  },
  { status: 200 }
)

// 🎯 构建时GET响应
const buildTimeGETResponse = NextResponse.json(
  {
    status: 'process_api_build_time',
    simulated: true,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  },
  { status: 200 }
)

// ========== 构建时导出（轻量级） ==========
export async function POST(request: Request) {
  // 🎯 构建时：返回模拟响应
  if (isBuildTime) {
    console.log('🎯 构建时调用 /api/process POST，返回模拟响应')
    return buildTimeResponse
  }
  
  // 🎯 运行时：执行真实逻辑
  return await runtimePOST(request)
}

export async function GET() {
  // 🎯 构建时：返回模拟响应
  if (isBuildTime) {
    return buildTimeGETResponse
  }
  
  // 🎯 运行时：执行真实逻辑
  return await runtimeGET()
}

// ========== 运行时代码（构建时不加载） ==========
async function runtimePOST(request: Request) {
  try {
    // 动态导入运行时依赖
    const { createClient } = await import('@supabase/supabase-js')
    const { AI_API } = await import('@/lib/config')
    const FormDataModule = await import('form-data')
    
    // 检查API密钥是否存在
    const hasApiKeys = {
      removeBg: !!process.env.REMOVE_BG_API_KEY,
      clipdrop: !!process.env.CLIPDROP_API_KEY,
      cloudmersive: !!process.env.CLOUDMERSIVE_API_KEY,
    }
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    const formData = await request.formData()
    const file = formData.get('image') as File
    const operation = formData.get('operation') as string
    const userId = formData.get('userId') as string
    const scale = formData.get('scale') as string || '2' // default to 2x

    if (!file || !operation || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer())
    let processedBuffer: Buffer

    // Get optional mask for watermark (user-drawn)
    const maskFile = formData.get('mask') as File | null

    switch (operation) {
      case 'background':
        if (!hasApiKeys.removeBg) {
          return NextResponse.json(
            {
              error: 'Remove.bg API key is not configured',
              help: 'Set REMOVE_BG_API_KEY environment variable'
            },
            { status: 503 }
          )
        }
        processedBuffer = await removeBackground(imageBuffer, AI_API, FormDataModule.default)
        break

      case 'upscale':
        if (!hasApiKeys.clipdrop) {
          return NextResponse.json(
            {
              error: 'Clipdrop API key is not configured',
              help: 'Set CLIPDROP_API_KEY environment variable'
            },
            { status: 503 }
          )
        }
        processedBuffer = await upscaleImage(imageBuffer, AI_API, FormDataModule.default, scale)
        break

      case 'watermark':
        if (!hasApiKeys.clipdrop) {
          return NextResponse.json(
            {
              error: 'Clipdrop API key is not configured',
              help: 'Set CLIPDROP_API_KEY environment variable in .env.local',
              status: 'missing_api_key'
            },
            { status: 503 }
          )
        }
        // If user provided a mask (marked areas), use it
        if (maskFile) {
          const maskBuffer = Buffer.from(await maskFile.arrayBuffer())
          processedBuffer = await removeWatermarkUserMask(imageBuffer, maskBuffer, AI_API, FormDataModule.default)
        } else {
          // Auto mode: clean four corners where watermarks are commonly found
          processedBuffer = await removeWatermarkAuto(imageBuffer, AI_API, FormDataModule.default)
        }
        break

      case 'compliance':
        if (!hasApiKeys.cloudmersive) {
          return NextResponse.json(
            {
              error: 'Cloudmersive API key is not configured',
              help: 'Set CLOUDMERSIVE_API_KEY environment variable'
            },
            { status: 503 }
          )
        }
        const complianceResult = await checkCompliance(imageBuffer, AI_API, FormDataModule.default)
        
        // 对于compliance操作，不扣分并直接返回
        return NextResponse.json({
          success: complianceResult.compliant,
          compliant: complianceResult.compliant,
          issues: complianceResult.issues,
          points_deducted: 0
        })

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    // Convert processed buffer to base64 data URL for immediate display
    const base64 = processedBuffer.toString('base64')
    const processedUrl = `data:image/png;base64,${base64}`

    // Deduct points from user - 1 point per image
    const pointsToDeduct = 1
    
    // First get current remaining points
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('remaining_points')
      .eq('id', userId)
      .single()
    
    let newRemainingPoints = 0
    if (fetchError) {
      console.error('Error fetching current points:', fetchError)
    } else if (currentUser) {
      newRemainingPoints = Math.max(0, (currentUser.remaining_points || 0) - pointsToDeduct)
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        remaining_points: newRemainingPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user points:', updateError)
    }

    // Save processing record
    const { error: recordError } = await supabaseAdmin
      .from('image_processing')
      .insert({
        user_id: userId,
        operation_type: operation,
        original_url: 'uploaded-file',
        processed_url: processedUrl,
        points_deducted: pointsToDeduct,
        status: 'completed'
      })

    if (recordError) {
      console.error('Error saving processing record:', recordError)
    }

    return NextResponse.json({
      success: true,
      results: [processedUrl],
      points_deducted: pointsToDeduct
    })

  } catch (error: any) {
    console.error('Processing error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    )
  }
}

async function runtimeGET() {
  const hasApiKeys = {
    removeBg: !!process.env.REMOVE_BG_API_KEY,
    clipdrop: !!process.env.CLIPDROP_API_KEY,
    cloudmersive: !!process.env.CLOUDMERSIVE_API_KEY,
  }
  
  return NextResponse.json(
    {
      status: 'process_api_ready',
      api_keys: hasApiKeys,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  )
}

// ========== 辅助函数 ==========
async function removeBackground(imageBuffer: Buffer, AI_API: any, FormDataModule: any): Promise<Buffer> {
  const form = new FormDataModule()
  form.append('image_file', imageBuffer as unknown as Blob, {
    filename: 'image.png',
    contentType: 'image/png',
  })
  form.append('size', 'auto')

  // Vercel Hobby plan has 10s timeout, Pro has 60s
  // Use 8s timeout to be safe for Hobby plan
  const timeoutMs = process.env.VERCEL && !process.env.VERCEL_PROJECT_PRODUCTION_URL ? 8000 : 45000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.error(`⏱️ Request timeout after ${timeoutMs}ms`)
    controller.abort()
  }, timeoutMs)

  try {
    console.log(`📡 Remove.bg request timeout=${timeoutMs}ms...`)
    const startTime = Date.now()
    const response = await fetch(AI_API.removeBg.apiUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': AI_API.removeBg.apiKey,
        ...form.getHeaders(),
      },
      body: form.getBuffer() as unknown as BodyInit,
      signal: controller.signal,
    })

    const elapsed = Date.now() - startTime
    console.log(`⚡ Remove.bg responded in ${elapsed}ms`)

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Remove.bg error: status=${response.status}, body=${errorText}`)
      throw new Error(`Remove.bg API error: ${response.status} ${errorText}`)
    }

    const transparentBuffer = Buffer.from(await response.arrayBuffer())
    console.log(`✅ Background removed by Remove.bg, adding white background for Amazon...`)

    // 🎯 Amazon requirement: white background (not transparent)
    // Use sharp to composite the transparent image onto a white canvas
    let sharp
    try {
      sharp = require('sharp')
    } catch (err) {
      console.error('❌ Failed to load sharp for adding white background:', err)
      // If sharp fails, just return the transparent image as-is
      return transparentBuffer
    }

    // Get image dimensions
    const metadata = await sharp(transparentBuffer).metadata()
    const width = metadata.width || 1000
    const height = metadata.height || 1000

    // Create a white background image and composite the transparent product on top
    const whiteBackgroundBuffer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 } // pure white - perfect for Amazon
      }
    })
    .png()
    .toBuffer()

    // Composite transparent image on top of white background
    const finalBuffer = await sharp(whiteBackgroundBuffer)
      .composite([{
        input: transparentBuffer,
        blend: 'over'
      }])
      .png()
      .toBuffer()

    console.log(`✅ Amazon-ready white background added, final size: ${(finalBuffer.length / 1024 / 1024).toFixed(2)} MB`)
    return finalBuffer
  } catch (err) {
    clearTimeout(timeoutId)
    console.error(`❌ Background removal failed:`, err)
    throw err
  }
}

async function upscaleImage(imageBuffer: Buffer, AI_API: any, FormDataModule: any, scale: string = '2'): Promise<Buffer> {
  // super-resolution uses target_width instead of scale
  const isOneX = scale === '1'
  const scaleNum = parseInt(isOneX ? '2' : scale, 10)
  const originalWidth = await (async () => {
    let sharp = require('sharp')
    const metadata = await sharp(imageBuffer).metadata()
    return metadata.width || 0
  })()

  const form = new FormDataModule()
  form.append('image_file', imageBuffer as unknown as Blob, {
    filename: 'image.png',
    contentType: 'image/png',
  })
  // super-resolution requires 'upscale' parameter (how many times to upscale)
  // 2 = 2x, 4 = 4x
  form.append('upscale', scaleNum.toString())

  // Vercel Hobby plan has 10s timeout, Pro has 60s
  // For China network, give more time for DNS/connection
  const baseTimeout = process.env.VERCEL && !process.env.VERCEL_PROJECT_PRODUCTION_URL ? 20000 : 180000
  // Local development has no timeout limit, give 3 minutes
  const timeoutMs = !process.env.VERCEL ? 180000 : (scaleNum === 4 ? Math.floor(baseTimeout * 0.8) : baseTimeout)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.error(`⏱️ Request timeout after ${timeoutMs}ms`)
    controller.abort()
  }, timeoutMs)

  try {
    console.log(`📡 Clipdrop ${scale}x upscale request timeout=${timeoutMs}ms...`)
    const startTime = Date.now()
    const response = await fetch(AI_API.clipdrop.upscaleUrl, {
      method: 'POST',
      headers: {
        'x-api-key': AI_API.clipdrop.apiKey,
        ...form.getHeaders(),
      },
      body: form.getBuffer() as unknown as BodyInit,
      signal: controller.signal,
    })

    const elapsed = Date.now() - startTime
    console.log(`⚡ Clipdrop responded in ${elapsed}ms`)

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Clipdrop ${scale}x upscale error: status=${response.status}, body=${errorText}`)
      throw new Error(`Clipdrop ${scale}x upscale API error: ${response.status} ${errorText}`)
    }

    let resultBuffer = Buffer.from(await response.arrayBuffer())

    // For 1x: scale back to original size after 2x AI processing
    // This gives AI denoise/sharpen without changing dimensions
    if (isOneX && originalWidth > 0) {
      console.log(`📏 1x mode: scaling back to original width ${originalWidth}px after AI processing...`)
      let sharp
      try {
        sharp = require('sharp')
      } catch (err) {
        console.error('❌ Failed to load sharp for 1x resizing:', err)
        // If sharp fails, just return the 2x result as-is
        console.log(`✅ ${scale}x upscale complete (fallback to 2x), result size: ${(resultBuffer.length / 1024 / 1024).toFixed(2)} MB`)
        return resultBuffer
      }
      // Resize back to original width, maintain aspect ratio with lanczos3 for high quality
      resultBuffer = await sharp(resultBuffer)
        .resize(originalWidth, null, { kernel: sharp.kernel.lanczos3 })
        .png()
        .toBuffer()
      console.log(`✅ 1x complete (AI denoise + sharpen, original dimensions kept), result size: ${(resultBuffer.length / 1024 / 1024).toFixed(2)} MB`)
    }

    console.log(`✅ ${scale}x upscale complete, result size: ${(resultBuffer.length / 1024 / 1024).toFixed(2)} MB`)
    return resultBuffer
  } catch (err) {
    clearTimeout(timeoutId)
    console.error(`❌ ${scale}x upscale failed:`, err)
    throw err
  }
}

// Automatic mode: clean four corners where watermarks are commonly found
async function removeWatermarkAuto(imageBuffer: Buffer, AI_API: any, FormDataModule: any): Promise<Buffer> {
  // Use Clipdrop Cleanup API to remove watermark
  // Most e-commerce product image watermarks are at one of the four corners
  // Strategy: keep center product area white (don't touch), black out four corners for cleaning
  let sharp
  try {
    sharp = require('sharp')
  } catch (err) {
    console.error('❌ Failed to load sharp module on Vercel:', err)
    throw new Error('sharp module failed to load on this platform. Please use manual mode (draw the watermark area yourself on the canvas) instead of automatic mode. If you need automatic mode, check your Vercel build configuration.')
  }
  
  // Get metadata to get image dimensions
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 1000
  const height = metadata.height || 1000
  
  // Corner size = 30% of min dimension - large enough to cover most watermarks
  const cornerSize = Math.floor(Math.min(width, height) * 0.30)
  
  // Create mask with all white (keep) + four black corners (clean)
  const maskBuffer = await sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 } // white = keep original
    }
  })
  .composite([
    // Top-left corner
    {
      input: {
        create: {
          width: cornerSize,
          height: cornerSize,
          channels: 3,
          background: { r: 0, g: 0, b: 0 } // black = clean this area
        }
      },
      top: 0,
      left: 0
    },
    // Top-right corner
    {
      input: {
        create: {
          width: cornerSize,
          height: cornerSize,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      },
      top: 0,
      left: width - cornerSize
    },
    // Bottom-left corner
    {
      input: {
        create: {
          width: cornerSize,
          height: cornerSize,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      },
      top: height - cornerSize,
      left: 0
    },
    // Bottom-right corner (most common location for watermarks)
    {
      input: {
        create: {
          width: cornerSize,
          height: cornerSize,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      },
      top: height - cornerSize,
      left: width - cornerSize
    }
  ])
  .png()
  .toBuffer()

  // Add auto-retry for unstable network connections (common when accessing from China)
  // Vercel Serverless Functions have a max 10s timeout on Hobby plan, 60s on Pro
  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const form = new FormDataModule()
      
      form.append('image_file', imageBuffer as unknown as Blob, {
        filename: 'image.png',
        contentType: 'image/png',
      })
      
      form.append('mask_file', maskBuffer as unknown as Blob, {
        filename: 'mask.png',
        contentType: 'image/png',
      })
      
      // Vercel Hobby plan has 10s timeout, Pro has 60s
      // Use 8s timeout to be safe for Hobby plan
      const timeoutMs = process.env.VERCEL && !process.env.VERCEL_PROJECT_PRODUCTION_URL ? 8000 : 45000
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error(`⏱️ Request timeout after ${timeoutMs}ms`)
        controller.abort()
      }, timeoutMs)

      console.log(`📡 Clipdrop API attempt ${attempt + 1}/${maxRetries} timeout=${timeoutMs}ms...`)
      const startTime = Date.now()

      const response = await fetch(AI_API.clipdrop.cleanupUrl, {
        method: 'POST',
        headers: {
          'x-api-key': AI_API.clipdrop.apiKey,
          ...form.getHeaders(),
        },
        body: form.getBuffer() as unknown as BodyInit,
        signal: controller.signal,
      })

      const elapsed = Date.now() - startTime
      console.log(`⚡ Clipdrop responded in ${elapsed}ms`)

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Clipdrop API error: status=${response.status}, body=${errorText}`)
        throw new Error(`Clipdrop Cleanup API error: ${response.status} ${errorText}`)
      }

      const resultBuffer = Buffer.from(await response.arrayBuffer())
      console.log(`✅ Complete, result size: ${(resultBuffer.length / 1024 / 1024).toFixed(2)} MB`)
      return resultBuffer
    } catch (err) {
      lastError = err
      console.warn(`⚠️ Attempt ${attempt + 1} failed:`, err)
      if (attempt < maxRetries - 1) {
        console.log('🔄 Retrying...')
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s before retry
      }
    }
  }

  // All retries failed
  console.error(`❌ All ${maxRetries} attempts failed`, lastError)
  throw lastError
}

// User mode: use the mask that user drew on the canvas
async function removeWatermarkUserMask(imageBuffer: Buffer, maskBuffer: Buffer, AI_API: any, FormDataModule: any): Promise<Buffer> {
  // User already drew the mask correctly on canvas - black = clean, white = keep
  // Just send directly to Clipdrop Cleanup API
  // Add auto-retry for unstable network connections (common when accessing from China)
  // Vercel Serverless Functions have a max 10s timeout on Hobby plan, 60s on Pro
  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const form = new FormDataModule()
      
      form.append('image_file', imageBuffer as unknown as Blob, {
        filename: 'image.png',
        contentType: 'image/png',
      })
      
      form.append('mask_file', maskBuffer as unknown as Blob, {
        filename: 'mask.png',
        contentType: 'image/png',
      })
      
      // Vercel Hobby plan has 10s timeout, Pro has 60s
      // Use 8s timeout to be safe for Hobby plan
      const timeoutMs = process.env.VERCEL && !process.env.VERCEL_PROJECT_PRODUCTION_URL ? 8000 : 45000
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error(`⏱️ Request timeout after ${timeoutMs}ms`)
        controller.abort()
      }, timeoutMs)

      console.log(`📡 Clipdrop API (user mask) attempt ${attempt + 1}/${maxRetries} timeout=${timeoutMs}ms...`)
      const startTime = Date.now()

      const response = await fetch(AI_API.clipdrop.cleanupUrl, {
        method: 'POST',
        headers: {
          'x-api-key': AI_API.clipdrop.apiKey,
          ...form.getHeaders(),
        },
        body: form.getBuffer() as unknown as BodyInit,
        signal: controller.signal,
      })

      const elapsed = Date.now() - startTime
      console.log(`⚡ Clipdrop responded in ${elapsed}ms`)

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Clipdrop API error: status=${response.status}, body=${errorText}`)
        throw new Error(`Clipdrop Cleanup API error: ${response.status} ${errorText}`)
      }

      const resultBuffer = Buffer.from(await response.arrayBuffer())
      console.log(`✅ Complete, result size: ${(resultBuffer.length / 1024 / 1024).toFixed(2)} MB`)
      return resultBuffer
    } catch (err) {
      lastError = err
      console.warn(`⚠️ Attempt ${attempt + 1} failed:`, err)
      if (attempt < maxRetries - 1) {
        console.log('🔄 Retrying...')
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s before retry
      }
    }
  }

  // All retries failed
  console.error(`❌ All ${maxRetries} attempts failed`, lastError)
  throw lastError
}

async function checkCompliance(imageBuffer: Buffer, AI_API: any, FormDataModule: any): Promise<{ compliant: boolean; issues: string[] }> {
  // Use Cloudmersive API to check for inappropriate content in Amazon product images
  const form = new FormDataModule()
  form.append('image', imageBuffer as unknown as Blob, {
    filename: 'image.png',
    contentType: 'image/png',
  })

  // Add 60 second timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch('https://api.cloudmersive.com/image/analytics/check-content-safety', {
      method: 'POST',
      headers: {
        'Apikey': AI_API.cloudmersive.apiKey,
        ...form.getHeaders(),
      },
      body: form.getBuffer() as unknown as BodyInit,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Cloudmersive compliance check failed: ${response.statusText}`)
    }

    const result = await response.json()
    const issues: string[] = []

    // Check for unsafe content categories
    if (result.safeSearchResult) {
      const { safeSearchResult } = result
      if (safeSearchResult.adultContentScore > 0.5) issues.push('Adult content')
      if (safeSearchResult.racyContentScore > 0.5) issues.push('Racy content')
      if (safeSearchResult.medicalContentScore > 0.5) issues.push('Medical content')
      if (safeSearchResult.violenceContentScore > 0.5) issues.push('Violence content')
      if (safeSearchResult.nudityContentScore > 0.5) issues.push('Nudity content')
    }

    return {
      compliant: issues.length === 0,
      issues
    }
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}
