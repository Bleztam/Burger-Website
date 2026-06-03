# Implementation Plan - Supabase & AI Upgrades for Wolfsburger

We are upgrading the animation-heavy Wolfsburger Next.js application into a production-grade restaurant platform. The upgrade integrates **Supabase** (Auth, DB, Realtime, Storage), custom **Geolocation Mapping**, a secure **Admin Console**, and two advanced **Vercel AI SDK** systems (an Intelligent Concierge Chatbot and an AI Flavour Predictor visual quiz).

---

## Part 1: Supabase Database Schema

Below is the complete PostgreSQL schema, including enum types, tables, constraints, and Row Level Security (RLS) rules. These should be executed in the Supabase SQL Editor.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Custom Enum Types
create type menu_category as enum ('burgers', 'drinks');
create type branch_status as enum ('UNLOCKED', 'LOCKED');
create type order_status as enum ('PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED');

-- 1. MENU ITEMS TABLE
create table menu_items (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric(10, 2) not null,
    category menu_category not null,
    image_url text,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. BRANCHES TABLE
create table branches (
    id serial primary key,
    name text not null,
    address text not null,
    latitude double precision not null,
    longitude double precision not null,
    status branch_status not null default 'UNLOCKED',
    step_order integer not null,
    hours text not null default 'Mon-Sun: 5PM - 12AM',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORDERS TABLE
create table orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    customer_phone text not null,
    delivery_address text not null,
    total_amount numeric(10, 2) not null,
    status order_status not null default 'PENDING',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDER ITEMS TABLE
create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    menu_item_id uuid not null references menu_items(id) on delete restrict,
    quantity integer not null check (quantity > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table menu_items enable row level security;
alter table branches enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Menu Items Policies
create policy "Allow public select for active menu items"
on menu_items for select
using (is_active = true);

create policy "Allow admin write access on menu_items"
on menu_items for all
to authenticated
using (true)
with check (true);

-- Branches Policies
create policy "Allow public select for all branches"
on branches for select
using (true);

create policy "Allow admin write access on branches"
on branches for all
to authenticated
using (true)
with check (true);

-- Orders Policies
create policy "Allow public insert for anonymous checkouts"
on orders for insert
with check (true);

create policy "Allow public select for self-tracking orders"
on orders for select
using (true); -- Orders are tracked using the secure generated UUID from localStorage

create policy "Allow admin write access on orders"
on orders for all
to authenticated
using (true)
with check (true);

-- Order Items Policies
create policy "Allow public insert for order items"
on order_items for insert
with check (true);

create policy "Allow public select for order items"
on order_items for select
using (true);

create policy "Allow admin write access on order_items"
on order_items for all
to authenticated
using (true)
with check (true);

-- Enable Realtime for Orders table to support status updates
alter publication supabase_realtime add table orders;
```

### Storage Bucket Setup
We will create a public storage bucket named `burger-images` for uploads.
* **Public Access**: Yes
* **RLS Policies**:
  * **Select**: Allow public access (`true`)
  * **Insert/Update/Delete**: Allow only `authenticated` admin roles.

---

## Part 2: Next.js Client Initializer Wrapper

To establish secure communication with Supabase across Client and Server Components in Next.js, we will create the following setup. We will install `@supabase/supabase-js` and `@supabase/ssr` to coordinate JWT session storage cleanly.

### Environment Configuration
We will define these environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 1. Browser Client Helper (Client-Side Components)
File: `[lib/supabase/client.ts](file:///c:/Users/USER/Desktop/Projects/burger-website/lib/supabase/client.ts)`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### 2. Server Client Helper (Server Components & Server Actions)
File: `[lib/supabase/server.ts](file:///c:/Users/USER/Desktop/Projects/burger-website/lib/supabase/server.ts)`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

### 3. Middleware Session Refresher (Auth Guard Protection)
File: `[middleware.ts](file:///c:/Users/USER/Desktop/Projects/burger-website/middleware.ts)`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect Admin Console: Redirect anonymous users trying to access /admin pages except /admin/login
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user && !request.nextUrl.pathname.startsWith('/admin/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    if (user && request.nextUrl.pathname.startsWith('/admin/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## Part 3: Frictionless No-Login Ordering & Map Routing

1. **Checkout Pipeline**: Create `/api/checkout` to process standard cart objects, create transactions using Supabase client, and return the `order.id` (UUID). The frontend will cache this UUID in `localStorage` (`wolfsburger_last_order`).
2. **Order Tracker Component**: Create an interactive tracking screen displaying active stage triggers (`PENDING` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`). Use Supabase Realtime client channel to bind custom state updates and trigger sleek GSAP scale and color pop elements without triggering layout shifts.
3. **Mapbox/Leaflet Routing Map**: Update `roadmap-section.tsx` to query user geolocation using `navigator.geolocation.getCurrentPosition`. Determine the nearest active branch via Great-Circle distance. If a user clicks an unlocked branch, render a custom map component drawing an SVG routing line from user coordinates to the branch coordinates.

---

## Part 4: Secure Admin Management Console (`/admin`)

We will introduce a clean, dark-themed premium design that coordinates administrative adjustments:
1. **Admin Login (`/admin/login`)**: Sleek modern form linked to Supabase Auth.
2. **Menu Manager (`/admin/menu`)**: A responsive grid to manage menu items, toggle `is_active`, delete entries, and upload images to `burger-images` with progress indication.
3. **Branch Manager (`/admin/branches`)**: Input fields for name, coordinates, `step_order`, and toggle status (`UNLOCKED` or `LOCKED`).
4. **Live Order Console (`/admin/orders`)**: A real-time Kanban board (Pending, Preparing, Out for Delivery, Delivered) where clicking any card advances it to the next step, updating the DB instantly and triggering Realtime client alerts.

---

## Part 5: Cutting-Edge AI Integrations (Vercel AI SDK)

1. **Intelligent Concierge Chatbot**:
   - A slide-out, glassmorphic conversational assistant floating at the bottom right.
   - Grounded with a system prompt dynamically loaded with active `menu_items` and branch addresses.
   - Equipped with **AI Tools** (`add_to_cart(id, qty)` and `find_closest_branch(lat, lng)`) allowing the model to perform direct operations when requested by the user.
2. **AI Flavour Predictor**:
   - A gorgeous 3-step slider/quiz: Current Mood, Sweet vs. Savory, and Energy Level.
   - Submits results to `/api/predict-flavor` running structured JSON analysis via Vercel AI SDK.
   - Returns a custom recommended menu combination with a stunning GSAP flip-card reveal in the center frame.

---

## Verification Plan

### Automated Build & Lint Check
We will verify codebase builds and TypeScript checks run error-free:
```powershell
npm run build
```

### Manual Verification Flows
1. **Database Schema Integration**: Use Supabase SQL editor to load definitions, and verify RLS policies block public inserts to menu items but allow orders.
2. **Checkout & Realtime Progress**: Test cart checkout, inspect localStorage, update order status in Supabase dashboard, and check if GSAP status transition scale animations trigger on the tracking panel.
3. **Location Mapping**: Click branch nodes, confirm coordinates matching, and verify route rendering.
4. **AI Assistants**:
   - Talk to Concierge: Request spicy items under $15 and verify "Add to Cart" function execution.
   - Take Flavour Quiz: Confirm quiz output and animation performance under Lenis smooth scroll.
