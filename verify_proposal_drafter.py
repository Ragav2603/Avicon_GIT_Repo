import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the test page
        print("Navigating to test page...")
        page.goto("http://localhost:8080/test-drafter")

        # Wait for "Open Drafter" button to ensure app loaded
        print("Waiting for Open Drafter button...")
        try:
            expect(page.get_by_text("Open Drafter")).to_be_visible(timeout=10000)
        except Exception:
             print("Failed to find Open Drafter button. Taking screenshot.")
             page.screenshot(path="verification_failure_load.png")
             browser.close()
             return

        # Click Open Drafter if modal not already open (TestProposalDrafter sets open=true initially)
        # But let's check if modal is visible
        if not page.get_by_text("Proposal Drafter: Test RFP Title").is_visible():
            print("Clicking Open Drafter...")
            page.get_by_text("Open Drafter").click()

        # Wait for modal content
        print("Waiting for modal...")
        expect(page.get_by_text("Proposal Drafter: Test RFP Title")).to_be_visible()

        # Skip upload
        print("Skipping upload...")
        # "Skip & Start Manually" might be split by line break or something, using partial text matching or role
        # It's a button.
        page.get_by_role("button", name="Skip & Start Manually").click()

        # Wait for editor
        print("Waiting for editor...")
        expect(page.get_by_text("RFP Requirements")).to_be_visible()

        # Verify requirement list is present
        print("Verifying requirements list...")
        expect(page.get_by_text("Cloud-native architecture with 99.9% uptime SLA")).to_be_visible()

        # Type in editor
        print("Typing in editor...")
        editor = page.get_by_placeholder("Start typing your proposal...")
        editor.click()
        editor.fill("This is a test proposal.")

        # Take screenshot
        print("Taking screenshot...")
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/proposal_drafter.png")
        print("Screenshot saved to verification/proposal_drafter.png")

        browser.close()

if __name__ == "__main__":
    run()
