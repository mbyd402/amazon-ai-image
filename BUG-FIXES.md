# BUG-FIXES - 2026-03-31

今天解决的问题列表：

---

## 1. Vercel 构建报错 `ERR_PNPM_OUTDATED_LOCKFILE`

**问题原因：**
- `package.json` 中 `sharp` 版本与 `pnpm-lock.yaml` 不一致，导致 CI 构建失败。
- 之前为了解决 Vercel glibc 兼容性问题需要降级 `sharp` 到 0.32.x，但 `package.json` 没有改对。

**解决方法：**
- 将 `package.json` 中 `sharp` 版本改回 `^0.32.6`
- 重新生成 `pnpm-lock.yaml`，保证和 `package.json` 一致
- 提交后重新构建即可

---

## 2. 合规检查上传图片报错 `413 Request Entity Too Large FUNCTION_PAYLOAD_TOO_LARGE`

**问题原因：**
- Vercel Serverless Functions 默认限制请求体最大 4.5MB
- 原来所有操作都把整张图片传到后端处理，大图会触发限制

**解决方法：**
- **架构重构**：把合规检查拆分为前端检查 + 后端检查两步
  - 前端做 1-5 项基础检查，完全不依赖后端，彻底避免 413
  - 只有小图才调用后端做 6-7 项 API 检查

---

## 3. 完整实现 7 项合规检查 MVP

按照需求实现了全部 7 项检查：

| # | 检查项 | 实现位置 | 说明 |
|---|-------|---------|------|
| 1 | 文件大小 ≤ 10MB | ✅ 前端 | **选择文件阶段就拦截**超标的文件，根本不进入处理流程 |
| 2 | 图片格式必须是 JPG/PNG | ✅ 前端 | - |
| 3 | 最短边 ≥ 1000px 分辨率 | ✅ 前端 | 满足亚马逊 zoom 功能要求 |
| 4 | 1:1 正方形比例（允许 ±5% 误差） | ✅ 前端 | - |
| 5 | 纯白背景检查（抽样边缘） | ✅ 前端 | 对图片四条边缘采样共 40 个点检测，RGB ≥ 245 认为是纯白 |
| 6 | Cloudmersive OCR 文字检测（检测水印） | ✅ 后端 | 仅对 ≤ 4.5MB 图片调用 |
| 7 | Cloudmersive 不良内容检测 | ✅ 后端 | 仅对 ≤ 4.5MB 图片调用 |

---

## 4. 处理不同大小区间文件策略（兼容亚马逊要求和Vercel限制）

| 文件大小 | 处理策略 |
|---------|---------|
| **> 10MB** | ❌ 选择文件阶段直接拦截，提示亚马逊要求不超过10MB |
| **4.5MB ~ 10MB** | ✅ 前端完成全部 1-5 项基础检查，给出结果。提示跳过 OCR 和不良内容检测（因为符合亚马逊要求但超出Vercel限制） |
| **≤ 4.5MB** | ✅ 完整 7 项检查：前端 + 后端 API |

---

## 今天提交记录：

1. `fix: downgrade sharp to 0.32.6 for Vercel glibc compatibility, update pnpm-lock.yaml` - 解决构建报错
2. `fix: handle compliance check completely in frontend to avoid Vercel 413 Request Entity Too Large` - 初步修复 413 错误
3. `feat: complete all 7 compliance checks per MVP: add format/ratio/white-background check and implement cloudmersive OCR + nsfw check` - 完成全部 7 项检查
4. `fix: block over 10MB files on selection to prevent 413 error, split compliance check into frontend + backend steps` - 拦截超标的文件
5. `improve: handle 4.5MB-10MB files - complete frontend checks, skip backend API to avoid 413` - 完善中大小文件处理策略

---
