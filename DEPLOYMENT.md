# Deployment Guide

This guide covers deploying AgentTrace to production as a SaaS platform.

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Clients   │────▶│   SDK        │────▶│   Your API    │
│  (Devs)     │     │ (Py/TS/JS)   │     │  (FastAPI)    │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
                                                  ▼
                    ┌─────────────────────────────────────┐
                    │                                     │
              ┌─────▼─────┐                    ┌────────▼────────┐
              │ PostgreSQL │                    │   Dashboard     │
              │ (Database) │                    │   (Next.js)     │
              └────────────┘                    └─────────────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────┐
                                                  │   Users      │
                                                  │  (Browser)   │
                                                  └──────────────┘
```

## Recommended Stack

### Option 1: Vercel + Railway (Easiest)

**Best for**: Getting to market fast, low traffic

**Dashboard**: Vercel ($20/month)
**API**: Railway ($5-20/month)
**Database**: Railway Postgres ($5/month)
**Redis**: Railway Redis ($5/month)

**Total cost**: ~$35-50/month

### Option 2: AWS/GCP/Azure (Scalable)

**Best for**: High traffic, enterprise customers

**Frontend**: Vercel or S3 + CloudFront
**API**: ECS/Cloud Run/App Service
**Database**: RDS/Cloud SQL ($50-200/month)
**Redis**: ElastiCache/MemoryStore ($15-50/month)
**Load Balancer**: ALB/Cloud Load Balancer ($15/month)

**Total cost**: ~$100-300/month

### Option 3: Self-Hosted (Full Control)

**Best for**: On-premise customers, full control

**Infrastructure**: DigitalOcean/Linode/Hetzner
- 2x 4GB droplets: $24/month
- Managed PostgreSQL: $15/month
- Managed Redis: $10/month

**Total cost**: ~$50/month

## Step-by-Step: Deploy to Vercel + Railway

### 1. Prepare Your Repository

```bash
cd /Users/sivaprakasam/projects/agents/agenttrace

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
gh repo create agenttrace --public --source=. --remote=origin --push
```

### 2. Deploy Database (Railway)

1. Go to https://railway.app
2. Sign up/login
3. Click "New Project" → "Provision PostgreSQL"
4. Copy the connection string (format: `postgresql://user:pass@host:port/db`)
5. Add Postgres plugin, click "New" → "Database" → "PostgreSQL"
6. Get the connection string from variables

### 3. Deploy Redis (Railway)

1. Same Railway project
2. Click "New" → "Database" → "Redis"
3. Copy the connection string

### 4. Deploy API (Railway)

1. Same Railway project
2. Click "New" → "GitHub Repo" → Select your repo
3. Set root directory: `apps/api`
4. Add environment variables:
   ```
   DATABASE_URL=<your-postgres-url>
   REDIS_URL=<your-redis-url>
   SECRET_KEY=<generate-random-key>
   ENVIRONMENT=production
   CORS_ORIGINS=["https://agenttrace.vercel.app"]
   ```
5. Railway will auto-deploy
6. Get your API URL (format: `https://your-app.up.railway.app`)

### 5. Initialize Database

```bash
# Connect to Railway database
railway link

# Run migrations
railway run python -c "
from app.database import engine, Base
from app.models import Trace, TraceStep, Project, APIKey
import asyncio

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(init_db())
"
```

### 6. Deploy Dashboard (Vercel)

1. Go to https://vercel.com
2. Import your GitHub repo
3. Set root directory: `apps/dashboard`
4. Add environment variable:
   ```
   API_URL=https://your-api.up.railway.app
   ```
5. Deploy
6. Get your dashboard URL: `https://agenttrace.vercel.app`

### 7. Update CORS

Go back to Railway API settings and update `CORS_ORIGINS` to include your Vercel URL.

### 8. Buy Domain

1. Go to https://namecheap.com or https://cloudflare.com/products/registrar/
2. Search for `agenttrace.io` (or your chosen domain)
3. Purchase (typically $10-15/year)

### 9. Configure DNS

Add these DNS records:

```
A     @               76.76.21.21    (Vercel IP)
CNAME api            your-api.up.railway.app
CNAME www            agenttrace.vercel.app
```

### 10. Configure Custom Domains

**Vercel**:
- Settings → Domains → Add `agenttrace.io` and `www.agenttrace.io`

**Railway**:
- Settings → Domains → Add `api.agenttrace.io`

## Environment Variables

### Production API (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/db

# Redis
REDIS_URL=redis://host:port/0

# Security
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_PREFIX=/v1
CORS_ORIGINS=["https://agenttrace.io","https://www.agenttrace.io"]

# Environment
ENVIRONMENT=production
```

### Production Dashboard (.env.local)

```bash
API_URL=https://api.agenttrace.io
NEXT_PUBLIC_API_URL=https://api.agenttrace.io
NODE_ENV=production
```

## Monitoring & Observability

### Set Up Error Tracking

Add Sentry to both API and Dashboard:

```bash
# API
pip install sentry-sdk[fastapi]

# Dashboard
pnpm add @sentry/nextjs
```

### Set Up Analytics

1. **PostHog** (free): https://posthog.com
2. **Plausible** ($9/month): https://plausible.io
3. **Google Analytics** (free)

### Set Up Uptime Monitoring

1. **BetterUptime** (free): https://betteruptime.com
2. **UptimeRobot** (free): https://uptimerobot.com

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Add API key authentication
- [ ] Set up database backups
- [ ] Enable SQL query logging (for debugging)
- [ ] Add request logging
- [ ] Implement user authentication (Auth0, Clerk, etc.)
- [ ] Set up proper error handling
- [ ] Add input validation
- [ ] Implement CSP headers

## Scaling Considerations

### Database Optimization

- Add indexes on frequently queried columns
- Set up read replicas for analytics
- Use connection pooling (already configured)
- Implement data retention policies

### API Scaling

- Increase Railway/server resources
- Add horizontal scaling (multiple instances)
- Implement caching with Redis
- Use background jobs for heavy processing

### Frontend Optimization

- Enable Vercel Edge caching
- Implement incremental static regeneration
- Add CDN for static assets
- Optimize images with Next.js Image

## Cost Optimization

### Free Tier (0-1000 traces/day)

- Vercel Hobby (free)
- Railway Hobby ($5/month)
- Total: **$5/month**

### Startup Tier (1K-10K traces/day)

- Vercel Pro ($20/month)
- Railway Pro ($20/month)
- Total: **$40/month**

### Growth Tier (10K-100K traces/day)

- Vercel Team ($20/month)
- Railway + Scaling ($50-100/month)
- Total: **$70-120/month**

## Monetization Strategy

### Pricing Tiers

**Free**:
- 1,000 traces/month
- 7-day retention
- Community support

**Starter** ($49/month):
- 50,000 traces/month
- 30-day retention
- Email support
- Basic integrations

**Pro** ($149/month):
- 500,000 traces/month
- 90-day retention
- Priority support
- All integrations
- Custom alerts

**Enterprise** (Custom):
- Unlimited traces
- Custom retention
- Dedicated support
- On-premise option
- SLA

## Go-to-Market Strategy

### Phase 1: Launch (Month 1-2)

1. Deploy MVP to production
2. Post on:
   - HackerNews (Show HN)
   - Reddit (r/MachineLearning, r/LocalLLaMA)
   - Twitter/X with demo video
   - Product Hunt
3. Write launch blog post
4. Create demo video (Loom)

### Phase 2: Growth (Month 3-6)

1. SEO content:
   - "How to debug AI agents"
   - "AI agent observability best practices"
   - Comparison with LangSmith
2. Integrations:
   - LangChain
   - LlamaIndex
   - AutoGPT
   - CrewAI
3. Community:
   - Discord server
   - Weekly office hours
   - Example projects

### Phase 3: Scale (Month 6+)

1. Enterprise features
2. Paid marketing
3. Conference talks
4. Partnership with AI frameworks

## Next Steps

1. Complete authentication system
2. Add billing integration (Stripe)
3. Build team collaboration features
4. Create comprehensive docs site
5. Set up customer support (Intercom/Crisp)

---

Good luck launching AgentTrace! 🚀
