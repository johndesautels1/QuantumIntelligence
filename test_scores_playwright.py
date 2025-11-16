import asyncio
from playwright.async_api import async_playwright

async def test_scores():
    async with async_playwright() as p:
        # Launch browser in headless mode
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to the test page
        await page.goto('http://localhost:8002/simple_test.html')

        # Wait for the script to execute
        await page.wait_for_timeout(1000)

        # Get the console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        # Get the output text
        output_text = await page.text_content('#output')
        print(output_text)

        # Check if scores are varied
        if 'SUCCESS: Scores are varied' in output_text:
            print("\n✅ TEST PASSED: Scores are varied!")
            # Extract range info
            import re
            match = re.search(r'range from ([\d.]+) to ([\d.]+)', output_text)
            if match:
                min_range, max_range = match.groups()
                print(f"Score ranges: {min_range} to {max_range}")
        else:
            print("\n❌ TEST FAILED: Scores are not varied!")

        await browser.close()

# Run the test
asyncio.run(test_scores())