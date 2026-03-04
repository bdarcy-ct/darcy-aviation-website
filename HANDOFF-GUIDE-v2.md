# Darcy Aviation — Complete Handoff Guide v2

**Prepared for:** Brent Darcy  
**Prepared by:** Ludwig (Kraftworks)  
**Date:** March 4, 2026  

---

## Progress So Far ✅

| Step | Status |
|------|--------|
| Cloudflare account created | ✅ Done |
| GitHub account created (bdarcy-ct) | ✅ Done |
| Railway account created | ✅ Done |
| Code pushed to Brent's GitHub | ✅ Done |
| Site deployed on Brent's Railway | ✅ Done |
| iPage domain unlock requested | ✅ Done |
| Cloudflare nameservers set in iPage | ✅ Done — waiting for propagation |
| EPP/Auth code requested from iPage | ⏳ Waiting (~24 hours) |
| Google Workspace setup | 🔲 Next |
| Domain transfer to Cloudflare | 🔲 After EPP code arrives |
| Email migration (IMAP) | 🔲 After Google Workspace |
| DNS records (website + email) | 🔲 After domain is on Cloudflare |

---

## What's Left — Step by Step

---

### Step 1: Set Up Google Workspace

**Time: ~10 minutes | Cost: $7/month**

Google Workspace gives Brent a professional email (brent@darcyaviation.com) plus Google Drive, Calendar, and Meet — all under his domain.

1. Go to **https://workspace.google.com/pricing**
2. Select **Business Starter** ($7/mo per user) — this is the cheapest plan
   - ⚠️ Don't select Business Standard ($14/mo) — Starter has everything needed
3. Click **Get Started**
4. Enter business info:
   - Business name: **Darcy Aviation LLC**
   - Number of employees: **Just you** (can add more later at $7/mo each)
5. Enter Brent's name and current email (for account recovery)
6. When asked "Do you have a domain?" → **Yes, I have a domain**
7. Enter **darcyaviation.com**
8. Create the admin email: **brent@darcyaviation.com**
9. Choose a strong password
10. Enter payment info

**⚠️ Google will ask to verify domain ownership** — skip this for now. We'll verify it after DNS is set up in Step 3.

**To add employee emails later:**
- Go to **admin.google.com** → **Users** → **Add new user**
- Each additional user (e.g., john@darcyaviation.com) costs $7/mo

---

### Step 2: Transfer Domain to Cloudflare

**Time: ~5 minutes | Cost: ~$10.11 (includes 1 year renewal)**

Once the EPP/Auth code arrives from iPage (via email):

1. Log into **Cloudflare** → go to **darcyaviation.com**
2. Click **Domain Registration** in the left sidebar → **Transfer Domains**
3. Enter **darcyaviation.com**
4. Paste the **EPP/Auth code** from iPage's email
5. Pay ~$10.11 (this extends the domain expiry to April 2027)
6. An approval email will be sent to the domain registrant email — **approve it**
7. Transfer can take 1-5 days to fully complete

**Note:** Since nameservers are already pointed to Cloudflare, the site won't go down during the transfer. DNS is already working through Cloudflare.

---

### Step 3: Configure DNS Records in Cloudflare

**Time: ~10 minutes**

Once Cloudflare is managing the domain, set up these DNS records.

#### 3a. Website DNS (Point domain to Railway)

1. In Brent's **Railway** dashboard → click on the darcy-aviation service
2. Go to **Settings** → **Networking** → **Custom Domain**
3. Add **darcyaviation.com** — Railway will show a CNAME target (something like `darcy-aviation-website-production.up.railway.app`)
4. Add **www.darcyaviation.com** as well

Now in **Cloudflare DNS**:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | *(Railway CNAME target from above)* | Proxied ☁️ |
| CNAME | www | darcyaviation.com | Proxied ☁️ |

#### 3b. Email DNS (Google Workspace)

These records tell the internet to deliver email to Google:

**MX Records (mail routing):**

| Type | Name | Mail Server | Priority |
|------|------|-------------|----------|
| MX | @ | ASPMX.L.GOOGLE.COM | 1 |
| MX | @ | ALT1.ASPMX.L.GOOGLE.COM | 5 |
| MX | @ | ALT2.ASPMX.L.GOOGLE.COM | 5 |
| MX | @ | ALT3.ASPMX.L.GOOGLE.COM | 10 |
| MX | @ | ALT4.ASPMX.L.GOOGLE.COM | 10 |

**TXT Records (verification + security):**

| Type | Name | Content |
|------|------|---------|
| TXT | @ | *(Google verification code — found in admin.google.com setup wizard)* |
| TXT | @ | v=spf1 include:_spf.google.com ~all |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:brent@darcyaviation.com |

**What these do:**
- **MX records** = route incoming mail to Google's servers
- **SPF** = tells other mail servers "Google is authorized to send email for our domain" (prevents spam rejection)
- **DMARC** = extra anti-spoofing protection

#### 3c. Verify Google Workspace Domain

1. Go to **admin.google.com** → **Domains**
2. Click **Verify** next to darcyaviation.com
3. Choose **TXT record** verification method
4. Copy the TXT value Google gives you
5. Add it as a TXT record in Cloudflare (shown in the table above)
6. Wait a few minutes, then click **Verify** in Google Admin
7. Once verified, email starts working!

---

### Step 4: Migrate Old Emails (IMAP Transfer)

**Time: ~15-60 minutes depending on mailbox size**

This pulls all of Brent's old emails from iPage into the new Google Workspace inbox. Do this **before** switching MX records so the old server is still accessible.

#### Option A: Google's Built-in Data Migration (Recommended)

1. Log into **admin.google.com** with brent@darcyaviation.com
2. Go to **Account** → **Data migration**
3. Click **Set up data migration**
4. Migration source: **Other IMAP server**
5. Enter iPage IMAP settings:
   - **Server:** mail.darcyaviation.com (or check iPage's email settings page)
   - **Port:** 993
   - **Security:** SSL
6. Connection protocol: **IMAP**
7. Role account: Enter Brent's **old email address** and **password** (the iPage email credentials)
8. Click **Start**
9. Click **Add user** → enter the old email as source, brent@darcyaviation.com as destination
10. Select what to migrate: **All mail** (or choose a date range)
11. Click **Start user migration**

Google will pull all emails in the background. Progress shows in the Data Migration dashboard. A small mailbox (< 1 GB) usually takes under an hour.

#### Option B: Manual with Email Client (Backup Option)

If Option A doesn't work:

1. Set up **Thunderbird** (free email client) on a computer
2. Add the **old iPage email** account (IMAP)
3. Add the **new Google Workspace** account (IMAP)
4. Select all emails in the old account → drag and drop to new account
5. Wait for sync to complete

#### What Gets Migrated:
- ✅ All emails (inbox, sent, folders)
- ✅ Read/unread status
- ✅ Folder structure
- ❌ Contacts (export separately as CSV → import to Google Contacts)
- ❌ Calendar events (export as .ics → import to Google Calendar)

#### Finding iPage IMAP Settings:
1. Log into iPage control panel
2. Go to **Email** → **Email Accounts**
3. Look for **IMAP/POP settings** or **Configure Email Client**
4. Common iPage IMAP settings:
   - Server: `mail.darcyaviation.com` or `imap.ipage.com`
   - Port: 993 (SSL) or 143 (non-SSL)
   - Username: full email address
   - Password: email account password

---

### Step 5: Final Verification Checklist

Test everything once DNS has propagated (usually 1-24 hours):

- [ ] **https://darcyaviation.com** loads the website with SSL ✅
- [ ] **https://www.darcyaviation.com** redirects properly ✅
- [ ] **darcyaviation.com/admin** — CMS login works (admin / darcy2026) ✅
- [ ] **"Book Now" buttons** link to FlightCircle ✅
- [ ] **brent@darcyaviation.com** can receive email (send a test) ✅
- [ ] **brent@darcyaviation.com** can send email (send from it) ✅
- [ ] Old emails appear in the new inbox ✅
- [ ] **Google Workspace admin** accessible at admin.google.com ✅
- [ ] Old iPage hosting can be cancelled ✅

---

## What Brent Owns After Handoff

| Service | Account Owner | Cost |
|---------|--------------|------|
| Cloudflare (domain + DNS) | Brent | ~$10/year |
| Google Workspace (email) | Brent | $7/month per user |
| Railway (website hosting) | Brent | $0-5/month |
| GitHub (code repository) | Brent (bdarcy-ct) | Free |
| FlightCircle (booking/payments) | Brent | Existing plan |
| **Total monthly** | | **~$8-13/month** |

---

## CMS Quick Reference

**URL:** darcyaviation.com/admin  
**Login:** admin / darcy2026

**What Brent can edit:**
- Page content (headlines, descriptions, all text)
- Fleet aircraft (photos, specs, availability)
- Training programs (descriptions, pricing)
- Experiences & tours (titles, prices, photos)
- Testimonials / reviews
- FAQ questions & answers
- SEO settings (meta titles, descriptions)
- Media uploads (photos, logos)

**Changes go live immediately** after clicking Save.

---

## Important Notes

- ⚠️ **NO Cirrus aircraft mentions** on the website — Cessna and Piper only
- 📞 FlightCircle handles all bookings and payments — no changes needed
- 🔒 CMS admin password should be changed after handoff
- 📧 Old iPage email/hosting can be cancelled **after** confirming everything works
- 🌐 Domain auto-renews through Cloudflare (~$10/yr)
- 💻 Code auto-deploys from GitHub — any push to master triggers a Railway rebuild

---

## Emergency Contacts

| Issue | Contact | How |
|-------|---------|-----|
| Domain / DNS | Cloudflare | cloudflare.com/support |
| Email | Google Workspace | admin.google.com → Support |
| Website hosting | Railway | railway.app/help |
| Website changes / bugs | Ludwig (Kraftworks) | (203) 300-7996 |
| Booking / scheduling | FlightCircle | 888-394-9909 |

---

*Prepared by Kraftworks — All accounts and credentials belong to Darcy Aviation LLC.*
