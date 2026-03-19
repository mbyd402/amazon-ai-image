# amazon-ai-image

One-stop AI image tools for Amazon sellers.

## Features

- 🎨 **AI White Background** - Automatically create pure white background that meets Amazon requirements
- 🧹 **AI Watermark/Text/Logo Remover** - Remove unwanted elements from supplier images
- 🚀 **AI Image Upscale & Enhance** - Upscale images up to 4x, enhance quality for Amazon zoom
- ✅ **Amazon Compliance Check** - Check if your main image meets Amazon's policies

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS
- **Auth & Database**: Supabase
- **Payment**: PayPal
- **Storage**: Cloudflare R2
- **AI APIs**: Remove.bg, Clipdrop, Cloudmersive

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `REMOVE_BG_API_KEY`
- `CLIPDROP_API_KEY`
- `CLOUDMERSIVE_API_KEY`
- Cloudflare R2 credentials

### 3. Database Setup

Create the following tables in Supabase:

```sql
-- Users table (handled by Supabase Auth, add these columns)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS remaining_points INT DEFAULT 0;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0;

-- Or create your own users table:
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  remaining_points INT DEFAULT 0,
  total_points INT DEFAULT 0
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  package_type TEXT NOT NULL,
  points_added INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  paypal_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Image processing history
CREATE TABLE image_processing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  operation_type TEXT NOT NULL,
  original_url TEXT NOT NULL,
  processed_url TEXT,
  points_deducted INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pricing (Pay-as-you-go, points never expire)

- 🆓 **Free Trial**: $0 → 3 images
- 📦 **Mini**: $4.99 → 15 images
- 🚀 **Standard**: $14.99 → 50 images (most popular)
- 💎 **Pro**: $29.99 → 200 images / 30 days

## Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/amazon-ai-image)

## License

MIT
