# Cloudflare Pages Configuration

This file contains the recommended configuration for deploying the Burocrazia-Zero frontend on Cloudflare Pages.

## Build Settings

When setting up your Cloudflare Pages project, use these settings:

### Build Configuration

- **Framework preset**: Angular
- **Build command**: `cd frontend && npm install && npm run build`
- **Build output directory**: `frontend/dist/frontend/browser`
- **Root directory**: `/` (leave empty or set to repository root)

### Environment Variables

No environment variables are required for the frontend build. The API URL should be updated in `frontend/src/app/api.service.ts` before deployment to point to your production Cloudflare Worker URL.

### Node.js Version

The build uses Node.js 18+ by default. This is compatible with Angular 17.

## Deployment Steps

1. Connect your GitHub repository to Cloudflare Pages
2. Select the repository branch to deploy (e.g., `main` or `copilot/add-concierge-interface`)
3. Configure the build settings as shown above
4. Click "Save and Deploy"

## Custom Domain (Optional)

After deployment, you can add a custom domain in the Cloudflare Pages dashboard:

1. Go to your Pages project
2. Click on "Custom domains"
3. Add your domain (e.g., `burocrazia-zero.com`)
4. Follow the DNS configuration instructions

## Notes

- The frontend communicates with the Cloudflare Worker backend via HTTP API calls
- Make sure to update the `apiUrl` in `api.service.ts` to match your deployed Worker URL
- CORS is handled by the Worker, so no additional configuration is needed in Pages
