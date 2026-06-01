const { spawn } = require('child_process');
const CDP = require('chrome-remote-interface');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE_DIR = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\chrome-profile-temp";

async function run() {
    let chromeProcess;
    let client;

    try {
        console.log('Spawning Chrome in headless mode...');
        chromeProcess = spawn(CHROME_PATH, [
            '--remote-debugging-port=9222',
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            `--user-data-dir=${PROFILE_DIR}`
        ]);

        chromeProcess.stderr.on('data', (data) => {
            const logStr = data.toString();
            if (logStr.includes('DevTools listening on')) {
                console.log('Chrome Debugger log:', logStr.trim());
            }
        });

        // Wait 5 seconds for Chrome to start and bind port 9222
        console.log('Waiting 5 seconds for Chrome to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('Connecting to Chrome via CDP...');
        client = await CDP({ port: 9222 });
        const { Page, Runtime } = client;

        await Page.enable();
        await Runtime.enable();

        console.log('Navigating to http://localhost:8080/ ...');
        await Page.navigate({ url: 'http://localhost:8080/' });
        await Page.loadEventFired();
        console.log('Page loaded successfully.');

        // Helper evaluation function
        const evaluate = async (expression) => {
            const result = await Runtime.evaluate({ expression, returnByValue: true });
            if (result.exceptionDetails) {
                throw new Error(`JS Evaluation failed: ${result.exceptionDetails.exception.description}`);
            }
            return result.result.value;
        };

        console.log('\n=============================================');
        console.log('        APEX GYM WEBSITE TEST SUITE          ');
        console.log('=============================================');

        // Test 1: Page Title
        const title = await evaluate('document.title');
        console.log(`[TEST 1] Page Title check: "${title}"`);
        if (title.includes('Apex Performance Club')) {
            console.log('  -> STATUS: PASS');
        } else {
            console.log('  -> STATUS: FAIL');
        }

        // Test 2: Verify all key sections exist
        const sections = ['hero', 'programs', 'about', 'results', 'facilities', 'pricing', 'contact'];
        console.log('\n[TEST 2] Verifying Section IDs presence:');
        for (const sec of sections) {
            const exists = await evaluate(`!!document.getElementById('${sec}')`);
            console.log(`  - Section #${sec}: ${exists ? 'PASS' : 'FAIL'}`);
        }

        // Test 3: FAQ Toggle
        console.log('\n[TEST 3] FAQ Accordion Expand & Collapse:');
        const initialFaqState = await evaluate(`document.querySelector('.faq-trigger').getAttribute('aria-expanded')`);
        console.log(`  - Initial state: aria-expanded = ${initialFaqState}`);
        
        await evaluate(`document.querySelector('.faq-trigger').click()`);
        await new Promise(r => setTimeout(r, 600)); // wait for transition
        
        const toggledFaqState = await evaluate(`document.querySelector('.faq-trigger').getAttribute('aria-expanded')`);
        console.log(`  - Post-click state: aria-expanded = ${toggledFaqState}`);
        if (toggledFaqState === 'true') {
            console.log('  -> STATUS: PASS');
        } else {
            console.log('  -> STATUS: FAIL');
        }

        // Test 4: Results/Transformation Slider
        console.log('\n[TEST 4] Results Slider Mechanics:');
        const activeSlideIndexBefore = await evaluate(`Array.from(document.querySelectorAll('.transformation-slide')).findIndex(s => s.classList.contains('active'))`);
        console.log(`  - Active slide index before click: ${activeSlideIndexBefore}`);

        await evaluate(`document.querySelector('.next-slide').click()`);
        await new Promise(r => setTimeout(r, 600));
        
        const activeSlideIndexAfter = await evaluate(`Array.from(document.querySelectorAll('.transformation-slide')).findIndex(s => s.classList.contains('active'))`);
        console.log(`  - Active slide index after click: ${activeSlideIndexAfter}`);
        if (activeSlideIndexAfter === 1) {
            console.log('  -> STATUS: PASS');
        } else {
            console.log('  -> STATUS: FAIL');
        }

        // Test 5: Open Booking Modal
        console.log('\n[TEST 5] Booking Modal Interactions:');
        const modalInitialState = await evaluate(`document.getElementById('booking-modal').classList.contains('active')`);
        console.log(`  - Modal active initially: ${modalInitialState}`);

        await evaluate(`document.querySelector('.open-modal-btn').click()`);
        await new Promise(r => setTimeout(r, 400));
        
        const modalStateAfterClick = await evaluate(`document.getElementById('booking-modal').classList.contains('active')`);
        console.log(`  - Modal active after click: ${modalStateAfterClick}`);
        if (modalStateAfterClick) {
            console.log('  -> STATUS: PASS');
        } else {
            console.log('  -> STATUS: FAIL');
        }

        // Test 6: Form Submission and Success Toast
        console.log('\n[TEST 6] Lead Capture & Success Toast notifications:');
        // Fill contact form
        await evaluate(`
            document.getElementById('name').value = 'Test Athlete';
            document.getElementById('email').value = 'athlete@apexperformance.club';
            document.getElementById('phone').value = '+1 (555) 019-9283';
            document.getElementById('message').value = 'I would like to book my free trial session next Monday evening.';
            document.getElementById('plan-select').value = 'Elite';
        `);
        console.log('  - Filled contact form inputs.');

        const toastInitialState = await evaluate(`document.getElementById('success-toast').classList.contains('active')`);
        console.log(`  - Toast active initially: ${toastInitialState}`);

        // Trigger form submit
        await evaluate(`
            const form = document.getElementById('contact-form');
            const event = new Event('submit', { cancelable: true });
            form.dispatchEvent(event);
        `);
        console.log('  - Submitted form.');

        // Wait for visual delay state
        await new Promise(r => setTimeout(r, 1600));

        const toastStateAfterSubmit = await evaluate(`document.getElementById('success-toast').classList.contains('active')`);
        console.log(`  - Toast active after submit: ${toastStateAfterSubmit}`);
        if (toastStateAfterSubmit) {
            console.log('  -> STATUS: PASS');
        } else {
            console.log('  -> STATUS: FAIL');
        }

        // Test 7: Interactive Calculator
        console.log('\n[TEST 7] Interactive Macro Calculator verification:');
        const initialCalories = await evaluate(`document.getElementById('calories-display').textContent`);
        console.log(`  - Initial Calories displayed: ${initialCalories}`);
        
        // Change weight input to 100 kg
        await evaluate(`
            const weightInput = document.getElementById('calc-weight');
            weightInput.value = 100;
            const calcEvent = new Event('input');
            weightInput.dispatchEvent(calcEvent);
        `);
        await new Promise(r => setTimeout(r, 400));
        
        const updatedCalories = await evaluate(`document.getElementById('calories-display').textContent`);
        console.log(`  - Updated Calories (100kg weight): ${updatedCalories}`);
        if (initialCalories !== updatedCalories) {
            console.log('  -> STATUS: PASS');
        } else {
            console.log('  -> STATUS: FAIL');
        }

        // Test 8: Video Testimonials Modal Toggle
        console.log('\n[TEST 8] Video Testimonials modal trigger:');
        const videoModalInitial = await evaluate(`document.getElementById('video-modal').classList.contains('active')`);
        console.log(`  - Video Modal active initially: ${videoModalInitial}`);
        
        await evaluate(`document.querySelector('.video-card').click()`);
        await new Promise(r => setTimeout(r, 400));
        
        const videoModalAfterClick = await evaluate(`document.getElementById('video-modal').classList.contains('active')`);
        console.log(`  - Video Modal active after clicking card: ${videoModalAfterClick}`);
        if (videoModalAfterClick) {
            console.log('  -> STATUS: PASS');
        } else {
            console.log('  -> STATUS: FAIL');
        }

        console.log('\n=============================================');
        console.log('             ALL TESTS FINISHED              ');
        console.log('=============================================');

    } catch (err) {
        console.error('An error occurred during testing:', err);
    } finally {
        if (client) {
            await client.close();
            console.log('Closed CDP connection.');
        }
        if (chromeProcess) {
            console.log('Terminating Chrome process...');
            chromeProcess.kill();
        }
        console.log('Test run finished.');
        process.exit(0);
    }
}

run();
