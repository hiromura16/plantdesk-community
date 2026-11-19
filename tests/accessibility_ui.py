"""主要画面・編集ダイアログ・モバイル・テーマをaxeとキーボードで検証します。"""

import json
import os
import subprocess
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / ".runtime/qa/accessibility.json"
server = subprocess.Popen(
    [os.environ.get("FACTORY_MAP_NODE", "node"), "tests/map-local-server.mjs"],
    cwd=ROOT,
    stdout=subprocess.PIPE,
    text=True,
)
results = []
errors = []
try:
    url = server.stdout.readline().strip()
    assert url.startswith("http://127.0.0.1:"), url
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
        )
        page = browser.new_page(viewport={"width": 1536, "height": 1080})
        page.on("pageerror", lambda error: errors.append(str(error)))
        axe = (ROOT / "node_modules/axe-core/axe.min.js").read_text()

        def scan(name):
            page.evaluate(axe)
            report = page.evaluate(
                """async()=>await axe.run(document,{runOnly:{type:'tag',values:[
                'wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}})"""
            )
            results.append(
                {
                    "view": name,
                    "violations": report["violations"],
                    "incomplete": report["incomplete"],
                }
            )
            print(name, [(v["id"], len(v["nodes"])) for v in report["violations"]], flush=True)

        for tab in [
            "overview",
            "tasks",
            "equipment",
            "works",
            "data",
            "notion",
            "files",
        ]:
            page.goto(url + "/console.html#" + tab)
            page.locator(".console-shell").wait_for()
            expect(page.locator(".console-main h1")).not_to_have_text(
                "ワークスペースを開いています"
            )
            page.wait_for_timeout(250)
            scan(tab)
        page.goto(url + "/console.html#tasks")
        page.get_by_role("button", name="＋ 仕事を登録", exact=True).click()
        page.get_by_role("dialog", name="仕事を登録", exact=True).wait_for()
        scan("task-editor")
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog", name="仕事を登録", exact=True)).not_to_be_visible()
        page.goto(url + "/")
        page.wait_for_function("() => (!!window.factoryMap && !!window.FactoryPreferences.update)")
        scan("map")
        page.locator("#factory-customize").click()
        scan("map-settings")
        page.keyboard.press("Escape")
        expect(page.locator("#factory-custom-dialog")).not_to_be_visible()
        expect(page.locator("#factory-customize")).to_be_focused()
        page.locator("#note-add").click()
        page.locator("#map").click(position={"x": 200, "y": 200})
        page.locator("#note-dialog").wait_for()
        scan("note-editor")
        page.keyboard.press("Escape")
        page.locator("#asset-add").click()
        page.locator("#map").click(position={"x": 200, "y": 200})
        page.locator("#asset-dialog").wait_for()
        scan("equipment-editor")
        page.keyboard.press("Escape")
        page.emulate_media(color_scheme="dark")
        scan("map-dark")
        page.locator("#factory-customize").click()
        scan("map-settings-dark")
        page.keyboard.press("Escape")
        page.set_viewport_size({"width": 390, "height": 844})
        page.emulate_media(color_scheme="light")
        scan("map-mobile")
        page.goto(url + "/console.html#tasks")
        page.locator(".task-workspace").wait_for()
        scan("tasks-mobile")
        browser.close()
    assert not errors, errors
finally:
    server.terminate()
    server.wait()
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(results, ensure_ascii=False, indent=2))
failures = [view["view"] for view in results if view["violations"]]
assert not failures, f"アクセシビリティ違反: {failures}。詳細は {REPORT}"
print(f"PASS: axe {len(results)} views, dialog keyboard dismissal and focus return")
