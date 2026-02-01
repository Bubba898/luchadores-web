# Vercel Deployment Configuration

This repository uses a monorepo structure with the Next.js frontend in the `frontend` directory.

## Deploying to Vercel

To deploy the frontend application to Vercel:

1. Import this repository in Vercel
2. In the project settings, configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

Vercel will automatically detect the Next.js application in the frontend directory once the Root Directory is configured.

Alternatively, you can deploy directly from the frontend directory by importing it as a separate project.
