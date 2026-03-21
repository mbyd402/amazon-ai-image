#!/bin/bash
# Netlify构建脚本
# 专为Netlify环境优化

echo "🔧 Starting Netlify build..."

# 检查环境变量
echo "📊 Environment check:"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "CLIPDROP_API_KEY: ${CLIPDROP_API_KEY:+set}"
echo "CLOUDMERSIVE_API_KEY: ${CLOUDMERSIVE_API_KEY:+set}"
echo "REMOVE_BG_API_KEY: ${REMOVE_BG_API_KEY:+set}"
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:+set}"

# 如果缺少必需的环境变量，设置默认值
if [ -z "$CLIPDROP_API_KEY" ]; then
  export CLIPDROP_API_KEY="optional_for_build"
fi

if [ -z "$CLOUDMERSIVE_API_KEY" ]; then
  export CLOUDMERSIVE_API_KEY="optional_for_build"
fi

if [ -z "$REMOVE_BG_API_KEY" ]; then
  export REMOVE_BG_API_KEY="optional_for_build"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  export NEXT_PUBLIC_SUPABASE_URL="optional_for_build"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="optional_for_build"
fi

# 运行构建
echo "🚀 Running Next.js build..."
npx next build

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
  echo "✅ Build completed successfully!"
  exit 0
else
  echo "❌ Build failed with exit code $BUILD_EXIT_CODE"
  
  # 如果构建失败，尝试备用方案
  echo "🔄 Trying alternative build approach..."
  
  # 删除.next目录
  rm -rf .next
  
  # 使用更简单的构建命令
  npx next build --debug
  
  ALTERNATIVE_EXIT_CODE=$?
  
  if [ $ALTERNATIVE_EXIT_CODE -eq 0 ]; then
    echo "✅ Alternative build succeeded!"
    exit 0
  else
    echo "❌ All build attempts failed"
    echo "📋 Last 50 lines of build output:"
    tail -50 .next/build.log 2>/dev/null || echo "No build log found"
    exit 1
  fi
fi