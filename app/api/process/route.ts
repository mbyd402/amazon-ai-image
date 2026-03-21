import { NextResponse } from 'next/server'

// 🎯 构建时检测
const isBuildTime = process.env.NODE_ENV === 'production' && (process.env.NETLIFY || process.env.VERCEL || process.env.IS_BUILD_TIME === 'true')

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
export async function POST() {
  // 🎯 构建时：返回模拟响应
  if (isBuildTime) {
    console.log('🎯 构建时调用 /api/process POST，返回模拟响应')
    return buildTimeResponse
  }
  
  // 🎯 运行时：执行真实逻辑
  return await runtimePOST(arguments[0])
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

    if (!file || !operation || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer())
    let processedBuffer: Buffer

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
        processedBuffer = await upscaleImage(imageBuffer, AI_API, FormDataModule.default)
        break

      case 'watermark':
        if (!hasApiKeys.cloudmersive) {
          return NextResponse.json(
            {
              error: 'Cloudmersive API key is not configured',
              help: 'Set CLOUDMERSIVE_API_KEY environment variable'
            },
            { status: 503 }
          )
        }
        processedBuffer = await removeWatermark(imageBuffer, AI_API, FormDataModule.default)
        break

      case 'compliance':
        const complianceResult = await checkCompliance(imageBuffer)
        
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

    // Generate a unique filename
    const timestamp = Date.now()
    const processedFilename = `${timestamp}_${operation}_processed.png`

    // Upload to storage (simulated for now)
    const processedUrl = `/processed/${processedFilename}`

    // Deduct points from user
    const pointsToDeduct = 10
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        remaining_points: supabaseAdmin.rpc('decrement_points', { user_id: userId, points: pointsToDeduct }),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

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

  const response = await fetch(AI_API.removeBg.apiUrl, {
    method: 'POST',
    headers: {
      'X-Api-Key': AI_API.removeBg.apiKey,
      ...form.getHeaders(),
    },
    body: form.getBuffer() as unknown as BodyInit,
  })

  if (!response.ok) {
    throw new Error(`Remove.bg API error: ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function upscaleImage(imageBuffer: Buffer, AI_API: any, FormDataModule: any): Promise<Buffer> {
  const form = new FormDataModule()
  form.append('image_file', imageBuffer as unknown as Blob, {
    filename: 'image.png',
    contentType: 'image/png',
  })

  const response = await fetch(AI_API.clipdrop.upscaleUrl, {
    method: 'POST',
    headers: {
      'x-api-key': AI_API.clipdrop.apiKey,
      ...form.getHeaders(),
    },
    body: form.getBuffer() as unknown as BodyInit,
  })

  if (!response.ok) {
    throw new Error(`Clipdrop API error: ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function removeWatermark(imageBuffer: Buffer, AI_API: any, FormDataModule: any): Promise<Buffer> {
  const form = new FormDataModule()
  form.append('imageFile', imageBuffer as unknown as Blob, {
    filename: 'image.png',
    contentType: 'image/png',
  })

  const response = await fetch(AI_API.cloudmersive.apiUrl, {
    method: 'POST',
    headers: {
      'Apikey': AI_API.cloudmersive.apiKey,
      ...form.getHeaders(),
    },
    body: form.getBuffer() as unknown as BodyInit,
  })

  if (!response.ok) {
    throw new Error(`Cloudmersive API error: ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function checkCompliance(imageBuffer: Buffer): Promise<{ compliant: boolean; issues: string[] }> {
  // 这里可以添加真实的合规检查逻辑
  // 暂时返回模拟结果
  return {
    compliant: true,
    issues: []
  }
}