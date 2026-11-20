# DeKUT Soko (Kimathi Market) 🛍️🎓

A modern, high-speed **Buy & Sell student marketplace** built specifically for **Dedan Kimathi University of Technology (DeKUT)** comrades in Nyeri, Kenya.

Designed for peer-to-peer campus trade across **Batian, Nelion, Lenana, New Hall, Nyaribo, Kimathi Stage, Coffee Farm (Kahawa), Main Gate, Gate 2, and Nyeri Town**.

---

## 🌟 Key Features

### 1. 👥 Frictionless Buyer Experience (No Login Required)
- **Zero Registration Barrier**: Comrades looking to buy items don't need to create an account or log in.
- **Instant Search & Filters**: Search across categories (*Electronics, House Decor, Bedding & Furniture, Kitchen/Mekos, Academic Tools, Laptops/Phones, Bikes, etc.*).
- **Campus Location Filter**: Filter items by specific DeKUT locations (Batian, Nelion, Nyaribo, Kimathi Stage, etc.).
- **Local Favorites**: Bookmark favorite items saved directly to device storage without an account.

### 2. 💬 Direct WhatsApp Connect
- **1-Click WhatsApp Redirect**: Buyers can tap "WhatsApp" to immediately launch a chat with the seller.
- **Smart Phone Number Formatting**: Automatically formats Kenyan numbers (`07...`, `01...`, `+254...`, `254...`) to WhatsApp international standard.
- **Pre-filled Context Message**: Generates an intro message containing the item title, price, and campus location so the seller instantly knows what you're asking about.
- **Fallback Call & Share**: Direct phone call button and 1-click WhatsApp share button to spread deals on campus groups and status.

### 3. 🔐 Seller Account & Listing Management
- **Supabase Authentication**: Sellers create an account with email, full name, campus hostel/location, and WhatsApp number.
- **Seller Dashboard**: Manage active listings, mark items as **Sold**, delete listings, and track real-time view/inquiry counts.
- **Campus Badge & Verification**: Shows whether a seller is a verified DeKUT student.

### 4. ☁️ Cloudflare R2 Object Storage
- **Zero Egress Fees**: Image uploads use Cloudflare R2 S3-compatible endpoints (`@aws-sdk/client-s3`).
- **Client-Side Image Optimization**: Automatically resizes and compresses photos before uploading to save mobile data.
- **Built-in Fallback**: If R2 credentials have not yet been provided in `.env`, the app gracefully handles local image preview and data URLs so development and testing are never blocked.

### 5. 🛡️ Supabase Database & Security (RLS)
- PostgreSQL database hosted on Supabase.
- **Row Level Security (RLS)** policies:
  - Anonymous buyers have full read access to all active listings and categories.
  - Only authenticated sellers can insert listings.
  - Sellers can only modify or delete their own listings.

---

## 🚀 Tech Stack

- **Frontend**: Vite 8, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans font
- **Celebration Effects**: Canvas Confetti
- **Database & Auth**: Supabase (`@supabase/supabase-js`)
- **Storage**: Cloudflare R2 (`@aws-sdk/client-s3`)

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# Cloudflare R2 Configuration
VITE_R2_ACCOUNT_ID=your_cloudflare_account_id
VITE_R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret_access_key
VITE_R2_BUCKET_NAME=dekut-soko-images
VITE_R2_PUBLIC_DOMAIN=https://pub-xxxxxx.r2.dev
```

*(Note: The website includes an interactive **Demo Mode** with realistic DeKUT sample listings and sample seller profiles so it can run immediately even before configuring Supabase & R2).*

### 3. Setup Supabase Database
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and run it.
4. Copy your **Project URL** and **Anon Key** into `.env`.

### 4. Setup Cloudflare R2 Bucket
1. In Cloudflare Dashboard, navigate to **R2 > Create bucket** (e.g. `dekut-soko-images`).
2. Under bucket **Settings > Public Access**, allow public access via the `r2.dev` subdomain or connect a custom domain.
3. Under bucket **Settings > CORS Policy**, add:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```
4. In Cloudflare R2 Overview, click **Manage R2 API Tokens > Create API token** with *Object Read & Write* permissions.
5. Add the keys to `.env`.

### 5. Start Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

---

## 📍 DeKUT Locations Supported
- **Internal Hostels**: Batian Hostel, Nelion Hostel, Lenana Hostel, New Hall
- **Off-Campus & Gates**: Nyaribo, Kimathi Stage, Coffee Farm (Kahawa Road), Main Gate, Gate 2, Kangemi
- **Town & Transit**: Skuta, Nyeri CBD

---

## 🛡️ Campus Safety Guidelines
- Meet during daylight hours in public campus zones (e.g., Student Center, Resource Center, Main Gate Security).
- Always inspect physical items (gadgets, calculators, gas cylinders) in person.
- Pay via M-Pesa only **after** inspecting; confirm the M-Pesa name matches the comrade seller.
- Zero upfront booking or deposit fees.
