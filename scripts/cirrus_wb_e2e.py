"""Focused browser smoke test for the N43VU Cirrus SR20 W&B profile."""

import os

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, sync_playwright


METAR = {
    "station": "KDXR",
    "raw": "KDXR 121253Z 00000KT 10SM CLR 20/10 A2992",
    "temp_c": 20,
    "dewpoint_c": 10,
    "altimeter_inhg": 29.92,
    "wind_dir": 0,
    "wind_speed_kt": 0,
    "wind_gust_kt": None,
    "flight_category": "VFR",
    "elevation_ft": 458,
}


with sync_playwright() as p:
    launch_options = {"headless": True}
    chrome_path = os.environ.get("PLAYWRIGHT_CHROME_PATH", "/usr/bin/google-chrome")
    if os.path.exists(chrome_path):
        launch_options["executable_path"] = chrome_path
    browser = p.chromium.launch(**launch_options)
    page = browser.new_page(viewport={"width": 1440, "height": 1100})
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.route("**/api/wb/metar?**", lambda route: route.fulfill(json=METAR))

    page.goto("http://127.0.0.1:5173/wb", wait_until="domcontentloaded")
    try:
        page.wait_for_load_state("networkidle", timeout=10000)
    except PlaywrightTimeoutError:
        # The calculator refreshes live data; rendered-app readiness is the
        # meaningful fallback when the network never becomes fully idle.
        page.get_by_role("heading", name="Weight & Balance").wait_for()
    aircraft = page.locator("select").first
    aircraft.select_option("N43VU")

    page.get_by_text("Max Weight").wait_for()
    page.get_by_text("3150", exact=True).first.wait_for()
    page.get_by_text("993.10", exact=True).wait_for()
    page.get_by_text("2156.90", exact=True).first.wait_for()
    page.get_by_text("141.42", exact=True).first.wait_for()
    page.get_by_text("305035.00", exact=True).first.wait_for()

    front_row = page.locator("tr").filter(has_text="Front Seat Occupants")
    fuel_row = page.locator("tr").filter(has_text="Usable Fuel")
    front_row.locator("input").fill("340")
    fuel_row.locator("input").fill("56")
    page.wait_for_timeout(1200)

    # The deterministic KDXR weather should auto-fill the Cirrus POH fields.
    perf_values = page.locator("input.perf-box").evaluate_all("els => els.map(e => e.value)")
    assert len(perf_values) == 4 and all(perf_values), f"performance fields not auto-filled: {perf_values}"
    assert page.get_by_text("Cirrus SR20 G6 POH 11934-005", exact=False).is_visible()
    assert page.get_by_text("2823.90", exact=True).count() >= 2, "takeoff/landing weight mismatch"
    assert page.get_by_text("143.11", exact=True).count() >= 2, "takeoff/landing CG mismatch"
    assert page.get_by_text("404117.60", exact=True).count() >= 2, "takeoff/landing moment mismatch"
    assert page.locator("tr").filter(has_text="Takeoff Weight").locator(".bg-red-500\\/10").count() == 0
    assert page.locator("tr").filter(has_text="Landing Weight").locator(".bg-red-500\\/10").count() == 0
    assert not console_errors, f"browser console errors: {console_errors}"

    page.screenshot(path="/tmp/darcy-n43vu-wb.png", full_page=True)
    browser.close()

print("PASS: N43VU UI profile, limits, POH performance auto-fill, and CG status")
