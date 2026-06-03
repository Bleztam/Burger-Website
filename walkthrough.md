# Developer Walkthrough - Wolfsburger Backend & AI Upgrade

We have fully implemented a production-grade restaurant back-office and AI concierge system for "Wolfsburger" (Brand: Wolfscrew). Below is the comprehensive architectural summary, detailed file lists, and deployment/testing instructions.

---

## 🛠️ Architectural Blueprint

```mermaid
graph TD
    User[Client Browser] -->|Take Quiz| Predictor[AI Flavour Predictor]
    User -->|Open Chat| Concierge[AI Concierge Chatbot]
    User -->|Add to Cart| CartContext[Cart Context]
    User -->|Share GPS| Roadmap[Roadmap Geolocation]
    
    Predictor -->|POST answers| PredictAPI[/api/predict-flavor]
    PredictAPI -->|Generate Combo| VercelAI[Vercel AI SDK & Gemini]
    
    Concierge -->|Stream chat & execute tools| ChatAPI[/api/chat]
    ChatAPI -->|Fetch menus & branches| SupabaseDB[(Supabase Database)]
    ChatAPI -->|Add to Cart| ToolCall[add_to_cart Tool result]
    ToolCall -->|Client callback| CartContext
    
    CartContext -->|Checkout cart| CheckAPI[/api/checkout]
    CheckAPI -->|Verify prices & insert orders| SupabaseDB
    
    Admin[Admin Staff] -->|Authenticate| Auth[Supabase Auth]
    Admin -->|Operations Panel| Dash[Admin Dashboard]
    Dash -->|Realtime Kanban| Realtime[Supabase Realtime Channel]
    Dash -->|Bucket Uploader| Storage[(Supabase Storage: burger-images)]
```

---

## 📂 Implementation Summary & Code File Inventory

The following files have been created or modified in the workspace:

### 1. Supabase Connection & Middleware Guards
* **[`lib/supabase/client.ts`](file:///c:/Users/USER/Desktop/Projects/burger-website/lib/supabase/client.ts)**: Configures the browser client using `@supabase/ssr` to coordinate JWT session storage.
* **[`lib/supabase/server.ts`](file:///c:/Users/USER/Desktop/Projects/burger-website/lib/supabase/server.ts)**: Configures the server client with standard cookies helper for Server Components, Actions, and API Routes.
* **[`middleware.ts`](file:///c:/Users/USER/Desktop/Projects/burger-website/middleware.ts)**: Integrates JWT session refreshing and acts as an Auth Guard protecting all routes matching `/admin` (redirecting unauthenticated operators to `/admin/login`).

### 2. Frontend Components & Main Integration
* **[`components/cart-provider.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/components/cart-provider.tsx)**: Persistent global Cart state managing cart totals, items, and single-click checkout payloads, integrated cleanly under React 19 rules.
* **[`app/layout.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/layout.tsx)**: Modified to wrap children in `CartProvider` and render the global floating `AiConciergeChatbot`.
* **[`app/page.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/page.tsx)**: Modified to inject our new landing page element `AiFlavorPredictor` immediately below the menu section.

### 3. Frictionless Checkouts & Routing Maps
* **[`app/api/checkout/route.ts`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/api/checkout/route.ts)**: Secure API processing cart checkout transactions, calculating prices server-side, and inserting records to `orders` and `order_items` tables.
* **[`components/roadmap-section.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/components/roadmap-section.tsx)**: Upgraded to pull live branch locations, compute the Great-Circle distance to nearest branch via GPS coords, and dynamically load Leaflet maps to draw dashed route overlays without build conflicts.

### 4. Advanced AI Engagements (Vercel AI SDK)
* **[`components/ai-concierge-chatbot.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/components/ai-concierge-chatbot.tsx)**: Slides out floating AI assistant that coordinates `useChat` streaming, renders Markdown, and intercepts completed `add_to_cart` tool executions to sync with the shopping cart!
* **[`app/api/chat/route.ts`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/api/chat/route.ts)**: Streams chat utilizing `@ai-sdk/google` (Gemini 1.5/2.5 Flash), offering grounded database query tools (`get_menu_items`, `get_branches`, and `add_to_cart`). Includes intelligent local fallbacks if API keys are missing.
* **[`components/ai-flavor-predictor.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/components/ai-flavor-predictor.tsx)**: Interactive 3-step mood, craving, and energy quiz, featuring an epic 3D-flip GSAP reveal card displaying recommended combos.
* **[`app/api/predict-flavor/route.ts`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/api/predict-flavor/route.ts)**: Generates highly customized structured JSON flavor combos using Vercel AI.

### 5. Secure Admin Dashboard (/admin)
* **[`app/admin/login/page.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/admin/login/page.tsx)**: Beautiful modern dark login screen with scale animations.
* **[`app/admin/layout.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/admin/layout.tsx)**: Shared dashboard structural layout with headers, side navigation, user email tags, and signOut triggers.
* **[`app/admin/page.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/admin/page.tsx)**: Structural entry page redirecting to dashboard.
* **[`app/admin/dashboard/page.tsx`](file:///c:/Users/USER/Desktop/Projects/burger-website/app/admin/dashboard/page.tsx)**: Massive back-office tabbed center combining:
  * **Live Order Console**: Kanban columns synced with Supabase Realtime Postgres triggers (`orders-realtime-console`) that update immediately.
  * **Menu Manager**: Grid allowing item creation, active toggling, deletion, and uploading files directly to a Supabase Storage bucket (`burger-images`).
  * **Branch Manager**: Forms to add branch nodes and coordinates, and toggling status between UNLOCKED and LOCKED.

---

## 🚀 Setup & Verification Guide

Follow these steps to deploy and test the entire backend and AI system:

### 1. Execute SQL Migrations
Execute the migrations listed in **Part 1** in your Supabase SQL Editor. This will configure tables, RLS security policies, and indexes.

### 2. Configure Supabase Storage Bucket
1. Go to the **Storage** section in your Supabase Dashboard.
2. Create a new bucket named **`burger-images`**.
3. Set the bucket access toggle to **Public**.
4. Set the following RLS policies under policies tab:
   * **Select Policy**: Allow anyone (public) to view images (`true`).
   * **Insert/Update/Delete Policy**: Restrict access to authenticated users only (`auth.role() = 'authenticated'`).

### 3. Initialize Admin Login
Create a restaurant operator account in Supabase to login to your Back-Office:
1. Go to **Authentication** -> **Users** -> **Add User** -> **Create User**.
2. Input your email (e.g. `operator@wolfscrew.com`) and password.
3. Use these credentials to sign in at `/admin/login`.

### 4. Install Local Packages & Run Server
Execute standard package installations in your workspace:
```bash
npm install --legacy-peer-deps
npm run dev
```

### 5. Verify Flows
1. **Chat Concierge**: Ask *"I have R$ 50 and want something spicy. What should I get and where?"* The bot will query live database tables, match the Cheesy Jalapeño under budget, suggest the Curitiba branch, and trigger the tool call adding the item to your cart!
2. **Flavor Predictor**: Select Mood: *Adventurous*, Craving: *Strictly Savory*, Energy: *Apex Beast*. Submit and watch the GSAP 3D card flip revealing your recommended combo! Click "Add Combo to Cart" and see it populate instantly.
3. **Live Orders**: Add items to your cart, click checkout (submitting to `/api/checkout`). Watch your order appear in real time on the `/admin/dashboard` Live Orders Kanban under `PENDING`. Click "Advance State" to watch it progress to `PREPARING` and `OUT_FOR_DELIVERY`!
