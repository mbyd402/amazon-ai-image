import { NextResponse } from 'next/server'

// 🎯 Node.js Runtime for Cloudflare Workers (supports sharp)
export const runtime = 'nodejs'

// 🔧 Force dynamic rendering
// This prevents Next.js from trying to statically optimize this API route
export const dynamic = 'force-dynamic'

// 🎯 构建时检测
// Vercel: check if we're in the build phase by looking at IS_BUILD_TIME or NETLIFY
// Cloudflare Pages: check CF_PAGES environment variable
const isBuildTime = (
  process.env.NODE_ENV === 'production' && 
  (process.env.IS_BUILD_TIME === 'true' || process.env.NETLIFY === 'true')
)

// 🎯 Cloudflare Pages 环境检测
const isCloudflarePages = process.env.CF_PAGES === 'true' || process.env.CLOUDFLARE_PAGES === 'true'

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
    // 🎯 动态导入运行时依赖（兼容 Cloudflare 和 Node.js 环境）
    const { createClient } = await import('@supabase/supabase-js')
    const { AI_API } = await import('@/lib/config')
    
    // 🎯 Cloudflare Pages 不支持 form-data，使用原生 fetch
    // Vercel/Node.js 环境使用 form-data
    let FormDataModule: any
    let isUsingNativeFormData = false
    
    if (isCloudflarePages) {
      // Cloudflare: 使用 Web API 的 FormData（如果需要）或 fetch 直接发送
      isUsingNativeFormData = true
      console.log('☁️ Cloudflare Pages 环境，禁用 form-data 模块')
    } else {
      // Vercel/Node.js: 使用 form-data 包
      FormDataModule = (await import('form-data')).default
    }
    
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
        processedBuffer = await removeBackground(imageBuffer, AI_API, FormDataModule, isUsingNativeFormData)
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
        processedBuffer = await upscaleImage(imageBuffer, AI_API, FormDataModule, scale, isUsingNativeFormData)
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
          processedBuffer = await removeWatermarkUserMask(imageBuffer, maskBuffer, AI_API, FormDataModule, isUsingNativeFormData)
        } else {
          // Auto mode: clean four corners where watermarks are commonly found
          processedBuffer = await removeWatermarkAuto(imageBuffer, AI_API, FormDataModule, isUsingNativeFormData)
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
        const complianceResult = await checkCompliance(imageBuffer, AI_API, FormDataModule, isUsingNativeFormData)
        
        // Convert processed buffer to base64 data URL (just for API consistency)
        const base64 = imageBuffer.toString('base64')
        const processedUrl = `data:image/png;base64,${base64}`

        // Deduct 1 point for compliance check (OCR costs money)
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

        // Return compliance result
        return NextResponse.json({
          success: true,
          compliant: complianceResult.compliant,
          issues: complianceResult.issues,
          results: [processedUrl],
          points_deducted: pointsToDeduct
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

// 🎯 Cloudflare 兼容的 FormData 辅助函数
// Cloudflare Workers 不支持 form-data 包，需要使用 Web API FormData
function createMultipartBody(
  imageBuffer: Buffer, 
  additionalFields: Record<string, string>,
  useNativeFormData: boolean,
  FormDataModule?: any
): { body: BodyInit; headers: Record<string, string> } {
  if (useNativeFormData) {
    // Cloudflare/浏览器环境：使用 Web API FormData
    const formData = new FormData()
    
    // 将 Buffer 转为 Blob（使用 Uint8Array 避免类型问题）
    const uint8Array = new Uint8Array(imageBuffer)
    const blob = new Blob([uint8Array], { type: 'image/png' })
    formData.append('image_file', blob, 'image.png')
    
    // 添加其他字段
    for (const [key, value] of Object.entries(additionalFields)) {
      formData.append(key, value)
    }
    
    // Web API FormData 不需要手动设置 Content-Type
    return { 
      body: formData as unknown as BodyInit, 
      headers: {} 
    }
  } else {
    // Node.js 环境：使用 form-data 包
    const form = new FormDataModule()
    form.append('image_file', imageBuffer as unknown as Blob, {
      filename: 'image.png',
      contentType: 'image/png',
    })
    
    for (const [key, value] of Object.entries(additionalFields)) {
      form.append(key, value)
    }
    
    return { 
      body: form.getBuffer() as unknown as BodyInit, 
      headers: form.getHeaders() 
    }
  }
}

async function removeBackground(imageBuffer: Buffer, AI_API: any, FormDataModule: any, isUsingNativeFormData: boolean): Promise<Buffer> {
  // 使用兼容的 multipart 辅助函数
  const { body, headers } = createMultipartBody(
    imageBuffer, 
    { size: 'auto' },
    isUsingNativeFormData,
    FormDataModule
  )

  // Vercel Hobby plan has 10s timeout, Pro has 60s
  // Cloudflare Workers has 10-30s timeout depending on plan
  // Use 8s timeout to be safe
  const timeoutMs = 8000
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
        ...headers,
      },
      body: body,
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
    console.log(`✅ Background removed by Remove.bg (transparent), returning as-is for Cloudflare Edge...`)
    
    // 🎯 Cloudflare Edge Runtime: can't use sharp, return transparent image
    // The client can display this with a white background via CSS
    return transparentBuffer
    
    // Note: Original sharp-based white background compositing removed for Edge compatibility
    // For Vercel/Node.js, this code path would add white background
  } catch (err) {
    clearTimeout(timeoutId)
    console.error(`❌ Background removal failed:`, err)
    throw err
  }
}

async function upscaleImage(imageBuffer: Buffer, AI_API: any, FormDataModule: any, scale: string = '2', isUsingNativeFormData: boolean = false): Promise<Buffer> {
  // super-resolution uses target_width instead of scale
  const isOneX = scale === '1'
  const scaleNum = parseInt(isOneX ? '2' : scale, 10)
  
  // Note: Edge Runtime doesn't support sharp, skip originalWidth detection
  // Just pass through to AI API
  const originalWidth = 0

  // 使用兼容的 multipart 辅助函数
  const { body, headers } = createMultipartBody(
    imageBuffer, 
    { upscale: scaleNum.toString() },
    isUsingNativeFormData,
    FormDataModule
  )

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
    console.log(`📡 Clipdrop ${scale}x upscale request`)
    console.log(`   URL: ${AI_API.clipdrop.upscaleUrl}`)
    console.log(`   API key length: ${AI_API.clipdrop.apiKey.length}`)
    console.log(`   timeout=${timeoutMs}ms...`)
    const startTime = Date.now()
    const response = await fetch(AI_API.clipdrop.upscaleUrl, {
      method: 'POST',
      headers: {
        'x-api-key': AI_API.clipdrop.apiKey,
        ...headers,
      },
      body: body,
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

    // For 1x: Edge Runtime can't resize, just return 2x result as-is
    // Note: sharp not available in Edge Runtime
    if (isOneX) {
      console.log(`📏 1x mode on Edge Runtime: returning 2x result (no resize available)`)
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
async function removeWatermarkAuto(imageBuffer: Buffer, AI_API: any, FormDataModule: any, isUsingNativeFormData: boolean = false): Promise<Buffer> {
  // Edge Runtime: can't use sharp to create mask, return error
  // User should use manual mode instead
  console.error('❌ Automatic watermark removal not available on Cloudflare Edge Runtime')
  throw new Error('Automatic watermark removal requires manual mode on Cloudflare Pages. Please draw the watermark area yourself on the canvas.')
}

// User mode: use the mask that user drew on the canvas
async function removeWatermarkUserMask(imageBuffer: Buffer, maskBuffer: Buffer, AI_API: any, FormDataModule: any, isUsingNativeFormData: boolean = false): Promise<Buffer> {
  // User already drew the mask correctly on canvas - black = clean, white = keep
  // Just send directly to Clipdrop Cleanup API
  // Add auto-retry for unstable network connections (common when accessing from China)
  // Vercel Serverless Functions have a max 10s timeout on Hobby plan, 60s on Pro
  const maxRetries = 3
  let lastError: any = null

  // 为多部分表单准备数据（兼容 Cloudflare）
  const getMultipartBody = () => {
    if (isUsingNativeFormData) {
      const formData = new FormData()
      const imageBlob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' })
      const maskBlob = new Blob([new Uint8Array(maskBuffer)], { type: 'image/png' })
      formData.append('image_file', imageBlob, 'image.png')
      formData.append('mask_file', maskBlob, 'mask.png')
      return { body: formData as unknown as BodyInit, headers: {} }
    } else {
      const form = new FormDataModule()
      form.append('image_file', imageBuffer as unknown as Blob, {
        filename: 'image.png',
        contentType: 'image/png',
      })
      form.append('mask_file', maskBuffer as unknown as Blob, {
        filename: 'mask.png',
        contentType: 'image/png',
      })
      return { body: form.getBuffer() as unknown as BodyInit, headers: form.getHeaders() }
    }
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { body, headers } = getMultipartBody()
      
      // Use 8s timeout to be safe
      const timeoutMs = 8000
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
          ...headers,
        },
        body: body,
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

async function checkCompliance(imageBuffer: Buffer, AI_API: any, FormDataModule: any, isUsingNativeFormData: boolean = false): Promise<{ compliant: boolean; issues: string[] }> {
  const issues: string[] = []
  
  // Edge Runtime: Sharp not available, use simplified check via AI API only
  // Can't get metadata locally, will rely on Cloudmersive API for checks
  console.log('📋 Running compliance check (simplified for Edge Runtime)')
  
  const size = imageBuffer.length

  // ========== 1. Check file size (<= 10MB) ==========
  const maxSizeBytes = 10 * 1024 * 1024 // 10MB
  if (size > maxSizeBytes) {
    issues.push(`File size too large: ${(size / 1024 / 1024).toFixed(1)}MB (max 10MB)`)
  }

  // Note: Other checks (resolution, format, white background) require Cloudmersive API
  // The full compliance check will be done by the AI API
  
  // If Cloudmersive API is available, use it for detailed checks
  if (AI_API.cloudmersive.apiKey) {
    try {
      // 使用兼容的 multipart 辅助函数
      const { body, headers } = createMultipartBody(
        imageBuffer, 
        {},
        isUsingNativeFormData,
        FormDataModule
      )

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      console.log(`📡 Cloudmersive OCR text check...`)
      const response = await fetch('https://api.cloudmersive.com/image/ocrImageToText', {
        method: 'POST',
        headers: {
          'Apikey': AI_API.cloudmersive.apiKey,
          ...headers,
        },
        body: body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const text = (await response.text()).trim()
        if (text.length > 0) {
          issues.push(`Text detected on image: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`)
        }
      }
    } catch (err) {
      console.error('⚠️ OCR check failed:', err)
    }
  }

  return {
    compliant: issues.length === 0,
    issues
  }
}
