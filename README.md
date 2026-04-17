# VitalityTrack Vr4

AI-powered health and nutrition tracker for users and coaches.

## 🚀 Deployment

This project is optimized for deployment on **Vercel** and **GitHub Pages**.

### 1. Deploy to Vercel (Recommended)

Vercel provides the easiest deployment experience for Vite-based React apps.

1. **Push your code to GitHub.**
2. Go to [Vercel](https://vercel.com/new).
3. Import your repository.
4. **Environment Variables**: Add the following in the Vercel dashboard:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
5. Click **Deploy**.

### 2. Deploy to GitHub Pages

1. **Setup**:
   - Install the `gh-pages` package: `npm install gh-pages --save-dev`
   - Add the following to your `package.json`:
     ```json
     "homepage": "https://username.github.io/repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
     ```
2. **Base Path**: If your site is not at the root (e.g., `username.github.io/repo-name`), update `vite.config.ts`:
   ```ts
   export default defineConfig({
     base: '/repo-name/',
     // ...
   })
   ```
3. **Run**: `npm run deploy`

## 🛠 Features

- **AI Translation**: Dynamic UI translation using Gemini AI.
- **Health Tracking**: Recharts-powered dashboards for nutrition and activity.
- **Supabase Integration**: Real-time data storage and profile management.
- **PWA Ready**: Optimized for mobile and desktop views.

## 🔑 Environment Variables

Create a `.env` file for local development:

```env
GEMINI_API_KEY=your_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
