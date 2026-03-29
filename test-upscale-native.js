/**
 * Test script for Image Upscale API - uses native Node.js fetch
 * Tests: 1x, 2x, 4x upscale
 * Run with: node test-upscale-native.js
 */

const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

// Configuration
const API_URL = 'http://localhost:3000/api/process'
const TEST_IMAGE = path.join(__dirname, 'test-assets', 'test-watermark.png')
const OUTPUT_DIR = path.join(__dirname, 'test-output')
const TEST_USER_ID = '415dfc7e-e47b-4540-b2c2-f301d3cd7d03' // Your user ID from logs

// Create output directory if not exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function testUpscale(scale) {
  console.log(`\n🚀 Testing ${scale}x upscale...`)
  
  const imageBuffer = fs.readFileSync(TEST_IMAGE)
  const originalStats = fs.statSync(TEST_IMAGE)
  
  console.log(`📄 Original image: ${(originalStats.size / 1024 / 1024).toFixed(2)} MB`)
  
  const formData = new FormData()
  formData.append('image', imageBuffer, {
    filename: 'test-watermark.png',
    contentType: 'image/png',
  })
  formData.append('operation', 'upscale')
  formData.append('userId', TEST_USER_ID)
  formData.append('scale', scale)
  
  console.log(`📡 Sending request to ${API_URL}...`)
  const startTime = Date.now()
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData.getBuffer(),
      headers: formData.getHeaders(),
      signal: AbortSignal.timeout(120000), // 2 minutes timeout
    })
    
    const elapsed = Date.now() - startTime
    console.log(`⚡ Response received in ${elapsed}ms`)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log(`📥 API response:`)
    console.log(`  success: ${data.success}`)
    if (data.error) {
      console.log(`  error: ${data.error}`)
    }
    if (data.results) {
      console.log(`  results: ${data.results.length} result(s)`)
      console.log(`  points_deducted: ${data.points_deducted}`)
    }
    
    if (!data.success || !data.results || data.results.length === 0) {
      throw new Error(`API returned success=false: ${data.error || 'unknown error'}`)
    }
    
    // Decode base64 and save to file
    const resultUrl = data.results[0]
    const base64Data = resultUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    const outputPath = path.join(OUTPUT_DIR, `result-${scale}x.png`)
    fs.writeFileSync(outputPath, buffer)
    
    const fileSizeMB = (buffer.length / 1024 / 1024).toFixed(2)
    console.log(`✅ ${scale}x test PASSED! Output saved to: ${outputPath} (${fileSizeMB} MB)`)
    
    return outputPath
  } catch (error) {
    console.error(`❌ ${scale}x test FAILED:`, error)
    throw error
  }
}

async function runAllTests() {
  console.log('🎯 Starting Image Upscale API Tests')
  console.log('====================================')
  console.log(`Test image: ${TEST_IMAGE}`)
  console.log(`Output directory: ${OUTPUT_DIR}`)
  console.log(`API URL: ${API_URL}`)
  console.log(`User ID: ${TEST_USER_ID}`)
  
  const scales = ['1', '2', '4']
  const results = {}
  
  for (const scale of scales) {
    try {
      results[scale] = await testUpscale(scale)
    } catch (error) {
      console.error(`\n❌ Test failed for ${scale}x, stopping...`)
      process.exit(1)
    }
  }
  
  console.log('\n🎉 All tests PASSED!')
  console.log('====================================')
  console.log('Results:')
  for (const [scale, path] of Object.entries(results)) {
    console.log(`  ✅ ${scale}x: ${path}`)
  }
  console.log('\nYou can now test the UI in browser!')
}

runAllTests().catch(error => {
  console.error('\n💥 Test suite failed:', error)
  process.exit(1)
})
