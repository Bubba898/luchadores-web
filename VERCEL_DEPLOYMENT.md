# Vercel Deployment Configuration

This repository uses a monorepo structure with the Next.js frontend in the `frontend` directory.

## Deploying to Vercel

To deploy the frontend application to Vercel:

1. Import this repository in Vercel
2. In the project settings, configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`

The `frontend/vercel.json` file is already configured with:
- **Build Command**: `bun run build`
- **Install Command**: `bun install`
- **Bun Version**: 1.x

Vercel will automatically detect and use these settings when deploying.
