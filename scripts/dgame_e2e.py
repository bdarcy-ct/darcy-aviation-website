import os
from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:5173"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        headless=True,
        executable_path=os.environ.get("CHROME_BIN"),
    )
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    page.goto(f"{BASE_URL}/thegame")
    page.wait_for_load_state("networkidle")
    page.get_by_role("heading", name="DARCY AVIATION JEOPARDY").wait_for()
    page.screenshot(path="/tmp/darcy-jeopardy-auth.png", full_page=True)

    page.get_by_label("Pilot name").fill("DGame QA")
    page.get_by_label("Access code").fill("2468")
    page.get_by_role("button", name="START ENGINES").click()
    page.get_by_text("Good to see you").wait_for()
    page.screenshot(path="/tmp/dgame-hangar.png", full_page=True)

    page.locator(".dg-track-card").first.click()
    page.get_by_role("heading", name="Private Pilot").wait_for()
    first_board_ids = page.locator(".dg-board__column > button").evaluate_all("els => els.map(el => el.dataset.questionId)")
    first_categories = page.locator(".dg-board__column header strong").all_inner_texts()
    page.get_by_role("button", name="← TRACKS").click()
    page.locator(".dg-track-card").first.click()
    second_board_ids = page.locator(".dg-board__column > button").evaluate_all("els => els.map(el => el.dataset.questionId)")
    second_categories = page.locator(".dg-board__column header strong").all_inner_texts()
    assert set(first_board_ids).isdisjoint(second_board_ids), "Unseen-first board generation repeated questions too early"
    assert set(first_categories).isdisjoint(second_categories), "Consecutive boards repeated categories before rotating the pool"
    page.locator(".dg-board__column > button").first.click()
    page.locator(".dg-question-card").wait_for()
    page.locator(".dg-choices").wait_for()
    assert page.locator(".dg-think-window").count() == 0, "The removed countdown was still rendered"
    page.screenshot(path="/tmp/dgame-mixed-question.png", full_page=True)
    page.locator(".dg-choices button").first.click()
    page.get_by_role("button", name="BACK TO BOARD →").click()
    page.locator(".dg-question-card").wait_for(state="detached")
    page.screenshot(path="/tmp/dgame-board.png", full_page=True)

    page.get_by_role("button", name="END FLIGHT").click()
    page.get_by_role("heading", name="Flight complete.").wait_for()
    page.get_by_text("Flight logged").wait_for()
    page.get_by_role("button", name="CHANGE TRACK").click()
    page.get_by_text("Good to see you").wait_for()

    page.reload()
    page.wait_for_load_state("networkidle")
    page.get_by_text("Good to see you").wait_for()

    multiplayer = browser.new_page(viewport={"width": 1440, "height": 1000})
    multiplayer.goto(f"{BASE_URL}/thegame")
    multiplayer.wait_for_load_state("networkidle")
    multiplayer.get_by_label("Pilot name").fill("DGame Host QA")
    multiplayer.get_by_label("Access code").fill("1357")
    multiplayer.get_by_role("button", name="START ENGINES").click()
    multiplayer.get_by_text("Good to see you").wait_for()
    multiplayer.get_by_role("button", name="Multiplayer").click()
    multiplayer.get_by_label("Crew pilot name").fill("DGame Rival QA")
    multiplayer.get_by_label("Crew access code").fill("2468")
    multiplayer.get_by_role("button", name="+ ADD PILOT").click()
    multiplayer.get_by_text("2/4 PILOTS").wait_for()
    multiplayer.locator(".dg-track-card").first.click()
    multiplayer.locator(".dg-board__column > button").first.click()
    multiplayer.locator(".dg-buzzer-stage button").first.click()
    multiplayer.locator(".dg-choices button").first.click()
    if multiplayer.get_by_role("button", name="REOPEN BUZZERS →").count():
        multiplayer.get_by_role("button", name="REOPEN BUZZERS →").click()
        multiplayer.locator(".dg-buzzer-stage button:not([disabled])").first.click()
        multiplayer.locator(".dg-choices button").first.click()
    multiplayer.get_by_role("button", name="BACK TO BOARD →").click()
    multiplayer.get_by_role("button", name="END FLIGHT").click()
    multiplayer.get_by_text("2 pilot scores logged").wait_for()
    multiplayer.screenshot(path="/tmp/dgame-multiplayer.png", full_page=True)

    assert not console_errors, f"Browser console errors: {console_errors}"
    assert Path("/tmp/dgame-hangar.png").exists()
    assert Path("/tmp/dgame-board.png").exists()
    print("Darcy Aviation Jeopardy E2E passed: single-player persistence plus multiplayer lobby, buzz-in, scoring, and standings save.")
    browser.close()
