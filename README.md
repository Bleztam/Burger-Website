# Wolfsburger Restaurant - Production Next.js Restaurant Platform
Brand: Wolfscrew

Welcome to the finalized, production-grade restaurant platform for **Wolfsburger**. We have successfully upgraded the animation-heavy Next.js frontend into a fully functional, high-performance, and feature-rich full-stack application. It now features a secure **Supabase Backend**, **Zero-Login Frictionless Ordering**, **Dynamic Geolocation Routing**, a **Secure Back-Office Console**, and two advanced **Vercel AI SDK (Gemini)** engines.

All animations (GSAP, Lenis smooth scroll) remain perfectly stable due to custom layout preservation.

---

## 🛠️ Complete Tech Stack
* **Core Framework**: Next.js 16 (App Router) & React 19
* **Backend Database & Realtime**: Supabase (Auth, PostgreSQL DB, Storage, Realtime)
* **AI Engine**: Vercel AI SDK Core (`ai`) paired with `@ai-sdk/google` (Gemini 1.5/2.5 Flash)
* **Styling**: Tailwind CSS v4 & custom design tokens
* **Animations**: GSAP (ScrollTrigger, MatchMedia, 3D card flips)
* **Smooth Scrolling**: Lenis.js (React wrapper)
* **Mapping**: Leaflet JS dynamic import (CartoDB dark theme)

---

## 📂 Completed Core Features

### 1. Supabase Postgres & Relational Constraints
We have established a robust, relational schema with custom enums, default UUID generations, constraints, index mappings, and custom Row Level Security (RLS) policies:
* **`menu_items`**: id (UUID, PK), name, description, price, category (Enum: burgers/drinks), image_url, is_active.
* **`branches`**: id (Serial, PK), name, address, latitude, longitude, status (Enum: UNLOCKED/LOCKED), step_order, hours.
* **`orders`**: id (UUID, PK), customer_name, customer_phone, delivery_address, total_amount, status (Enum: PENDING, PREPARING, OUT_FOR_DELIVERY, DELIVERED), created_at.
* **`order_items`**: id (UUID, PK), order_id (FK -> orders), menu_item_id (FK -> menu_items), quantity.

### 2. Geolocation Roadmap Routing
* Dynamic loading of unlocked branches directly from the `branches` database table.
* Queries user GPS coordinates via `navigator.geolocation.getCurrentPosition`.
* Automatically calculates and highlights the closest unlocked branch using the **Haversine formula**.
* Renders an interactive dark-mode map (via Leaflet CDN lazy injection to ensure React 19/Next 16 compilation compliance) drawing a dotted transit route from your exact coordinates directly to the selected branch.

### 3. Frictionless Zero-Login Checkout
* Persistent global `CartProvider` using React Context.
* A secure API route (`/api/checkout`) that verifies pricing server-side, generates atomic relational SQL entries inside `orders` and `order_items` tables, and returns the order UUID.
* Caches the UUID inside the user's browser `localStorage` to display real-time status trackers (Pending, Preparing, Out for Delivery, Delivered) via GSAP status scale animations.

### 4. Advanced AI Integrations
* **AI Concierge Chatbot (`components/ai-concierge-chatbot.tsx`)**: Glassmorphic, floating chat interface powered by Gemini 1.5/2.5 Flash. It has real-time tool-calling bindings to look up active menu items, check branch hours, and dispatch an `add_to_cart` call that physically populates your client cart.
* **AI Flavour Predictor Quiz (`components/ai-flavor-predictor.tsx`)**: An interactive, 3-question mood, craving, and energy quiz. It passes inputs to `/api/predict-flavor` running structured JSON analysis via Vercel AI, and returns a tailored combination revealed by a stunning GSAP 3D-card flip and scale animation, complete with a single-click "Add Combo to Cart" button.

### 5. Secure Admin back-office Console (`/admin`)
* **Route Guards**: Next.js `middleware.ts` enforces Supabase Auth, blocking anonymous requests and redirecting operators to `/admin/login`.
* **Live Order Kanban**: Columns linked to Supabase Realtime channel (`orders-realtime-console`) that update instantly. Operators can click to advance order states.
* **Menu Bucket Manager**: Dashboard grid where operators can add/delete menu items, toggle active status, and upload pictures directly to the `burger-images` Supabase Storage bucket.
* **Branch Timeline Editor**: Allows operators to add locations, coordinate variables, step positions, and toggle status.

---

## ⚡ Environment Configuration (`.env.local`)

Add these variables to your environment configuration to connect the systems:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Vercel AI SDK - Gemini Key (Choose one or both)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🚀 Setup & Finalization Checklist

To bring this project fully live in development and production, complete this checklist:

### Step 1: Database Setup
1. Open the **Supabase Dashboard** for your project.
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy and execute the complete SQL migration scripts located in your workspace documentation at [walkthrough.md](file:///C:/Users/USER/.gemini/antigravity/brain/de8ceb3b-f83c-48ae-b6cf-517f6efa05ca/walkthrough.md) or [implementation_plan.md](file:///C:/Users/USER/.gemini/antigravity/brain/de8ceb3b-f83c-48ae-b6cf-517f6efa05ca/implementation_plan.md).
4. Go to **Database** -> **Replication** -> **Source** and ensure `supabase_realtime` has `orders` table active.

### Step 2: Storage Bucket Activation
1. Go to **Storage** in your Supabase panel and click **Create a new bucket**.
2. Name the bucket **`burger-images`**.
3. Toggle **Public** to `ON` so images can load inside cards.
4. Add these policies under bucket RLS settings:
   * **SELECT**: Public Read (Expression: `true` for all).
   * **INSERT/UPDATE/DELETE**: Authenticated Role Only (Expression: `auth.role() = 'authenticated'`).

### Step 3: Seed Initial Data
Add menu items and branches in your Database to make the site interactive:
* You can add items directly inside the Supabase tables, or go straight to `/admin/login`, log in as an operator, and use the **Menu Manager** and **Branch Manager** dashboards to easily register your burgers, craft drinks, and geographic branches!

### Step 4: Run Locally
```bash
# Install dependencies with React 19 flags
npm install --legacy-peer-deps

# Spin up Next.js dev server
npm run dev
```

### Step 5: Vercel Production Deployment
To deploy this project to Vercel:
1. Initialize a Git repository in this folder (`git init`, commit your changes).
2. Create a GitHub repository and push your branch.
3. Import the repository into your Vercel Dashboard.
4. Add all environment variables from your `.env.local` to **Environment Variables** in Vercel.
5. Click **Deploy**! Vercel handles standard Next.js building seamlessly.

---

## 📂 Technical Support & Documentation

* **Complete Walkthrough**: Check out the comprehensive file index, database replication charts, and validation guides in the workspace directory at [walkthrough.md](file:///C:/Users/USER/.gemini/antigravity/brain/de8ceb3b-f83c-48ae-b6cf-517f6efa05ca/walkthrough.md).
* **Implementation Plan**: Details on schema designs and Next.js server helpers at [implementation_plan.md](file:///C:/Users/USER/.gemini/antigravity/brain/de8ceb3b-f83c-48ae-b6cf-517f6efa05ca/implementation_plan.md).
* **Realtime Orders**: Live channels use `orders-realtime-console` to sync order state updates instantly.
