# Deploying ShopEase on your own server (Docker + Caddy)

> Prefer managed hosting? See **DEPLOY_VERCEL_RENDER.md** (website on Vercel, API + database on Render).

One server, three containers: **PostgreSQL**, the **Spring Boot API**, and **Caddy**, which gets a free HTTPS certificate, serves the React app, and forwards `/api` to the API. The database and API are not reachable from the internet.

```
Internet ──443──► Caddy ──/api/*──► Spring Boot API ──► PostgreSQL
                    └─ everything else ─► React app (static files)
```

## 1. What you need

* A small Linux server (1 vCPU / 2 GB RAM is enough to start) with Docker and the Docker Compose plugin.
* A domain name. Add an **A record** pointing at the server's IP (wait until it resolves).
* Ports **80 and 443** open in the server firewall.
* A **Paystack** account (use the test key first) and, recommended, a **Resend** account for email.

## 2. First deployment

```bash
# 1. put the three folders side by side on the server
#    shopease/  shopease-frontend/  shopease-deploy/
cd shopease-deploy

# 2. create your settings
cp .env.example .env
nano .env            # fill EVERY value (see the comments inside)

# 3. build and start
docker compose up -d --build

# 4. watch it start (look for "Started ShopEaseApplication")
docker compose logs -f api
```

Open `https://your-domain`. Caddy requests the certificate on the first visit (this can take a few seconds).

**Then, right away:**
1. Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and change the admin password (Profile).
2. Create a few categories (Admin → Categories).
3. Register a test vendor and customer, and run one order end to end with the Paystack **test** key.

The API refuses to start in production with the sample admin password, the sample JWT secret, or without a Paystack key. That is deliberate.

## 3. Paystack

1. Dashboard → Settings → **API Keys & Webhooks**.
2. **Webhook URL:** `https://your-domain/api/payments/webhook`
3. Callback URL is set automatically by the app to `https://your-domain/payment/callback`.
4. Test with `sk_test_...` and a Paystack test card. When everything works, put the `sk_live_...` key in `.env` and run `docker compose up -d`.
5. Make one real small purchase yourself before announcing the shop.

Refunds are **not** automated: cancelling a paid order restores stock but you refund the customer from the Paystack dashboard.

## 4. Email (Resend)

Without `RESEND_API_KEY` the app only *logs* emails, and **password-reset emails will never arrive**.
1. Create a Resend account, add and verify your domain, create an API key.
2. Set `RESEND_API_KEY` and `MAIL_FROM` (an address on your verified domain) in `.env`.
3. `docker compose up -d` and use "Forgot password?" to test.

## 5. Backups (do not skip)

```bash
./scripts/backup.sh                       # one backup into backups/
crontab -e                                # then add, for a daily 02:30 backup:
30 2 * * *  /full/path/to/shopease-deploy/scripts/backup.sh >> /var/log/shopease-backup.log 2>&1
```
Copy the `backups/` folder off the server regularly (another machine or cloud storage). **Test a restore** at least once: `./scripts/restore.sh backups/<file>.sql.gz` into an empty database.

## 6. Updating

```bash
git pull                                  # or copy the new code over
docker compose up -d --build              # database migrations run automatically on start
```
Take a backup first. To roll back, redeploy the previous code (migrations only ever add tables/columns, never delete).

## 7. Operating it

| Task | Command |
|------|---------|
| Logs | `docker compose logs -f api` (add `--since 1h`) |
| Status | `docker compose ps` |
| Restart the API | `docker compose restart api` |
| Health check (internal) | `docker compose exec api curl -s localhost:8080/actuator/health` |

Set up a free uptime monitor (UptimeRobot, Better Stack) on `https://your-domain/api/health`.

## 8. What the code already does for you

* HTTPS everywhere, security headers, and a Content-Security-Policy on the web app.
* Passwords hashed with BCrypt, password rules, JWT access + refresh tokens, role checks on every endpoint.
* Rate limiting on login, register, token refresh and password reset (per IP).
* Request size limit, request validation, one consistent JSON error format (no stack traces leak).
* Payments verified against Paystack (status **and** amount), webhook signature checked, and a payment can only complete once even if the webhook and the browser redirect arrive together.
* Stock is reserved atomically (no overselling); unpaid orders are cancelled after 2 hours and their stock is released.
* Graceful shutdown, database connection pool, health checks, JSON log rotation.
* Times are stored in UTC and shown in each visitor's own time zone.

## 9. Launch checklist

- [ ] DNS points at the server, HTTPS works, `http://` redirects to `https://`
- [ ] Strong `ADMIN_PASSWORD`, then changed again after first login
- [ ] `PAYSTACK_SECRET_KEY` is the **live** key; webhook URL saved in Paystack; one real test purchase done
- [ ] `RESEND_API_KEY` set; "Forgot password?" email received
- [ ] `SWAGGER_ENABLED=false` (the default)
- [ ] Daily backups running, one restore tested, copies stored off the server
- [ ] Uptime monitor on `/api/health`
- [ ] Legal pages (`/legal/terms`, `/legal/privacy`, `/legal/vendors`): set `VITE_COMPANY_NAME`, `VITE_SUPPORT_EMAIL`, `VITE_COMPANY_ADDRESS`, have a Nigerian lawyer review the text (check the 7-day return window and the vendor payout wording), then set `VITE_LEGAL_REVIEWED=true`
- [ ] Server firewall: only 22 (SSH, ideally key-only), 80 and 443 open; OS updates enabled

## 10. Known limits and next steps

* **Spring Boot 3.5 reached the end of free support in June 2026.** The project is on its final free release (3.5.16). Plan the upgrade to Spring Boot 4.x on a computer where you can build and run the tests, and keep Dependabot (already configured) on.
* **Rate limiting is in memory**, so it works for one API instance. If you run several instances, move it to a shared store (Redis) or the reverse proxy.
* **Login tokens live in the browser's localStorage.** The CSP header reduces the XSS risk, but an httpOnly-cookie session would be stronger. Changing a password does not sign out existing sessions until their tokens expire (60 minutes).
* **An order has one status for all its vendors**, and **refunds are manual**.
* **Product images are links** the vendor pastes. For real uploads, add Cloudinary (signed uploads from the browser) next.
* Customers who never tap "I received my order" leave the order at *Shipped*. Consider auto-confirming after a number of days.
* No admin audit log, two-factor authentication, or data-export/deletion tooling yet (needed for strict privacy-law compliance).
