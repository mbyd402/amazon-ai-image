# 从 Netlify 迁移到 Vercel 指南

## 📋 为什么迁移？

1. **Netlify 免费额度用尽** - 站点被暂停
2. **Vercel 更适合 Next.js** - 官方支持，构建优化更好
3. **更好的免费额度** - Vercel 提供更慷慨的免费套餐
4. **性能优化** - Vercel 对 Next.js 有专门的优化

## 🚀 快速迁移步骤

### 第一步：注册 Vercel 账户
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录（推荐）
3. 完成注册流程

### 第二步：导入 GitHub 仓库
1. 在 Vercel 控制台点击 "Add New" → "Project"
2. 选择 GitHub 仓库 `mbyd402/amazon-ai-image`
3. 点击 "Import"

### 第三步：配置项目设置
Vercel 会自动检测到 Next.js 项目，但需要确认以下设置：

#### 基础设置：
- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `/` (根目录)
- **Build Command**: `npm run build` (默认)
- **Output Directory**: `.next` (默认)
- **Install Command**: `npm install` (默认)

#### 环境变量配置：
需要在 Vercel 中设置以下环境变量：

**必需的环境变量：**
- `NEXT_PUBLIC_SUPABASE_URL` - 你的 Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 你的 Supabase Anon Key

**可选的环境变量（设置为空字符串避免构建失败）：**
- `REMOVE_BG_API_KEY` = ""
- `CLOUDMERSIVE_API_KEY` = ""
- `CLIPDROP_API_KEY` = ""
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` = ""
- `PAYPAL_CLIENT_SECRET` = ""
- `SUPABASE_SERVICE_ROLE_KEY` = ""

### 第四步：部署
1. 点击 "Deploy"
2. 等待构建完成（2-3分钟）
3. 获取 Vercel 分配的域名（如 `amazon-ai-image.vercel.app`）

## 🔧 技术细节

### 已准备的配置文件：
1. **`vercel.json`** - Vercel 部署配置
2. **`.vercelignore`** - 排除不必要的文件
3. **`package.json`** - 已适配 Next.js 14.1.0

### 项目兼容性检查：
✅ **Next.js 14.1.0** - 完全兼容 Vercel  
✅ **TypeScript** - 支持  
✅ **Tailwind CSS** - 支持  
✅ **Supabase** - 环境变量配置  
✅ **API Routes** - 动态路由支持  

### 构建优化：
1. **自动静态优化** - Vercel 会自动优化静态页面
2. **ISR（增量静态再生）** - 支持 Next.js 的 ISR 功能
3. **Edge Functions** - 可选的边缘函数支持

## 📊 性能对比

| 特性 | Netlify | Vercel |
|------|---------|--------|
| Next.js 优化 | 一般 | 优秀（官方支持） |
| 免费构建分钟 | 300分钟/月 | 100小时/月 |
| 带宽限制 | 100GB/月 | 100GB/月 |
| 服务器位置 | 有限 | 全球边缘网络 |
| 自动部署 | ✅ | ✅ |
| 预览部署 | ✅ | ✅ |

## 🛠️ 故障排除

### 常见问题：

#### 1. 构建失败
- 检查环境变量是否正确配置
- 查看 Vercel 构建日志
- 确保 `package.json` 中的依赖版本兼容

#### 2. Supabase 连接问题
- 确认 Supabase 环境变量在 Vercel 中已设置
- 检查 Supabase 项目是否活跃
- 验证 Supabase 密钥权限

#### 3. 页面404
- 检查路由配置
- 确认页面文件存在
- 查看构建日志中的路由生成信息

#### 4. 性能问题
- 启用 Vercel 的自动优化
- 使用 ISR 缓存动态内容
- 优化图片和静态资源

## 🔄 回滚到 Netlify（如果需要）

如果需要回滚到 Netlify：
1. 升级 Netlify 套餐或等待下个月重置
2. 重新连接 GitHub 仓库
3. 使用现有的 `netlify.toml` 配置

## 📞 支持

### Vercel 支持：
- 文档：https://vercel.com/docs
- 社区：https://vercel.com/community
- Discord：https://vercel.com/discord

### 项目特定问题：
检查以下页面进行诊断：
- `/debug` - 完整诊断工具
- `/dashboard-diagnosis` - Dashboard 特定诊断
- `/test-debug` - 基本路由测试

## ✅ 迁移完成检查清单

- [ ] Vercel 账户注册完成
- [ ] GitHub 仓库导入成功
- [ ] 环境变量配置完成
- [ ] 第一次构建成功
- [ ] 网站可正常访问
- [ ] Dashboard 登录功能正常
- [ ] API 路由工作正常
- [ ] 图片上传和处理功能正常

**迁移时间预估**：15-30分钟

**预计影响**：短暂停机（从 Netlify 暂停到 Vercel 部署完成）

---

**最后更新**：2026-03-22  
**项目状态**：准备迁移到 Vercel  
**当前问题**：Netlify 免费额度用尽，站点暂停