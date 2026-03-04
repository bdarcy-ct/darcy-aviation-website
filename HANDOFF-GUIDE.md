# Darcy Aviation — Domain, Email & Hosting Handoff Guide

**Prepared for:** Brent Darcy
**Prepared by:** Ludwig (Kraftworks)
**Date:** March 2, 2026

---

## Overview

We're moving darcyaviation.com to Brent's own infrastructure so he fully owns and controls everything — domain, email, website hosting, and code.

**Current setup:**
- Domain: darcyaviation.com (iPage / Network Solutions, expires April 21, 2026)
- Website: Hosted on Ludwig's Railway account
- Email: None set up on the domain yet

**Target setup:**
- Domain: Cloudflare (~$10/yr)
- Email: Google Workspace ($7/mo) → brent@darcyaviation.com
- Hosting: Brent's own Railway account (free–$5/mo)
- Code: Brent's own GitHub repository

**Estimated monthly cost:** ~$7-12/mo
**Estimated one-time transfer cost:** ~$10 (domain transfer includes 1 year renewal)

---

## Step 1: Unlock Domain & Get Transfer Code

**Time: ~5 minutes**

Brent's domain is currently at iPage (Network Solutions). We need to transfer it to Cloudflare.

1. Go to **https://www.ipage.com** → Log in with Brent's account
2. Navigate to **Domains** → **My Domains**
3. Click on **darcyaviation.com**
4. Find **Domain Lock** → Turn it **OFF** (unlock)
5. Find **Transfer** or **Auth/EPP Code** → Request it
6. Check Brent's email (Yahoo) for the EPP code — save it, we'll need it in Step 3

**⚠️ Important:** The domain status shows "client transfer prohibited" — this is just the standard lock. Unlocking it removes this.

---

## Step 2: Create Accounts

**Time: ~10 minutes**

### 2a. Cloudflare Account
1. Go to **https://cloudflare.com** → Sign up
2. Use Brent's email
3. Free plan is fine — we only need DNS + domain registration

### 2b. GitHub Account
1. Go to **https://github.com** → Sign up
2. Username suggestion: `darcy-aviation` or `brentdarcy`
3. Free plan is fine

### 2c. Railway Account
1. Go to **https://railway.app** → Sign up with GitHub (from step 2b)
2. Free tier works for this site
3. Hobby plan ($5/mo) if he needs more resources later

### 2d. Google Workspace (for email)
1. Go to **https://workspace.google.com** → Get Started
2. Choose **Business Starter** ($7/mo per user)
3. Use darcyaviation.com as the domain
4. Create brent@darcyaviation.com as the primary mailbox
5. **Note:** Google will ask to verify domain ownership — we'll do this after DNS is set up in Step 4

---

## Step 3: Transfer Domain to Cloudflare

**Time: ~5 minutes (+ up to 5 days for transfer to complete)**

1. In Cloudflare dashboard → **Add a Site** → enter `darcyaviation.com`
2. Choose **Free** plan
3. Cloudflare will scan existing DNS records — review and confirm
4. Go to **Domain Registration** → **Transfer Domains**
5. Enter `darcyaviation.com`
6. Paste the **EPP/Auth code** from Step 1
7. Pay ~$10.11 (includes 1 year renewal, extends expiry to April 2027)
8. Approve the transfer confirmation email that goes to Brent's Yahoo

**While transfer is pending:** We can still set up DNS immediately by pointing iPage nameservers to Cloudflare. Cloudflare will show you the new nameservers (e.g., `ada.ns.cloudflare.com`). Go back to iPage and update nameservers there.

---

## Step 4: Set Up DNS Records

**Time: ~5 minutes**

Once Cloudflare is managing DNS, add these records:

### Website (Railway)
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | *(Railway custom domain URL — we'll get this in Step 5)* | Auto |
| CNAME | www | darcyaviation.com | Auto |

### Email (Google Workspace)
| Type | Name | Priority | Value | TTL |
|------|------|----------|-------|-----|
| MX | @ | 1 | ASPMX.L.GOOGLE.COM | Auto |
| MX | @ | 5 | ALT1.ASPMX.L.GOOGLE.COM | Auto |
| MX | @ | 5 | ALT2.ASPMX.L.GOOGLE.COM | Auto |
| MX | @ | 10 | ALT3.ASPMX.L.GOOGLE.COM | Auto |
| MX | @ | 10 | ALT4.ASPMX.L.GOOGLE.COM | Auto |
| TXT | @ | — | *(Google verification TXT record)* | Auto |

### SPF & DMARC (email deliverability)
| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | @ | v=spf1 include:_spf.google.com ~all | Auto |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:brent@darcyaviation.com | Auto |

---

## Step 5: Deploy Website to Brent's Railway

**Time: ~15 minutes**

### Push code to Brent's GitHub
1. Ludwig will push the Darcy Aviation codebase to Brent's new GitHub repo
2. Repository will include everything: frontend, backend, CMS admin, database

### Connect Railway to GitHub
1. Log into Brent's Railway account
2. **New Project** → **Deploy from GitHub Repo**
3. Select the `darcy-aviation` repository
4. Railway will auto-detect the build settings

### Set Environment Variables
In Railway project settings, add:
```
NODE_ENV=production
PORT=3000
```
*(We'll add any other env vars needed during setup)*

### Custom Domain
1. In Railway → **Settings** → **Custom Domain**
2. Add `darcyaviation.com` and `www.darcyaviation.com`
3. Railway will give a CNAME target — add this to Cloudflare DNS (Step 4)
4. SSL certificate auto-provisions via Railway

### Verify
- Visit https://darcyaviation.com — site should load with SSL ✅
- Visit https://darcyaviation.com/admin — CMS should work ✅
- Send a test email to brent@darcyaviation.com ✅

---

## Step 6: Verify Everything Works

**Final checklist:**

- [ ] darcyaviation.com loads the website
- [ ] www.darcyaviation.com redirects properly
- [ ] SSL certificate is active (green lock)
- [ ] /admin CMS login works (admin / darcy2026)
- [ ] brent@darcyaviation.com receives email
- [ ] brent@darcyaviation.com can send email
- [ ] Old iPage hosting can be cancelled

---

## After Setup: What Brent Needs to Know

### Monthly Costs
| Service | Cost |
|---------|------|
| Cloudflare (domain + DNS) | ~$10/year |
| Google Workspace (email) | $7/month |
| Railway (hosting) | $0-5/month |
| **Total** | **~$8-13/month** |

### CMS Access
- **URL:** darcyaviation.com/admin
- **Login:** admin / darcy2026
- **What he can edit:** Experiences, training programs, fleet info, testimonials, all page content
- **Changes go live immediately** after saving

### Support
- Ludwig / Kraftworks available for ongoing maintenance and updates
- Website code is on Brent's GitHub — he owns it completely

---

## Emergency Contacts

| What | Who | Contact |
|------|-----|---------|
| Domain issues | Cloudflare Support | cloudflare.com/support |
| Email issues | Google Workspace Support | admin.google.com |
| Hosting issues | Railway Support | railway.app/help |
| Website changes | Ludwig (Kraftworks) | (203) 300-7996 |

---

*This guide was prepared by Kraftworks. All accounts and credentials belong to Darcy Aviation.*
