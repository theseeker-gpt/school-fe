from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Go to the login page via HTTP to set the token
        page.goto("http://localhost:8000/v10/login.html")

        # 2. Set a dummy token
        page.evaluate("sessionStorage.setItem('token', 'dummy_logout_test_token')")

        # 3. Navigate to the dashboard
        page.goto("http://localhost:8000/v10/dashboard.html")

        # 4. Click the admin dropdown to make the logout button visible
        admin_dropdown_toggle = page.locator(".header-admin .dropdown-toggle")
        expect(admin_dropdown_toggle).to_be_visible(timeout=10000)
        admin_dropdown_toggle.click()

        # 5. Wait for the logout button and click it
        logout_button = page.locator("#logout-button")
        expect(logout_button).to_be_visible()
        logout_button.click()

        # 6. Wait for the navigation to the login page
        expect(page).to_have_url("http://localhost:8000/v10/login.html")

        # 7. Take a screenshot
        page.screenshot(path="jules-scratch/verification/logout_verification.png")

        browser.close()

run()
