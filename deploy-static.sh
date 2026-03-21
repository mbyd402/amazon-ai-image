#!/bin/bash
# 静态文件部署脚本

echo "🚀 开始部署静态文件..."
echo "📁 当前public目录内容:"
ls -la public/

echo "📄 创建部署状态文件..."
cat > public/deploy-status.json << EOF
{
  "status": "deployed",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "STATIC_DEPLOY_$(date +%Y%m%d_%H%M%S)",
  "files": [
    "absolute-dashboard.html",
    "static-dashboard.html", 
    "static-login.html",
    "index.html",
    "_redirects"
  ]
}
EOF

echo "✅ 静态文件部署完成!"
echo "🌐 可访问的URL:"
echo "  - /absolute-dashboard.html (推荐)"
echo "  - /static-dashboard.html"
echo "  - /static-login.html"
echo "  - / (主门户)"