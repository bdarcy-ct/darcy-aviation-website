"""Browser regression check for the CMS fleet/team persistence paths."""

import sys
import sqlite3
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


BASE_URL = "http://127.0.0.1:3901"
TEAM_NAME = "Persistence Test Instructor"
AIRCRAFT_NAME = "Persistence Test Cessna"


def login(page):
    page.goto(f"{BASE_URL}/admin")
    page.wait_for_load_state("networkidle")
    page.locator("#username").fill("admin")
    page.locator("#password").fill("darcy2026")
    page.get_by_role("button", name="Sign In").click()
    expect(page).to_have_url(f"{BASE_URL}/admin/dashboard")


def assert_admin_pages_load(page):
    paths = [
        "dashboard", "content", "sop", "service-tiles", "training-programs",
        "fleet", "testimonials", "faqs", "experiences",
        "maintenance-services", "team", "media", "pages",
    ]
    for path in paths:
        page.goto(f"{BASE_URL}/admin/{path}")
        page.wait_for_load_state("networkidle")
        expect(page.locator("body")).not_to_contain_text("Invalid username or password")
        expect(page.get_by_role("button", name="Logout")).to_be_visible()


def create_records(page):
    page.goto(f"{BASE_URL}/admin/team")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="+ Add Team Member").first.click()
    page.locator('input[placeholder="e.g., Jared Smith"]').fill(TEAM_NAME)
    page.locator('textarea[placeholder^="Short bio"]').fill("Created by the CMS persistence regression test.")
    page.get_by_role("button", name="Add Member", exact=True).click()
    expect(page.get_by_text(TEAM_NAME, exact=True)).to_be_visible()

    page.goto(f"{BASE_URL}/admin/fleet")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="+ Add Aircraft").click()
    page.locator('input[placeholder="e.g., Cessna 172 Skyhawk"]').fill(AIRCRAFT_NAME)
    page.locator('textarea[placeholder="Aircraft description..."]').fill("Created by the CMS persistence regression test.")
    page.get_by_role("button", name="Add Aircraft", exact=True).click()
    expect(page.get_by_text(AIRCRAFT_NAME, exact=True)).to_be_visible()


def verify_records(page):
    page.goto(f"{BASE_URL}/admin/team")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text(TEAM_NAME, exact=True)).to_be_visible()

    page.goto(f"{BASE_URL}/admin/fleet")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text(AIRCRAFT_NAME, exact=True)).to_be_visible()


def round_trip_backup_restore(page):
    token = page.evaluate("localStorage.getItem('darcy-admin-token')")
    headers = {"Authorization": f"Bearer {token}"}
    download = page.request.get(f"{BASE_URL}/api/admin/backup/download", headers=headers)
    assert download.ok, f"backup download failed: {download.status}"

    backup_bytes = download.body()
    backup_path = Path("/tmp/darcy-cms-audit-roundtrip.db")
    backup_path.write_bytes(backup_bytes)
    with sqlite3.connect(backup_path) as backup:
        assert backup.execute("PRAGMA integrity_check").fetchone()[0] == "ok"

    restore = page.request.post(
        f"{BASE_URL}/api/admin/backup/restore",
        headers=headers,
        multipart={
            "backup": {
                "name": "darcy-cms-audit-roundtrip.db",
                "mimeType": "application/x-sqlite3",
                "buffer": backup_bytes,
            }
        },
    )
    assert restore.ok, f"backup restore failed: {restore.status} {restore.text()}"
    assert restore.json().get("success") is True


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in {"create", "verify", "restore"}:
        raise SystemExit("usage: cms_persistence_e2e.py create|verify|restore")

    browser_errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox"],
        )
        page = browser.new_page()
        page.on("pageerror", lambda error: browser_errors.append(str(error)))
        login(page)

        if sys.argv[1] == "create":
            assert_admin_pages_load(page)
            create_records(page)
        elif sys.argv[1] == "verify":
            verify_records(page)
        else:
            verify_records(page)
            round_trip_backup_restore(page)

        browser.close()

    if browser_errors:
        raise AssertionError(f"Browser errors: {browser_errors}")
    print(f"CMS persistence phase passed: {sys.argv[1]}")


if __name__ == "__main__":
    main()
