# MFETMS Deployment: Render Backend + Vercel Frontend

## Backend on Render

Use either the included `render.yaml` blueprint or create a manual Render Web Service.

### Manual Render settings

- Root Directory: `backend`
- Runtime: `Python`
- Build Command: `bash build.sh`
- Start Command: `bash start.sh`

Create a Render PostgreSQL database and set these backend environment variables:

```text
DEBUG=False
SECRET_KEY=<generated secret>
DATABASE_URL=<Render PostgreSQL internal connection string>
ALLOWED_HOSTS=<your-backend>.onrender.com
CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-frontend>.vercel.app
SESSION_COOKIE_SAMESITE=None
CSRF_COOKIE_SAMESITE=None
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

Optional first deploy seed:

```text
SEED_ON_DEPLOY=true
```

After first deploy, remove or set it to `false` so seed data is not re-applied on every deploy.

## Frontend on Vercel

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set this Vercel environment variable:

```text
VITE_API_BASE_URL=https://<your-backend>.onrender.com/api
```

After Vercel gives you a URL, update the Render backend variables:

```text
CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-frontend>.vercel.app
```

Redeploy both services after changing environment variables.
