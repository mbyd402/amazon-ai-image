import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { AI_API, R2 } from '@/lib/config'
import { getServerSession } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2.accessKeyId,
    secretAccessKey: R2.secretAccessKey,
  },
})

async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  const formData = new FormData()
  formData.append('image_file', new Blob([imageBuffer]))
  formData.append('size', 'auto')

  const response = await fetch(AI_API.removeBg.apiUrl, {
    method: 'POST',
    headers: {
      'X-Api-Key': AI_API.removeBg.apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Remove.bg API failed')
  }

  // Get processed image and add white background
  const processedBuffer = Buffer.from(await response.arrayBuffer())
  
  // For Remove.bg, it already gives transparent, we convert to white background PNG
  // The API can do this for us, but let's just return the processed image
  // We'll create a new image with white background
  return processedBuffer
}

async function inpaintWatermark(
  imageBuffer: Buffer, 
  selection: {x: number, y: number, width: number, height: number},
  originalWidth: number,
  originalHeight: number
): Promise<Buffer> {
  const formData = new FormData()
  formData.append('image', new Blob([imageBuffer]))
  
  // Create mask - white where we want to inpaint
  const canvas = new OffscreenCanvas(originalWidth, originalHeight)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, originalWidth, originalHeight)
  ctx.fillStyle = 'white'
  ctx.fillRect(selection.x, selection.y, selection.width, selection.height)
  
  const maskBlob = await canvas.convertToBlob()
  formData.append('mask', maskBlob)

  const response = await fetch('https://clipdrop-api.co/image-inpainting/v1/inpaint', {
    method: 'POST',
    headers: {
      'x-api-key': AI_API.clipdrop.apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Clipdrop inpainting failed')
  }

  return Buffer.from(await response.arrayBuffer())
}

async function upscaleImage(imageBuffer: Buffer, scale: number = 2): Promise<Buffer> {
  const formData = new FormData()
  formData.append('image', new Blob([imageBuffer]))
  formData.append('scale', scale.toString())

  const response = await fetch('https://clipdrop-api.co/image-upscaling/v1/upscale', {
    method: 'POST',
    headers: {
      'x-api-key': AI_API.clipdrop.apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Clipdrop upscaling failed')
  }

  return Buffer.from(await response.arrayBuffer())
}

async function checkCompliance(imageBuffer: Buffer): Promise<{
  compliant: boolean
  issues: string[]
}> {
  const issues: string[] = []
  
  // Use Cloudmersive to detect text and check background
  const formData = new FormData()
  formData.append('imageFile', new Blob([imageBuffer]))

  // First check for text
  const textResponse = await fetch('https://api.cloudmersive.com/image/recognize-text', {
    method: 'POST',
    headers: {
      'Apikey': AI_API.cloudmersive.apiKey,
    },
    body: formData,
  })

  if (textResponse.ok) {
    const textResult = await textResponse.json()
    if (textResult.textResult && textResult.textResult.lines && textResult.textResult.lines.length > 0) {
      issues.push('Image contains text, Amazon main images should not have additional text')
    }
  }

  // Check if background is mostly white - simple check by sampling corners
  // For more accurate check, we could use more advanced analysis, this is MVP
  const imageBlob = new Blob([imageBuffer])
  const imageBitmap = await createImageBitmap(imageBlob)
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imageBitmap, 0, 0)
  
  // Sample four corners
  const corners = [
    {x: 5, y: 5},
    {x: imageBitmap.width - 5, y: 5},
    {x: 5, y: imageBitmap.height - 5},
    {x: imageBitmap.width - 5, y: imageBitmap.height - 5},
  ]
  
  let nonWhiteCount = 0
  for (const corner of corners) {
    const pixel = ctx.getImageData(corner.x, corner.y, 1, 1).data
    const [r, g, b] = pixel
    // Check if it's close to white
    if (r < 240 || g < 240 || b < 240) {
      nonWhiteCount++
    }
  }
  
  if (nonWhiteCount > 1) {
    issues.push('Background is not pure white, Amazon requires pure white background (RGB 255,255,255)')
  }
  
  // Check size
  if (imageBitmap.width < 1000 || imageBitmap.height < 1000) {
    issues.push(`Image size is ${imageBitmap.width}x${imageBitmap.height}, minimum 1000px on longest side required for Amazon zoom`)
  }
  
  // Check aspect ratio - Amazon prefers square
  const ratio = imageBitmap.width / imageBitmap.height
  if (ratio < 0.8 || ratio > 1.2) {
    issues.push('Image is not square, Amazon main images are expected to be square')
  }

  return {
    compliant: issues.length === 0,
    issues,
  }
}

async function uploadToR2(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const key = `processed/${Date.now()}-${fileName}`
  await s3Client.send(new PutObjectCommand({
    Bucket: R2.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))

  return `${R2.publicUrl}/${key}`
}

async function deductPoints(userId: string, count: number): Promise<boolean> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('remaining_points')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return false
  }

  if (user.remaining_points < count) {
    return false
  }

  await supabaseAdmin
    .from('users')
    .update({
      remaining_points: user.remaining_points - count,
    })
    .eq('id', userId)

  return true
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const operation = formData.get('operation') as string
    const userId = formData.get('userId') as string

    if (!file || !operation || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create processing record
    await supabaseAdmin.from('image_processing').insert({
      user_id: userId,
      operation_type: operation,
      original_url: 'uploaded',
      status: 'processing',
    })

    let processedBuffer: Buffer
    let processedContentType = file.type

    switch (operation) {
      case 'background':
        processedBuffer = await removeBackground(buffer)
        break
      case 'watermark':
        const selectionStr = formData.get('selection') as string
        const selection = JSON.parse(selectionStr)
        processedBuffer = await inpaintWatermark(buffer, selection, file.size, 0) // TODO: get actual dimensions
        break
      case 'upscale':
        processedBuffer = await upscaleImage(buffer, 2)
        break
      case 'compliance':
        const compliance = await checkCompliance(buffer)
        // Compliance check is free, no points deduction
        return NextResponse.json({ compliant: compliance.compliant, issues: compliance.issues })
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }

    // Deduct points
    const success = await deductPoints(userId, 1)
    if (!success) {
      return NextResponse.json({ error: 'Not enough points' }, { status: 400 })
    }

    // Upload to R2
    const processedUrl = await uploadToR2(processedBuffer, file.name, processedContentType)

    // Update processing record
    await supabaseAdmin.from('image_processing').update({
      processed_url: processedUrl,
      status: 'done',
    }).eq('user_id', userId).eq('status', 'processing')

    return NextResponse.json({ processedUrl })
  } catch (error: any) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 })
  }
}
