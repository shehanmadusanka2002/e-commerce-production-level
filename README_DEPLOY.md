# 🚀 Atelier Full-Stack Vercel Deployment (100% Free)

You can host both your Frontend and Backend on Vercel for free, without a credit card.

## 1. Database (Supabase) - [PostgreSQL]
1. Go to [Supabase.com](https://supabase.com/) and sign up with GitHub.
2. Create a "New Project".
3. Under **Project Settings > Database**, find your **Connection String (URI)**.
4. **Save this URL.** You will need it for the Backend.

## 2. Backend (Vercel) - [NestJS]
1. Sign in to [Vercel.com](https://vercel.com/) with GitHub.
2. Click **Add New > Project** and import your repository.
3. Select the **`e-commerce-backend`** folder as the root.
4. Vercel will detect the `vercel.json` I created.
5. **Environment Variables:** Add these:
   - `DATABASE_URL`: (Your Supabase URI)
   - `JWT_SECRET`: `any_random_string`
   - `SUPABASE_URL`: (From Supabase project)
   - `SUPABASE_KEY`: (From Supabase project)
   - `NODE_ENV`: `production`
6. Click **Deploy**. You will get a URL like `https://atelier-api.vercel.app`.

## 3. Frontend (Vercel) - [React/Vite]
1. Click **Add New > Project** on Vercel again.
2. Import the SAME repository.
3. Select the **`e-commerce-frontend`** folder as the root.
4. **Environment Variables:**
   - `VITE_API_URL`: `https://atelier-api.vercel.app` (Use YOUR Backend URL)
5. Click **Deploy**.

---

### 💡 Why this is better:
- **No Credit Card**: Vercel's hobby tier is truly free.
- **Unified Platform**: Manage your entire stack in one dashboard.
- **Fast**: Vercel's global network makes your API lightning fast.
- **Database Persistence**: Supabase is a permanent database, so your products and users will never be deleted.
