const { spawn } = require('child_process');
const CDP = require('chrome-remote-interface');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE_DIR = "C:\\Users\\Admin\\.gemini\antigravity\\scratch\\chrome-profile-temp";
const SCREENSHOT_PATH = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\0864834d-9925-4b71-b43b-318b360c7c62\\apex_mockup.png";

async function run() {
    let chromeProcess;
    let client;

    try {
        console.log('Spawning Chrome for screenshot...');
        chromeProcess = spawn(CHROME_PATH, [
            '--remote-debugging-port=9222',
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            `--user-data-dir=${PROFILE_DIR}`
        ]);

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('Connecting to Chrome...');
        client = await CDP({ port: 9222 });
        const { Page, Emulation } = client;

        await Page.enable();

        // Set high resolution device viewport for a crisp screenshot
        await Emulation.setDeviceMetricsOverride({
            width: 1440,
            height: 900,
            deviceScaleFactor: 1.5,
            mobile: false
        });

        console.log('Navigating to http://localhost:8080/ ...');
        await Page.navigate({ url: 'http://localhost:8080/' });
        await Page.loadEventFired();

        // Wait 4 seconds for fonts, CSS transitions, and background images to load
        console.log('Waiting for elements and images to load...');
        await new Promise(resolve => setTimeout(resolve, 4000));

        console.log('Capturing full-page screenshot...');
        const { data } = await Page.captureScreenshot({
            format: 'png',
            captureBeyondViewport: true
        });

        // Write screenshot file
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(SCREENSHOT_PATH, buffer);
        console.log(`Screenshot successfully written to: ${SCREENSHOT_PATH}`);

    } catch (err) {
        console.error('Screenshot capture failed:', err);
    } finally {
        if (client) {
            await client.close();
        }
        if (chromeProcess) {
            chromeProcess.kill();
        }
        console.log('Done.');
        process.exit(0);
    }
}

run();
