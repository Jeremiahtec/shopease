# Deploy ShopEase: website on Vercel, API + database on Render

```
Browser ──► Vercel (React website) ──API calls──► Render web service (Spring Boot) ──► Render PostgreSQL
                                                         ▲
                              Paystack webhook ──────────┘
```

You will do five things, in this order: **(1) put the code on GitHub, (2) create the API and database on Render, (3) create the website on Vercel, (4) tell the API where the website lives, (5) tell Paystack where the webhook is.**

## Read this first: free plans vs a real shop

| | Free plan | Why it matters |
|---|---|---|
| **Render web service** | 512 MB RAM and a very small slice of CPU; **goes to sleep after 15 minutes without traffic** and takes about a minute to wake up | The first visitor after a quiet period waits ~1 minute. Startup of a Spring Boot app can be slow on the free CPU. |
| **Render PostgreSQL** | 1 GB, **expires 30 days after creation** (14-day grace, then deleted) and **has no backups** | Your orders and users disappear if you forget. |
| **Vercel Hobby** | Free, but **limited to non-commercial personal use** by Vercel's own rules | A shop that takes money counts as commercial: you need Vercel Pro, or host the website elsewhere (for example a Render **Static Site**, which is also free, or Cloudflare Pages). |

**Free is fine for a demo or your project defence. For real customers**, use a paid Render web service and a paid Render PostgreSQL plan (backups, no sleeping), and a commercial-allowed host for the website. (Prices change, so check each provider's pricing page.)

---

## Step 1: Put the code on GitHub

Create **two** GitHub repositories and push each folder to its own repo:

* `shopease` (backend; contains `render.yaml` and the `Dockerfile` at its top level)
* `shopease-frontend` (website; contains `vercel.json`)

Never commit `.env` files (the `.gitignore` files already exclude them).

---

## Step 2: Render (API + database)

You need two secrets ready:
* a **Paystack test secret key** (`sk_test_...`: Paystack Dashboard → Settings → API Keys & Webhooks). The API will not start in production without one.
* a strong **admin password** for the first admin account.

1. Create a Render account and connect GitHub.
2. **New → Blueprint** → choose the `shopease` repo. Render reads `render.yaml` and shows a **database** (`shopease-db`) and a **web service** (`shopease-api`). Both are set to region **Frankfurt**, the closest Render region to Nigeria. Keep them in the **same region**.
3. Render asks you to fill the values marked "sync: false":

| Variable | What to enter now |
|---|---|
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | a strong password (you can change it after logging in) |
| `PAYSTACK_SECRET_KEY` | your `sk_test_...` key |
| `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `PAYSTACK_CALLBACK_URL` | put `https://placeholder.example` for now. You fix these in Step 4, once Vercel gives you the website address |
| `RESEND_API_KEY`, `MAIL_FROM` | leave empty for now (emails are only logged). See "Email" below |

   `JWT_SECRET` is generated for you, and the database details are filled in automatically.
4. Click **Apply**. The first build takes several minutes (it compiles the Java app inside Docker).
5. Open the service → **Logs**. Success looks like `Started ShopEaseApplication` and `Created admin account`.
6. Copy the service address, like `https://shopease-api-xxxx.onrender.com`, and open `https://shopease-api-xxxx.onrender.com/api/health`. You should see `{"status":"UP",...}`.

> **Not using the Blueprint?** New → Web Service → connect the repo → Runtime **Docker** → Health check path `/actuator/health/readiness` → add the same environment variables as in `render.yaml`, using `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` from your Render database's page (use the **internal** host).

---

## Step 3: Vercel (website)

1. Create a Vercel account and connect GitHub.
2. **Add New → Project** → import the `shopease-frontend` repo. Vercel detects **Vite** (build `npm run build`, output `dist`). Leave those defaults.
3. Open **Environment Variables** and add:

| Name | Value |
|---|---|
| `VITE_API_URL` | your Render address from Step 2, e.g. `https://shopease-api-xxxx.onrender.com` (**no trailing slash**) |
| `VITE_COMPANY_NAME` | your business name |
| `VITE_SUPPORT_EMAIL` | your support email |
| `VITE_COMPANY_ADDRESS` | your address (optional) |
| `VITE_LEGAL_REVIEWED` | `false` until a lawyer has checked the legal pages |

4. Click **Deploy**. You get an address like `https://shopease-xxxx.vercel.app`.

These values are baked in when the site is **built**, so after changing any of them you must **Redeploy** on Vercel.

Page refreshes and deep links (like `/products/3`) work because `vercel.json` sends every path to the app.

---

## Step 4: Tell the API where the website is

Back in Render → `shopease-api` → **Environment**, set (use your real Vercel address, **no trailing slash**):

| Variable | Value |
|---|---|
| `FRONTEND_URL` | `https://shopease-xxxx.vercel.app` |
| `CORS_ALLOWED_ORIGINS` | `https://shopease-xxxx.vercel.app` |
| `PAYSTACK_CALLBACK_URL` | `https://shopease-xxxx.vercel.app/payment/callback` |

Save: Render redeploys. (`CORS_ALLOWED_ORIGINS` must match the website address exactly, or the browser blocks every call.)

## Step 5: Paystack webhook

Paystack Dashboard → Settings → API Keys & Webhooks → **Webhook URL**:

`https://shopease-api-xxxx.onrender.com/api/payments/webhook`

---

## Step 6: Test everything

1. Open your Vercel address. The marketplace loads (the first call may take about a minute if the API was asleep).
2. Log in as the admin (`/login`), create a category.
3. Register a vendor (**I want to sell**), create the store, add a product.
4. In a private window register a customer, buy the product and pay with a Paystack **test card**. You should land on "Payment verified successfully" and the order should be **Paid**.
5. As the vendor: process → ship. As the customer: **I received my order**.
6. Check the legal pages and footer links.

## Email (password reset, order updates)

Until you set `RESEND_API_KEY`, no email is sent: the text only appears in the Render logs, and **"Forgot password?" will not work for real users**.
1. Create a Resend account, verify your domain, create an API key.
2. In Render set `RESEND_API_KEY` and `MAIL_FROM` (an address on your verified domain, like `ShopEase <no-reply@yourshop.com>`). Set **both**.

## Custom domains (recommended)

* Website: Vercel → Project → Settings → Domains → add `www.yourshop.com` and add the DNS records Vercel shows.
* API: Render → `shopease-api` → Settings → Custom Domains → add `api.yourshop.com` and the DNS record shown.
* Then update **all of these** to the new addresses: Vercel `VITE_API_URL` (and redeploy), Render `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `PAYSTACK_CALLBACK_URL`, the Paystack webhook URL, and the `connect-src` list in `vercel.json` (it currently allows `https://*.onrender.com`; add `https://api.yourshop.com`).

## Going live with real money

1. Swap `PAYSTACK_SECRET_KEY` for your **live** key (`sk_live_...`) in Render.
2. Do one small real purchase yourself.
3. Upgrade to paid Render plans and a commercial-allowed website host (see the table at the top).
4. Complete the checklist in `DEPLOYMENT.md` section 9 (legal review, backups, monitoring).

## Backups on Render

Free Render databases have **no backups**. From your own computer (needs PostgreSQL client tools), with the **External Database URL** from the database's page:

```bash
pg_dump "EXTERNAL_DATABASE_URL" | gzip > shopease-$(date +%F).sql.gz
```
Do this regularly and **before the 30-day expiry**. Paid Render databases include backups; still keep your own copies.

## When something goes wrong

| Symptom | Likely cause and fix |
|---|---|
| Browser console shows a **CORS** error | `CORS_ALLOWED_ORIGINS` on Render does not exactly match the website address (needs `https://`, no trailing slash, no path). Fix it and let Render redeploy. |
| The site loads but shows errors / "Is the backend running" | `VITE_API_URL` on Vercel is missing or wrong. Fix it and **redeploy** Vercel. |
| Very slow first load, then fine | The free Render service was asleep (about 1 minute to wake). Paid plans don't sleep. |
| Render deploy fails or "no open ports detected" | The free CPU is too small to start the app in time. Retry the deploy, or use a paid instance. |
| API logs: `Set ADMIN_PASSWORD...` / `PAYSTACK_SECRET_KEY must be set` / `JWT_SECRET` | A required variable is missing or still the sample value. |
| API cannot connect to the database | API and database are in different regions (the private address only works within one region), or the database expired. |
| After paying, Paystack lands on a 404 | `PAYSTACK_CALLBACK_URL` is wrong. It must be `https://<website>/payment/callback`. |
| Payment succeeded but the order stays Pending | The webhook URL is missing in Paystack, or the API was asleep. Open the order page (it re-checks) or call verify again. |
| "Too many attempts" on login | The rate limit (20 per minute per IP). Wait a minute. |
| Password-reset email never arrives | `RESEND_API_KEY` / `MAIL_FROM` not set or the sending domain is not verified. |

## Updating

Push to GitHub: Vercel and Render rebuild automatically. Both let you roll back to a previous deployment from their dashboards. Database changes run automatically at startup.
