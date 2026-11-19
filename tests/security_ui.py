"""実APIで保存した入力のHTML無害化、PDF描画、添付の拒否・強制ダウンロードを検証します。"""

import os
import subprocess
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = subprocess.Popen(
    [os.environ.get("FACTORY_MAP_NODE", "node"), "tests/map-local-server.mjs"],
    cwd=ROOT,
    stdout=subprocess.PIPE,
    text=True,
)
try:
    url = server.stdout.readline().strip()
    assert url.startswith("http://127.0.0.1:"), url
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
        )
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        client = context.request
        headers = {"x-factory-profile": "pro"}
        title = '<img src="x" onerror="window.__securityXss=1">'
        uploaded = client.post(
            url + "/api/files",
            headers=headers,
            multipart={
                "file": {
                    "name": title + ".pdf",
                    "mimeType": "application/pdf",
                    "buffer": (ROOT / "shared/demo/demo.pdf").read_bytes(),
                }
            },
        )
        assert uploaded.status == 201
        pdf = uploaded.json()["files"][0]
        current = client.get(url + "/api/state", headers=headers).json()
        asset = current["state"]["assets"][0]
        asset["name"] = title
        asset["attachments"] = [pdf]
        assert client.put(url + "/api/state", headers=headers, data=current).status == 200
        page.goto(url)
        page.wait_for_function("() => (window.factoryMap && window.FactoryPreferences)")
        page.evaluate('(id) => factoryMap.openRecord("assets", id)', asset["id"])
        expect(page.locator("#detail-pane h2")).to_have_text(title)
        assert page.locator("#detail-pane img[onerror]").count() == 0
        page.locator("#detail-pane").get_by_role("button", name="プレビュー", exact=True).click()
        preview = page.locator("#file-preview")
        expect(preview).to_be_visible()
        page.wait_for_function(
            '() => document.querySelector("#file-preview").dataset.pdfReady === "true"'
        )
        assert preview.locator("canvas").evaluate("el => el.width > 0 && el.height > 0")
        assert preview.locator("img[onerror]").count() == 0
        assert not page.evaluate("() => window.__securityXss")
        file_response = client.get(url + "/api/files/" + pdf["fileId"] + "?inline=1")
        assert "default-src 'none'; sandbox" in file_response.headers["content-security-policy"]
        assert "object-src 'none'" in file_response.headers["content-security-policy"]
        preview.get_by_role("button", name="閉じる", exact=True).click()

        # HTMLはinline要求でもページとして実行させず、ダウンロードに限定します。
        html = client.post(
            url + "/api/files",
            headers=headers,
            multipart={
                "file": {
                    "name": "untrusted.html",
                    "mimeType": "text/html",
                    "buffer": b"<script>window.__securityXss=1</script>",
                }
            },
        ).json()["files"][0]
        download_url = url + "/api/files/" + html["fileId"] + "?inline=1"
        response = client.get(download_url)
        assert response.headers["content-type"] == "application/octet-stream"
        assert response.headers["content-disposition"].startswith("attachment;")
        with page.expect_download() as download:
            page.evaluate(
                "target => {const a=document.createElement('a');a.href=target;a.click()}",
                download_url,
            )
        assert download.value.suggested_filename == "untrusted.html"
        download.value.cancel()
        assert not page.evaluate("() => window.__securityXss")
        assert client.post(url + "/api/auth/logout", headers=headers).status == 200
        assert client.get(url + "/api/files/" + pdf["fileId"]).status == 404
        assert client.get(url + "/api/assets").status == 403
        assert not errors, errors
        browser.close()
    print(
        "PASS: 保存型HTMLの無害化、PDF描画とsandbox保持、HTMLの強制ダウンロード、閲覧者の添付拒否"
    )
finally:
    server.terminate()
    server.wait(timeout=10)
