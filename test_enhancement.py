import asyncio
from playwright.async_api import async_playwright

async def test_enhancement():
    async with async_playwright() as p:
        # Launch browser in headless mode
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Collect console messages
        console_logs = []
        page.on("console", lambda msg: console_logs.append(msg.text))

        # Navigate to the enhancement page
        await page.goto('http://localhost:8002/src/enhancement_1_quantum_explorer.html')

        # Wait for the page to load and scripts to execute
        await page.wait_for_timeout(3000)

        # Print relevant console logs
        print("Console output related to property scores:")
        print("=" * 50)

        # Print all console logs for debugging
        print(f"Total console logs: {len(console_logs)}")
        for i, log in enumerate(console_logs[:20]):  # First 20 logs
            clean_log = log.encode('ascii', 'ignore').decode('ascii')
            print(f"Log {i}: {clean_log[:100]}")

        for log in console_logs:
            if 'property' in log.lower() or 'score' in log.lower() or 'dimension' in log.lower():
                clean_log = log.encode('ascii', 'ignore').decode('ascii')
                print(clean_log)

        # Check for the debug log about raw scores
        raw_scores_log = [log for log in console_logs if 'First property raw scores' in log]
        if raw_scores_log:
            print("\nFound raw scores log:")
            print(raw_scores_log[0])

        # Parse the scores if found
        scores_varied = False
        for log in console_logs:
            if 'First property raw scores' in log:
                # Try to extract the scores
                import re
                numbers = re.findall(r'\d+\.?\d*', log)
                if numbers:
                    numbers = [float(n) for n in numbers]
                    unique_scores = len(set(numbers))
                    if unique_scores > 1:
                        scores_varied = True
                        print(f"\nScores found: {numbers}")
                        print(f"Min: {min(numbers):.1f}, Max: {max(numbers):.1f}")

        if scores_varied:
            print("\nTEST PASSED: Scores are varied!")
        else:
            print("\nChecking if properties loaded...")
            loaded_log = [log for log in console_logs if 'Loaded' in log and 'properties' in log.lower()]
            if loaded_log:
                # Remove emoji characters before printing
                clean_log = loaded_log[0].encode('ascii', 'ignore').decode('ascii')
                print(clean_log)

        await browser.close()

# Run the test
asyncio.run(test_enhancement())