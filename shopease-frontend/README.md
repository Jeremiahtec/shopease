# ShopEase Frontend

React 18 · Vite · Tailwind CSS 3 · React Router 6 · TanStack Query · lucide-react
Talks to the ShopEase Spring Boot API (`../shopease`).

> **Production?** See `../shopease-deploy/DEPLOYMENT.md`. Tests: `npm test`. If you host the built files on a static host instead, set `VITE_API_URL` and the backend's `CORS_ALLOWED_ORIGINS` (`public/_redirects` and `vercel.json` already handle client-side routes).

## Run it

1. Start the backend first (`mvn spring-boot:run`, port 8080).
2. In this folder:
   ```bash
   npm install
   npm run dev
   ```
3. Open **http://localhost:5173**

In development Vite proxies every `/api` request to `http://localhost:8080`, so there is nothing to configure and no CORS to fight.
For a deployed backend set `VITE_API_URL=https://your-api.example.com` (see `.env.example`).

## Try the whole flow

| Step | Where |
|------|-------|
| Register as **I want to sell** | `/register` → lands on `/vendor` |
| Create your store, then add a product (create a category from the product form) | Vendor hub |
| Log out, register as **I want to buy** | `/register` |
| Add to cart, checkout, pay | `/cart` → `/checkout` |
| With no `PAYSTACK_SECRET_KEY` the backend uses its mock gateway: you are redirected straight back to `/payment/callback` and the order becomes PAID | |
| Back in the vendor hub: process → ship → deliver the order | `/vendor/orders` |
| Leave a review on the product page | `/products/:id` |
| Admin: log in as `admin@shopease.com` / `Admin@12345` | `/login` → `/admin` |

## Pages (from your designs)

| Design | Route |
|--------|-------|
| Marketplace + filters | `/` |
| Product detail + reviews | `/products/:id` |
| Vendor storefront | `/stores/:id` |
| Cart (with empty state) | `/cart` |
| Express checkout | `/checkout` |
| Payment success / failed | `/payment/callback?reference=…` |
| Sign in / Create account | `/login`, `/register` |
| Customer account, order history, tracking modal, receipt | `/account/orders`, `/account/orders/:id` |
| Vendor dashboard, products, orders, store settings | `/vendor`, `/vendor/products`, `/vendor/orders`, `/vendor/settings` |
| Admin overview + category management | `/admin`, `/admin/categories` (+ `/admin/users`, `/admin/orders`) |

## Notifications & delivery

* Bell icon (customers in the navbar, vendors in the hub top bar) with a red unread badge; the full list lives at `/account/notifications` and `/vendor/notifications`.
* The vendor sidebar shows a red counter on **Orders** for paid orders waiting to be processed (checked every 30 seconds).
* Vendors mark an order **Shipped**; the customer taps **I received my order** on the order page to confirm arrival.

## Project layout

```
src/
  lib/          api.js (fetch + JWT refresh + guest session id), format.js (₦ money, dates)
  context/      AuthContext (login/register/logout + guest cart merge), ToastContext
  hooks/        useCart, useWishlist
  components/   ui.jsx (buttons, inputs, modal, pagination, badges…), Navbar, Footer, ProductCard…
  layouts/      PublicLayout, AccountLayout, DashboardLayout (vendor + admin shell)
  pages/        storefront pages, account/, vendor/, admin/
```

* **Theme:** Plus Jakarta Sans, indigo brand colour. The vendor hub switches to violet through the `.theme-vendor` CSS variables in `index.css`.
* **Money:** formatted as Nigerian naira. Change `VITE_CURRENCY` to switch.
* **Guest cart:** an anonymous visitor gets a random id in `localStorage`, sent as `X-Session-Id`. On login the app calls `POST /api/cart/merge`.
* **Auth:** access + refresh tokens in `localStorage`; an expired access token is refreshed automatically.

## Left out on purpose

Things in the mock-ups that the backend does not support yet: Google/Apple sign-in, coupon codes, shipping tiers and tax lines,
vendor ratings and badges, product colour variants, store follow, saved payment methods, parent categories and take-rates,
payout/escrow screens. The "escrow protection" marketing copy was replaced with accurate wording, because ShopEase pays
vendors through normal Paystack settlement and does not hold funds in escrow.
