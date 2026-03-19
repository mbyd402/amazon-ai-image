import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AI_API } from '@/lib/config'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function uploadToSupabase(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const path = `processed/${Date.now()}-${fileName.replace(/\s+/g, '-')}`
  const { data, error } = await supabaseAdmin.storage
    .from('images')
    .upload(path, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Supabase storage upload error:', error)
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`)
  }

  if (!data) {
    throw new Error('Failed to upload to Supabase Storage: no data returned')
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(path)

  return publicUrl
}

import FormDataModule from 'form-data'

async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  const form = new FormData()
  form.append('image_file', imageBuffer, {
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
    throw new Error('Remove.bg API failed')
  }

  const processedBuffer = Buffer.from(await response.arrayBuffer())
  return processedBuffer
}

async function inpaintWatermark(
  imageBuffer: Buffer, 
  selection: {x: number, y: number, width: number, height: number},
  originalWidth: number,
  originalHeight: number
): Promise<Buffer> {
  // We can't create canvas in Node.js, so we send the coordinates directly
  // Clipdrop accepts mask as a description of the rectangle, we create a white mask on black background
  const form = new FormData()
  form.append('image', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png',
  })
  
  // Create a simple mask buffer: all black except the selection is white
  // For now, we skip canvas creation and let Clipdrop handle it - we just pass the selection
  // This is a simplified approach for Node.js environment
  const maskBuffer = Buffer.alloc(originalWidth * originalHeight * 4)
  for (let y = 0; y < originalHeight; y++) {
    for (let x = 0; x < originalWidth; x++) {
      const offset = (y * originalWidth + x) * 4
      const inSelection = 
        x >= selection.x && 
        x <= selection.x + selection.width && 
        y >= selection.y && 
        y <= selection.y + selection.height
      
      // RGBA: white for selection, black otherwise
      if (inSelection) {
        maskBuffer[offset + 0] = 255 // R
        maskBuffer[offset + 1] = 255 // G
        maskBuffer[offset + 2] = 255 // B
        maskBuffer[offset + 3] = 255 // A
      } else {
        maskBuffer[offset + 0] = 0 // R
        maskBuffer[offset + 1] = 0 // G
        maskBuffer[offset + 2] = 0 // B
        maskBuffer[offset + 3] = 255 // A
      }
    }
  }
  
  form.append('mask', maskBuffer, {
    filename: 'mask.png',
    contentType: 'image/png',
  })

  const response = await fetch('https://clipdrop-api.co/image-inpainting/v1/inpaint', {
    method: 'POST',
    headers: {
      'x-api-key': AI_API.clipdrop.apiKey,
      ...form.getHeaders(),
    },
    body: form.getBuffer() as unknown as BodyInit,
  })

  if (!response.ok) {
    throw new Error('Clipdrop inpainting failed')
  }

  return Buffer.from(await response.arrayBuffer())
}

async function upscaleImage(imageBuffer: Buffer, scale: number = 2): Promise<Buffer> {
  const form = new FormData()
  form.append('image', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png',
  })
  form.append('scale', scale.toString())

  const response = await fetch('https://clipdrop-api.co/image-upscaling/v1/upscale', {
    method: 'POST',
    headers: {
      'x-api-key': AI_API.clipdrop.apiKey,
      ...form.getHeaders(),
    },
    body: form.getBuffer() as unknown as BodyInit,
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

  // First check for text
  if (AI_API.cloudmersive.apiKey) {
    try {
      const formData = new FormData()
      formData.append('imageFile', new Blob([new Uint8Array(imageBuffer)]))
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
    } catch (e) {
      console.warn('Cloudmersive error:', e)
    }
  }

  // Check if background is mostly white
  const imageBlob = new Blob([new Uint8Array(imageBuffer)])
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
    const pixelData = ctx.getImageData(corner.x, corner.y, 1, 1).data
    const r = pixelData[0]
    const g = pixelData[1]
    const b = pixelData[2]
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

async function deductPoints(userId: any, count: number): Promise<boolean> {
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
        processedBuffer = await inpaintWatermark(buffer, selection, file.size, 0)
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

    // Upload to Supabase Storage
    const processedUrl = await uploadToSupabase(processedBuffer, file.name, processedContentType)

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
