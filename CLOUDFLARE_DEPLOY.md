# Cloudflare Pages 部署指南

## 准备工作

1. **Cloudflare 账号**：已有账号可跳过
2. **创建 R2 存储桶**（可选，用于图片存储）：
   - 进入 Cloudflare Dashboard → R2 → 创建存储桶
   - 命名为 `amazon-ai-images`
   - 不需要绑定信用卡

## 部署步骤

### 方法一：Git 集成（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add Cloudflare Pages support"
   git push origin main
   ```

2. **在 Cloudflare 创建 Pages 应用**
   - 进入 Cloudflare Dashboard → Pages → 创建项目
   - 选择 GitHub 仓库
   - 构建配置：
     - **构建命令**: `npm run build`
     - **构建输出目录**: `.vercel/output/static`
   - 点击"保存并部署"

3. **设置环境变量**
   部署完成后，在设置中添加以下环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase anon key
   SUPABASE_SERVICE_ROLE_KEY=你的service role key
   REMOVE_BG_API_KEY=你的Remove.bg API Key
   CLIPDROP_API_KEY=你的Clipdrop API Key
   CLOUDMERSIVE_API_KEY=你的Cloudmersive API Key
   ```

### 方法二：Wrangler CLI 部署

```bash
# 安装 wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
wrangler pages deploy .vercel/output/static
```

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `REMOVE_BG_API_KEY` | ✅ | Remove.bg API Key ($2/100张) |
| `CLIPDROP_API_KEY` | ✅ | Clipdrop API Key |
| `CLOUDMERSIVE_API_KEY` | ❌ | Cloudmersive API Key（OCR 文字检测） |

## 注意事项

1. **sharp 依赖**：`sharp` 是 Node.js 原生模块，Cloudflare Workers 不支持。代码已添加兼容逻辑，在 Cloudflare 环境中会自动跳过 sharp 相关处理。

2. **超时限制**：Cloudflare Workers 免费版超时 10-30 秒，代码已调整为 8 秒超时。

3. **免费额度**：
   - Pages: 500 分钟构建/月，无限带宽
   - R2: 1GB 存储，100万次写入/1000万次读取
   - Workers: 10万请求/天

## 双平台部署

代码已兼容 Vercel 和 Cloudflare Pages：

- **Vercel 部署**：直接 push 到 GitHub，Vercel 会自动构建
- **Cloudflare 部署**：同上，在 Cloudflare Pages 创建项目

两个平台可以同时部署测试，不冲突。

## 验证部署

部署完成后，访问 `https://your-project.pages.dev` 测试：
1. 注册/登录
2. 上传图片测试 AI 处理功能
3. 检查各功能是否正常工作

## 故障排查

### 构建失败
- 检查环境变量是否正确设置
- 查看 Cloudflare 构建日志

### API 调用失败
- 检查 API Key 是否正确
- 查看 Cloudflare Functions 日志

### 图片处理超时
- Cloudflare 免费版超时限制较紧，可考虑升级到付费版
- 或使用 R2 存储 + Workers 处理图片
