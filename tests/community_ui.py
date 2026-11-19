"""永続サーバーをHTTP認証で開き、Freeの画面と再起動に依存しない保存を検証します。"""

import os
import subprocess
import tempfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix="plantdesk-community-ui-") as directory:
    password = "test-only-community-ui-password"
    env = {
        **os.environ,
        "PLANTDESK_PASSWORD": password,
        "PLANTDESK_DATA_DIR": directory,
        "HOST": "127.0.0.1",
        "PORT": "0",
        "PLANTDESK_NOTION_SYNC": "false",
    }
    env.pop("PLANTDESK_PASSWORD_FILE", None)
    server = subprocess.Popen(
        [os.environ.get("FACTORY_MAP_NODE", "node"), "server/main.mjs"],
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        text=True,
    )
    try:
        address = server.stdout.readline().strip().split(": ", 1)[-1]
        assert address.startswith("127.0.0.1:"), address
        url = "http://" + address
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
            )
            context = browser.new_context(
                http_credentials={"username": "plantdesk", "password": password},
                viewport={"width": 1440, "height": 1000},
            )
            page = context.new_page()
            errors = []
            external = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on(
                "request",
                lambda request: (
                    external.append(request.url)
                    if request.url.startswith(("https://", "http://"))
                    and not request.url.startswith(url + "/")
                    else None
                ),
            )
            page.goto(url + "/")
            page.wait_for_function(
                "() => window.factoryMap && window.FactoryPreferences?.getPreferences"
            )
            expect(page.locator(".product-account")).to_contain_text("COMMUNITY")
            assert page.get_by_label("デモアカウント", exact=True).count() == 0
            page.locator("#factory-customize").click()
            expect(page.locator("#factory-custom-dialog")).to_be_visible()
            assert page.get_by_label("テーマ", exact=True).count() == 0
            assert page.locator("#factory-icon-list").count() == 0
            page.keyboard.press("Escape")
            expect(page.locator("#factory-custom-dialog")).not_to_be_visible()
            page.goto(url + "/console.html#tasks")
            page.get_by_role("button", name="＋ 仕事を登録", exact=True).click()
            dialog = page.get_by_role("dialog", name="仕事を登録", exact=True)
            dialog.get_by_label("作業名", exact=True).fill("Communityの保存確認")
            dialog.get_by_role("button", name="作業を保存", exact=True).click()
            dialog.wait_for(state="hidden")
            page.reload()
            page.get_by_role("button", name="Communityの保存確認", exact=True).wait_for()
            navigation = page.locator(".console-sidebar").inner_text()
            assert "バックアップ" not in navigation and "操作履歴" not in navigation
            page.set_viewport_size({"width": 390, "height": 844})
            (ROOT / ".runtime/qa").mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(ROOT / ".runtime/qa/community-mobile.png"), full_page=True)
            assert not errors, errors
            assert not external, external
            browser.close()
        print(
            "PASS: self-host authentication, Free UI, task persistence, mobile and local requests"
        )
    finally:
        server.terminate()
        server.wait(timeout=10)
