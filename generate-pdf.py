from fpdf import FPDF

class HandoffPDF(FPDF):
    NAVY = (15, 23, 42)
    BLUE = (37, 99, 235)
    LIGHT_BLUE = (219, 234, 254)
    GRAY = (100, 116, 139)
    WHITE = (255, 255, 255)
    BG = (248, 250, 252)
    
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*self.GRAY)
        self.cell(0, 10, "Darcy Aviation - Handoff Guide", align="L")
        self.cell(0, 10, f"Page {self.page_no()}", align="R")
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*self.GRAY)
        self.cell(0, 10, "Prepared by Kraftworks  |  March 2, 2026", align="C")

    def cover_page(self):
        self.add_page()
        # Blue header bar
        self.set_fill_color(*self.NAVY)
        self.rect(0, 0, 210, 120, "F")
        
        # Title
        self.set_y(35)
        self.set_font("Helvetica", "B", 32)
        self.set_text_color(*self.WHITE)
        self.cell(0, 14, "DARCY AVIATION", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(3)
        
        self.set_font("Helvetica", "", 14)
        self.set_text_color(180, 200, 255)
        self.cell(0, 8, "Domain, Email & Hosting Handoff Guide", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(8)
        
        # Divider line
        self.set_draw_color(*self.BLUE)
        self.set_line_width(0.8)
        self.line(70, self.get_y(), 140, self.get_y())
        self.ln(8)
        
        self.set_font("Helvetica", "", 11)
        self.set_text_color(160, 180, 220)
        self.cell(0, 7, "Prepared for: Brent Darcy", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 7, "Prepared by: Ludwig Hellstrom (Kraftworks)", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 7, "Date: March 2, 2026", align="C", new_x="LMARGIN", new_y="NEXT")
        
        # Overview box
        self.set_y(135)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*self.NAVY)
        self.cell(0, 10, "Overview", new_x="LMARGIN", new_y="NEXT")
        self.ln(3)
        
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*self.GRAY)
        overview = (
            "This guide walks through transferring darcyaviation.com to Brent's own infrastructure - "
            "domain, email, website hosting, and source code. After completing these steps, Brent will "
            "fully own and control everything."
        )
        self.multi_cell(0, 5.5, overview)
        self.ln(6)
        
        # Current vs Target
        col_w = 85
        self.set_x(20)
        x_start = self.get_x()
        y_start = self.get_y()
        
        # Current setup box
        self.set_fill_color(255, 240, 240)
        self.rect(x_start, y_start, col_w, 50, "F")
        self.set_xy(x_start + 4, y_start + 4)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(180, 60, 60)
        self.cell(col_w - 8, 6, "CURRENT SETUP", new_x="LMARGIN", new_y="NEXT")
        self.set_x(x_start + 4)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*self.GRAY)
        self.multi_cell(col_w - 8, 5, "Domain: iPage / Network Solutions\nExpires: April 21, 2026\nWebsite: Ludwig's Railway account\nEmail: Not configured")
        
        # Target setup box
        x2 = x_start + col_w + 10
        self.set_fill_color(230, 255, 230)
        self.rect(x2, y_start, col_w, 50, "F")
        self.set_xy(x2 + 4, y_start + 4)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(40, 140, 40)
        self.cell(col_w - 8, 6, "TARGET SETUP", new_x="LMARGIN", new_y="NEXT")
        self.set_xy(x2 + 4, self.get_y())
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*self.GRAY)
        self.multi_cell(col_w - 8, 5, "Domain: Cloudflare (~$10/yr)\nEmail: Google Workspace ($7/mo)\nHosting: Brent's Railway ($0-5/mo)\nCode: Brent's GitHub")
        
        self.set_y(y_start + 58)
        
        # Cost summary
        self.set_fill_color(*self.LIGHT_BLUE)
        self.set_x(20)
        self.rect(20, self.get_y(), 170, 18, "F")
        self.set_xy(25, self.get_y() + 3)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*self.BLUE)
        self.cell(80, 6, "Estimated Monthly Cost: $8-13/mo")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*self.GRAY)
        self.cell(80, 6, "One-time transfer: ~$10 (includes 1yr renewal)", align="R")
    
    def section_header(self, number, title):
        self.ln(6)
        # Blue accent bar
        self.set_fill_color(*self.BLUE)
        self.rect(15, self.get_y(), 3, 10, "F")
        self.set_x(22)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*self.NAVY)
        self.cell(0, 10, f"Step {number}: {title}", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
    
    def time_badge(self, text):
        self.set_x(22)
        self.set_fill_color(240, 245, 255)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(*self.BLUE)
        w = self.get_string_width(text) + 10
        self.cell(w, 7, text, fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*self.GRAY)
        self.ln(3)

    def body_text(self, text):
        self.set_x(22)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(60, 70, 80)
        self.multi_cell(170, 5.5, text)
        self.ln(2)
    
    def numbered_step(self, num, text, bold_prefix=""):
        self.set_x(22)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*self.BLUE)
        self.cell(8, 6, f"{num}.")
        if bold_prefix:
            self.set_font("Helvetica", "B", 10)
            self.set_text_color(*self.NAVY)
            bw = self.get_string_width(bold_prefix + " ")
            self.cell(bw, 6, bold_prefix + " ")
            self.set_font("Helvetica", "", 10)
            self.set_text_color(60, 70, 80)
            self.multi_cell(170 - 8 - bw, 6, text)
        else:
            self.set_font("Helvetica", "", 10)
            self.set_text_color(60, 70, 80)
            self.multi_cell(162, 6, text)
        self.ln(1)
    
    def warning_box(self, text):
        self.set_x(22)
        y = self.get_y()
        self.set_fill_color(255, 250, 230)
        self.set_draw_color(234, 179, 8)
        self.set_line_width(0.3)
        self.rect(22, y, 170, 14, "DF")
        self.set_xy(26, y + 2)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(160, 120, 0)
        self.cell(5, 5, "!")
        self.set_font("Helvetica", "", 9)
        self.multi_cell(156, 5, text)
        self.set_y(y + 16)

    def dns_table(self, headers, rows):
        self.set_x(22)
        col_widths = [25, 25, 20, 80, 20]
        if len(headers) == 4:
            col_widths = [25, 30, 90, 25]
        
        # Header
        self.set_fill_color(*self.NAVY)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*self.WHITE)
        for i, h in enumerate(headers):
            w = col_widths[i] if i < len(col_widths) else 30
            self.cell(w, 7, h, border=1, fill=True, align="C")
        self.ln()
        
        # Rows
        self.set_font("Courier", "", 8)
        self.set_text_color(60, 70, 80)
        for row in rows:
            self.set_x(22)
            self.set_fill_color(*self.BG)
            for i, val in enumerate(row):
                w = col_widths[i] if i < len(col_widths) else 30
                self.cell(w, 6, val, border=1, fill=True, align="C")
            self.ln()
        self.ln(3)

    def checklist_item(self, text, checked=False):
        self.set_x(22)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*self.NAVY)
        box = "[x]" if checked else "[  ]"
        self.cell(10, 6, box)
        self.set_text_color(60, 70, 80)
        self.cell(0, 6, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def cost_table(self):
        self.set_x(22)
        headers = ["Service", "Cost"]
        rows = [
            ("Cloudflare (domain + DNS)", "~$10/year"),
            ("Google Workspace (email)", "$7/month"),
            ("Railway (hosting)", "$0-5/month"),
        ]
        col_w = [100, 70]
        
        self.set_fill_color(*self.NAVY)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*self.WHITE)
        for i, h in enumerate(headers):
            self.cell(col_w[i], 7, h, border=1, fill=True, align="C")
        self.ln()
        
        self.set_font("Helvetica", "", 9)
        self.set_text_color(60, 70, 80)
        for label, cost in rows:
            self.set_x(22)
            self.set_fill_color(*self.BG)
            self.cell(col_w[0], 6, label, border=1, fill=True)
            self.cell(col_w[1], 6, cost, border=1, fill=True, align="C")
            self.ln()
        
        # Total row
        self.set_x(22)
        self.set_fill_color(*self.LIGHT_BLUE)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*self.BLUE)
        self.cell(col_w[0], 8, "TOTAL", border=1, fill=True)
        self.cell(col_w[1], 8, "$8-13/month", border=1, fill=True, align="C")
        self.ln(5)


pdf = HandoffPDF()
pdf.set_auto_page_break(auto=True, margin=20)

# === COVER PAGE ===
pdf.cover_page()

# === STEP 1 ===
pdf.add_page()
pdf.section_header("1", "Unlock Domain & Get Transfer Code")
pdf.time_badge("Time: ~5 minutes")
pdf.body_text("Brent's domain is currently at iPage (Network Solutions). We need to transfer it to Cloudflare for cheaper, better management.")

pdf.numbered_step(1, "https://www.ipage.com", "Go to")
pdf.numbered_step(2, "Log in with Brent's existing account credentials")
pdf.numbered_step(3, "My Domains", "Navigate to Domains >")
pdf.numbered_step(4, "darcyaviation.com", "Click on")
pdf.numbered_step(5, "Turn it OFF (unlock the domain)", "Find Domain Lock >")
pdf.numbered_step(6, "Request the EPP/Auth code", "Find Transfer or Auth/EPP Code >")
pdf.numbered_step(7, "Check Brent's Yahoo email for the EPP code - save it for Step 3")
pdf.ln(3)
pdf.warning_box("The domain shows 'client transfer prohibited' - this is just the standard lock. Unlocking removes it.")

# === STEP 2 ===
pdf.section_header("2", "Create Accounts")
pdf.time_badge("Time: ~10 minutes")

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "2a. Cloudflare Account", new_x="LMARGIN", new_y="NEXT")
pdf.numbered_step(1, "https://cloudflare.com - Sign up", "Go to")
pdf.numbered_step(2, "Use Brent's email address")
pdf.numbered_step(3, "Free plan is all we need")
pdf.ln(2)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "2b. GitHub Account", new_x="LMARGIN", new_y="NEXT")
pdf.numbered_step(1, "https://github.com - Sign up", "Go to")
pdf.numbered_step(2, "Suggested username: darcy-aviation or brentdarcy")
pdf.numbered_step(3, "Free plan is fine")
pdf.ln(2)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "2c. Railway Account", new_x="LMARGIN", new_y="NEXT")
pdf.numbered_step(1, "https://railway.app - Sign up with GitHub (from 2b)", "Go to")
pdf.numbered_step(2, "Free tier works for this site")
pdf.numbered_step(3, "Hobby plan ($5/mo) available later if needed")
pdf.ln(2)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "2d. Google Workspace (Email)", new_x="LMARGIN", new_y="NEXT")
pdf.numbered_step(1, "https://workspace.google.com - Get Started", "Go to")
pdf.numbered_step(2, "Business Starter - $7/mo per user", "Choose")
pdf.numbered_step(3, "darcyaviation.com as the domain", "Use")
pdf.numbered_step(4, "brent@darcyaviation.com as primary mailbox", "Create")
pdf.numbered_step(5, "Domain verification happens after DNS setup (Step 4)")

# === STEP 3 ===
pdf.add_page()
pdf.section_header("3", "Transfer Domain to Cloudflare")
pdf.time_badge("Time: ~5 minutes (+ up to 5 days for transfer)")
pdf.body_text("Once transfer completes, Cloudflare manages your domain and DNS. Transfer includes a 1-year renewal, extending expiry to April 2027.")

pdf.numbered_step(1, "enter darcyaviation.com", "In Cloudflare dashboard > Add a Site >")
pdf.numbered_step(2, "plan", "Choose Free")
pdf.numbered_step(3, "Cloudflare scans existing DNS - review and confirm")
pdf.numbered_step(4, "Transfer Domains", "Go to Domain Registration >")
pdf.numbered_step(5, "Enter darcyaviation.com")
pdf.numbered_step(6, "Paste the EPP/Auth code from Step 1")
pdf.numbered_step(7, "Pay ~$10.11 (includes 1 year renewal)")
pdf.numbered_step(8, "Approve the transfer confirmation email sent to Brent's Yahoo")
pdf.ln(3)
pdf.warning_box("While transfer is pending: Update iPage nameservers to Cloudflare's (shown in dashboard) so DNS works immediately.")

# === STEP 4 ===
pdf.section_header("4", "Set Up DNS Records")
pdf.time_badge("Time: ~5 minutes")
pdf.body_text("Once Cloudflare manages DNS, add these records for the website and email:")

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 10)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Website (Railway)", new_x="LMARGIN", new_y="NEXT")
pdf.dns_table(
    ["Type", "Name", "Value", "TTL"],
    [
        ["CNAME", "@", "(Railway custom domain URL)", "Auto"],
        ["CNAME", "www", "darcyaviation.com", "Auto"],
    ]
)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 10)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Email (Google Workspace MX Records)", new_x="LMARGIN", new_y="NEXT")
pdf.dns_table(
    ["Type", "Name", "Pri", "Value", "TTL"],
    [
        ["MX", "@", "1", "ASPMX.L.GOOGLE.COM", "Auto"],
        ["MX", "@", "5", "ALT1.ASPMX.L.GOOGLE.COM", "Auto"],
        ["MX", "@", "5", "ALT2.ASPMX.L.GOOGLE.COM", "Auto"],
        ["MX", "@", "10", "ALT3.ASPMX.L.GOOGLE.COM", "Auto"],
        ["MX", "@", "10", "ALT4.ASPMX.L.GOOGLE.COM", "Auto"],
    ]
)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 10)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Email Security (SPF & DMARC)", new_x="LMARGIN", new_y="NEXT")
pdf.dns_table(
    ["Type", "Name", "Value", "TTL"],
    [
        ["TXT", "@", "v=spf1 include:_spf.google.com ~all", "Auto"],
        ["TXT", "_dmarc", "v=DMARC1; p=quarantine; rua=...", "Auto"],
    ]
)

# === STEP 5 ===
pdf.add_page()
pdf.section_header("5", "Deploy Website to Brent's Railway")
pdf.time_badge("Time: ~15 minutes")

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 10)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Push Code to GitHub", new_x="LMARGIN", new_y="NEXT")
pdf.numbered_step(1, "Ludwig pushes the Darcy Aviation codebase to Brent's new GitHub repo")
pdf.numbered_step(2, "Includes: frontend, backend, CMS admin, database, all assets")
pdf.ln(2)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 10)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Connect Railway to GitHub", new_x="LMARGIN", new_y="NEXT")
pdf.numbered_step(1, "Log into Brent's Railway account")
pdf.numbered_step(2, "Deploy from GitHub Repo", "New Project >")
pdf.numbered_step(3, "Select the darcy-aviation repository")
pdf.numbered_step(4, "Railway auto-detects build settings")
pdf.ln(2)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 10)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Set Environment Variables", new_x="LMARGIN", new_y="NEXT")
pdf.body_text("In Railway project settings, add:\n    NODE_ENV=production\n    PORT=3000\n(Additional variables added during setup as needed)")
pdf.ln(2)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 10)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Custom Domain", new_x="LMARGIN", new_y="NEXT")
pdf.numbered_step(1, "Custom Domain", "In Railway > Settings >")
pdf.numbered_step(2, "Add darcyaviation.com and www.darcyaviation.com")
pdf.numbered_step(3, "Railway provides a CNAME target - add to Cloudflare DNS (Step 4)")
pdf.numbered_step(4, "SSL certificate auto-provisions")

# === STEP 6 ===
pdf.section_header("6", "Final Verification Checklist")
pdf.time_badge("Time: ~5 minutes")

pdf.checklist_item("darcyaviation.com loads the website")
pdf.checklist_item("www.darcyaviation.com redirects properly")
pdf.checklist_item("SSL certificate is active (green padlock)")
pdf.checklist_item("CMS admin login works at /admin")
pdf.checklist_item("brent@darcyaviation.com receives email")
pdf.checklist_item("brent@darcyaviation.com can send email")
pdf.checklist_item("Old iPage hosting can be cancelled")

# === AFTER SETUP ===
pdf.add_page()
pdf.ln(3)
pdf.set_fill_color(*pdf.NAVY)
pdf.rect(15, pdf.get_y() - 3, 3, 10, "F")
pdf.set_x(22)
pdf.set_font("Helvetica", "B", 14)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 10, "After Setup: What Brent Needs to Know", new_x="LMARGIN", new_y="NEXT")
pdf.ln(4)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Monthly Costs", new_x="LMARGIN", new_y="NEXT")
pdf.ln(2)
pdf.cost_table()
pdf.ln(4)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "CMS (Content Management)", new_x="LMARGIN", new_y="NEXT")
pdf.ln(2)
pdf.set_x(22)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(60, 70, 80)
pdf.multi_cell(170, 6, "URL: darcyaviation.com/admin\nLogin: admin / darcy2026\n\nBrent can edit: experiences, training programs, fleet info, testimonials, and all page content. Changes go live immediately after saving.")
pdf.ln(5)

pdf.set_x(22)
pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(*pdf.NAVY)
pdf.cell(0, 7, "Support & Contacts", new_x="LMARGIN", new_y="NEXT")
pdf.ln(2)

contacts = [
    ("Domain issues", "Cloudflare Support", "cloudflare.com/support"),
    ("Email issues", "Google Workspace", "admin.google.com"),
    ("Hosting issues", "Railway Support", "railway.app/help"),
    ("Website changes", "Ludwig (Kraftworks)", "(203) 300-7996"),
]

col_w = [45, 50, 75]
pdf.set_x(22)
pdf.set_fill_color(*pdf.NAVY)
pdf.set_font("Helvetica", "B", 9)
pdf.set_text_color(*pdf.WHITE)
for i, h in enumerate(["Issue", "Contact", "Details"]):
    pdf.cell(col_w[i], 7, h, border=1, fill=True, align="C")
pdf.ln()

pdf.set_font("Helvetica", "", 9)
pdf.set_text_color(60, 70, 80)
for issue, contact, details in contacts:
    pdf.set_x(22)
    pdf.set_fill_color(*pdf.BG)
    pdf.cell(col_w[0], 6, issue, border=1, fill=True)
    pdf.cell(col_w[1], 6, contact, border=1, fill=True)
    pdf.cell(col_w[2], 6, details, border=1, fill=True)
    pdf.ln()

pdf.ln(10)

# Footer note
pdf.set_x(22)
pdf.set_fill_color(*pdf.LIGHT_BLUE)
pdf.rect(22, pdf.get_y(), 170, 20, "F")
pdf.set_xy(28, pdf.get_y() + 4)
pdf.set_font("Helvetica", "I", 10)
pdf.set_text_color(*pdf.BLUE)
pdf.multi_cell(158, 6, "All accounts and credentials belong to Darcy Aviation.\nThis guide was prepared by Kraftworks - web development & digital solutions.")

output_path = "/home/idar/clawd/projects/darcy-aviation/Darcy-Aviation-Handoff-Guide.pdf"
pdf.output(output_path)
print(f"PDF saved to {output_path}")
