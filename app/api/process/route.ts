import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AI_API } from '@/lib/config'
import FormDataModule from 'form-data'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { autoRefreshToken: false, persistSession: false },
    storage: {
      retryAttempts: 3,
    }
  }
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

async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
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
  const form = new FormDataModule()
  form.append('image', imageBuffer as unknown as Blob, {
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
  
  form.append('mask', maskBuffer as unknown as Blob, {
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
  const form = new FormDataModule()
  form.append('image', imageBuffer as unknown as Blob, {
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

  // Use Cloudmersive API to check image compliance
  // Check for illegal content (nude, violence, etc.)
  const form = new FormDataModule()
  form.append('image', imageBuffer as unknown as Blob, {
    filename: 'check.png',
    contentType: 'image/png',
  })

  const response = await fetch('https://api.cloudmersive.com/video/image/nsfw/classify', {
    method: 'POST',
    headers: {
      'Apikey': AI_API.cloudmersive.apiKey,
      ...form.getHeaders(),
    },
    body: form.getBuffer() as unknown as BodyInit,
  })

  if (!response.ok) {
    // If API fails, we assume it's ok for MVP
    console.error('Cloudmersive compliance check failed')
    return { compliant: true, issues: [] }
  }

  const result = await response.json()
  const { pornScore, hentaiScore, sexyScore } = result

  // Threshold - adjust as needed
  if (pornScore > 0.3) issues.push('Pornographic content detected')
  if (hentaiScore > 0.3) issues.push('Hentai content detected')
  if (sexyScore > 0.5) issues.push('Explicit content detected')

  return {
    compliant: issues.length === 0,
    issues,
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const operation = formData.get('operation') as string
    const userId = formData.get('userId') as string
    const selection = formData.get('selection') ? JSON.parse(formData.get('selection') as string) : null

    if (!file || !operation || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Check compliance first
    const compliance = await checkCompliance(buffer)
    if (!compliance.compliant) {
      return NextResponse.json({
        error: 'Image does not comply with content policies',
        issues: compliance.issues,
      }, { status: 400 })
    }

    let processedBuffer: Buffer
    switch (operation) {
      case 'background':
        processedBuffer = await removeBackground(buffer)
        break
      case 'watermark':
        if (!selection) {
          return NextResponse.json({ error: 'Missing selection for watermark removal' }, { status: 400 })
        }
        processedBuffer = await inpaintWatermark(buffer, selection, selection.width, selection.height)
        break
      case 'upscale':
        processedBuffer = await upscaleImage(buffer)
        break
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }

    // Upload processed image to Supabase Storage
    const extension = 'png'
    const fileName = `${operation}-${Date.now()}.${extension}`
    const processedUrl = await uploadToSupabase(processedBuffer, fileName, `image/${extension}`)

    // Deduct one point from user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('remaining_points, total_points')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await supabaseAdmin
      .from('users')
      .update({
        remaining_points: user.remaining_points - 1,
      })
      .eq('id', userId)

    // Save processing history
    await supabaseAdmin
      .from('history')
      .insert({
        user_id: userId,
        operation,
        original_url: '',
        processed_url: processedUrl,
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      processedUrl,
      remainingPoints: user.remaining_points - 1,
    })
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
