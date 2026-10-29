# AgriNext deployment

## Architecture

- The frontend is React 19 with Vite 8 and React Router. Its entry point is `src/main.jsx`, routes are in `src/App.jsx`, and the production output is `dist`.
- `src` is now stored as ordinary files in the frontend repository rather than as an unmapped Git submodule, so a GitHub/Vercel checkout contains the application source.
- The backend is a separate Express 5 Node.js project. `index.js` starts the API, `routes.js` defines the endpoints, and `db.js` connects Mongoose to MongoDB.
- Crop images are uploaded by the backend to a public Supabase Storage bucket. The Supabase service-role key stays on the backend.
- All frontend API requests use the shared Axios client in `src/api.js`. It reads Vite's `VITE_API_URL`, trims trailing slashes, and falls back to the production Render API origin. Set `VITE_API_URL=http://localhost:3000` in a local `.env` file when running the backend locally.

## Before a public production launch

The existing authentication is not production-secure: passwords are stored and compared as plaintext, frontend identity is held in `localStorage`, and the API does not enforce authenticated ownership on protected operations. `localStorage` survives refreshes, but it is not proof of identity. Do not treat dashboard route checks or CORS as authorization. Implement password hashing, server-issued sessions/tokens, and authorization on protected API routes before exposing real user accounts or data publicly.

The current frontend also calls `/crop/update`, `/farmer/update`, and `/review/add`, but those endpoints are not registered in the inspected backend `routes.js`. Those related edit/review actions will not work until their backend handlers are implemented; this deployment setup does not invent their business rules.

## Environment variables

Set frontend values in Vercel and backend values in the Node host (Render below). Do not put backend values in Vercel frontend variables or commit `.env` files.

| Variable | Hosting location | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Vercel | `https://agrinext-git-trfk.onrender.com` (backend origin only; no route path) |
| `MONGO_URI` | Backend host | MongoDB Atlas connection string |
| `FRONTEND_URL` | Render | `https://agri-next-fzg36tb5m-np-5eb3.vercel.app` (comma-separate additional allowed origins; no trailing slash) |
| `SMTP_HOST` | Backend host | SMTP server used for signup/password OTP email |
| `SMTP_PORT` | Backend host | SMTP port (commonly `587`) |
| `SMTP_USER` | Backend host | SMTP username |
| `SMTP_PASS` | Backend host | SMTP password or provider app password |
| `EMAIL_FROM` | Backend host | Verified sender email address |
| `SUPABASE_URL` | Backend host | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Backend host | Existing server-side Supabase secret/service-role key |
| `SUPABASE_STORAGE_BUCKET` | Backend host | Name of the public bucket created for crop images |
| `PORT` | Backend host | Set automatically by the host; do not hardcode a production port |

`PORT` and `FRONTEND_URL` have local-development defaults. The backend `.env.example` documents the variables; fill local values into an ignored `.env` file. `VITE_API_URL` is public configuration, not a secret.

## Install and verify locally (PowerShell)

Frontend:

```powershell
Set-Location 'C:\Users\Admin\OneDrive\Desktop\Agri react\AgriNext'
npm ci
$env:VITE_API_URL = 'http://localhost:3000'
npm run build
npm run lint
```

Backend, in a separate terminal:

```powershell
Set-Location 'C:\Users\Admin\OneDrive\Desktop\AgriNext-Git'
npm ci
Copy-Item .env.example .env
# Edit .env with real local values; never commit it.
npm test
npm start
```

In another terminal, confirm the API and MongoDB connection:

```powershell
Invoke-RestMethod 'http://localhost:3000/health'
```

The health endpoint returns HTTP 200 only while MongoDB is connected. The crop upload endpoint returns a clear 503 until all Supabase image-storage variables are configured.

## MongoDB Atlas

1. Create a production cluster and a dedicated database user with only `readWrite` access to the AgriNext database. Do not use the Atlas project-owner account in the URI.
2. In **Network Access**, allow only the backend host's static outbound IPs where available. Do not allow the Vercel frontend to access MongoDB. If the selected backend plan has no static egress IP, use a backend provider/plan with static egress for production rather than broadly opening the database.
3. Copy the Atlas `mongodb+srv://` URI into backend `MONGO_URI`. URL-encode special characters in the database user's password and select the intended database name.
4. Keep TLS enabled (the Atlas URI's defaults do this). Never place the URI in frontend configuration or source control.

## Supabase crop-image storage

1. In the existing Supabase project, create a Storage bucket dedicated to crop images and make it public for image reads (the frontend renders `imageUrl` directly).
2. Use the bucket's exact name for backend `SUPABASE_STORAGE_BUCKET`.
3. Configure `SUPABASE_URL` and the existing server-side `SUPABASE_SECRET_KEY` on the backend host only. Never use the secret/service-role key in Vite, Vercel, or browser code.
4. The backend validates image type and limits uploads to 5 MB. Test a new crop upload after deployment; legacy crop records without an `imageUrl` remain readable.

## Deploy the backend on Render

1. Push the `AgriNext-Git` repository to GitHub.
2. In Render, create a **Web Service** from that backend repository. Use Node.js 22 or newer, the repository root as the root directory, `npm ci` as the build command, and `npm start` as the start command.
3. Set every backend environment variable from the table above in Render's environment settings. Set `FRONTEND_URL` to the final Vercel origin. Render supplies `PORT`.
4. Set the health-check path to `/health`, deploy, and confirm the service logs show MongoDB connected. Never paste secrets into build logs.
5. Copy the Render HTTPS service origin for `VITE_API_URL`.

## Deploy the frontend on Vercel

1. Push the `AgriNext` frontend repository to GitHub.
2. Import that repository into Vercel. Use the repository root (`.`) as the project root.
3. Use Node.js 22.12 or newer and confirm the Vite settings: build command `npm run build`, output directory `dist`, install command `npm ci`.
4. Add `VITE_API_URL` with the value `https://agrinext-git-trfk.onrender.com` in Vercel's environment settings for Production (and Preview if preview deployments should call the same backend). This is a public URL, not a secret.
5. Deploy. The root `vercel.json` sends deep links to the SPA entry point, so routes such as `/signin`, `/signup`, `/farmer-dashboard`, and `/customer-crops` can be opened or refreshed directly.
6. Set the Render `FRONTEND_URL` environment variable to `https://agri-next-fzg36tb5m-np-5eb3.vercel.app` (without a trailing slash). Include additional preview origins as comma-separated values only if they need API access. Redeploy/restart the backend after changing it.

## GitHub push commands

The frontend and backend are separate Git repositories. The frontend repository already had staged and unstaged changes before deployment work began. Review the complete staged diff in particular; a normal commit includes every staged change, not only the paths in the `git add` command. Do not use `git add -A` or commit changes you have not approved.

Frontend deployment files:

```powershell
Set-Location 'C:\Users\Admin\OneDrive\Desktop\Agri react\AgriNext'
git status --short
git diff --cached --stat
git diff --cached
git add .gitignore .env.example DEPLOYMENT.md vercel.json src/api.js src/App.jsx src/AddCrop.jsx src/Checkout.jsx src/CustomerCrops.jsx src/FarmerDashboard.jsx src/FarmerOrders.jsx src/MyCrops.jsx src/Order.jsx src/Signin.jsx src/Signup.jsx
git diff --cached --check -- .gitignore .env.example DEPLOYMENT.md vercel.json src/api.js src/App.jsx src/AddCrop.jsx src/Checkout.jsx src/CustomerCrops.jsx src/FarmerDashboard.jsx src/FarmerOrders.jsx src/MyCrops.jsx src/Order.jsx src/Signin.jsx src/Signup.jsx
# Commit only after confirming all staged frontend setup/migration changes are intended.
git commit -m "Prepare frontend for Vercel deployment"
git push
```

Backend:

```powershell
Set-Location 'C:\Users\Admin\OneDrive\Desktop\AgriNext-Git'
git status --short
git add .gitignore .env.example controller.js cropschema.js db.js index.js package.json package-lock.json routes.js supabase.js upload.js
git diff --cached --check
git commit -m "Prepare backend for production deployment"
git push
```

Review `git diff --cached` before either commit. Never stage `.env`.

## Live smoke test

- Open `/`, `/signin`, `/signup`, `/farmer-dashboard`, and `/customer-crops` directly and refresh each route.
- Sign up and verify OTP email; sign in and confirm the existing user state survives refresh. This is a functional check, not a security guarantee.
- Confirm crop catalog and dashboard requests succeed against the Render API.
- Upload a valid image with a new crop, then verify its public image renders from Supabase; confirm an unsupported or oversized image is rejected.
- Test logout and confirm the current client-side identity is cleared.
- Do not test payment flows as part of this deployment.
