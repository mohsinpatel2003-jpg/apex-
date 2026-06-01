const CDP = require('chrome-remote-interface');

async function runTests() {
    let client;
    try {
        console.log('Connecting to Chrome on port 9222...');
        client = await CDP({ port: 9222 });
        const { Page, Runtime } = client;

        // Enable Page and Runtime domains
        await Page.enable();
        await Runtime.enable();

        console.log('Navigating to http://localhost:8080/...');
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

        console.log('\n--- Running Assertions ---');

        // Test 1: Page Title
        const title = await evaluate('document.title');
        console.log(`Assertion 1 (Title): "${title}"`);
        if (title.includes('Apex Performance Club')) {
            console.log('  [PASS] Title matches expectations.');
        } else {
            console.log('  [FAIL] Title does not match.');
        }

        // Test 2: Verify all key sections exist
        const sections = ['hero', 'programs', 'about', 'results', 'facilities', 'pricing', 'contact'];
        console.log('\nAssertion 2 (Sections Presence):');
        for (const sec of sections) {
            const exists = await evaluate(`!!document.getElementById('${sec}')`);
            console.log(`  Section #${sec}: ${exists ? '[PASS]' : '[FAIL]'}`);
        }

        // Test 3: FAQ Toggle
        console.log('\nAssertion 3 (FAQ Accordion Toggle):');
        const initialFaqState = await evaluate(`document.querySelector('.faq-trigger').getAttribute('aria-expanded')`);
        console.log(`  Initial state: aria-expanded = ${initialFaqState}`);
        
        // Trigger click on first FAQ
        await evaluate(`document.querySelector('.faq-trigger').click()`);
        
        // Wait for dynamic animation
        await new Promise(r => setTimeout(r, 600));
        
        const toggledFaqState = await evaluate(`document.querySelector('.faq-trigger').getAttribute('aria-expanded')`);
        console.log(`  Post-click state: aria-expanded = ${toggledFaqState}`);
        if (toggledFaqState === 'true') {
            console.log('  [PASS] FAQ Expanded correctly.');
        } else {
            console.log('  [FAIL] FAQ failed to expand.');
        }

        // Test 4: Results/Transformation Slider
        console.log('\nAssertion 4 (Results Slider Navigation):');
        const activeSlideIndexBefore = await evaluate(`Array.from(document.querySelectorAll('.transformation-slide')).findIndex(s => s.classList.contains('active'))`);
        console.log(`  Active slide index before click: ${activeSlideIndexBefore}`);

        // Click next slide button
        await evaluate(`document.querySelector('.next-slide').click()`);
        
        const activeSlideIndexAfter = await evaluate(`Array.from(document.querySelectorAll('.transformation-slide')).findIndex(s => s.classList.contains('active'))`);
        console.log(`  Active slide index after click: ${activeSlideIndexAfter}`);
        if (activeSlideIndexAfter === 1) {
            console.log('  [PASS] Slider switched successfully.');
        } else {
            console.log('  [FAIL] Slider did not transition.');
        }

        // Test 5: Open Booking Modal
        console.log('\nAssertion 5 (Booking Modal Opens):');
        const modalInitialState = await evaluate(`document.getElementById('booking-modal').classList.contains('active')`);
        console.log(`  Modal active initially: ${modalInitialState}`);

        // Click a "Book Free Trial" button
        await evaluate(`document.querySelector('.open-modal-btn').click()`);
        
        const modalStateAfterClick = await evaluate(`document.getElementById('booking-modal').classList.contains('active')`);
        console.log(`  Modal active after click: ${modalStateAfterClick}`);
        if (modalStateAfterClick) {
            console.log('  [PASS] Modal opened successfully.');
        } else {
            console.log('  [FAIL] Modal failed to open.');
        }

        // Test 6: Form Submission and Success Toast
        console.log('\nAssertion 6 (Form Submission & Success Toast):');
        // Fill contact form
        await evaluate(`
            document.getElementById('name').value = 'Alex Performance';
            document.getElementById('email').value = 'alex@apexperformance.club';
            document.getElementById('phone').value = '1234567890';
            document.getElementById('message').value = 'I want to build lean muscle and increase strength.';
            document.getElementById('plan-select').value = 'Growth';
        `);
        console.log('  Filled form fields successfully.');

        const toastInitialState = await evaluate(`document.getElementById('success-toast').classList.contains('active')`);
        console.log(`  Toast active initially: ${toastInitialState}`);

        // Submit form
        await evaluate(`
            const form = document.getElementById('contact-form');
            const event = new Event('submit', { cancelable: true });
            form.dispatchEvent(event);
        `);
        console.log('  Dispatched form submit event.');

        // Wait for script.js simulated network submission delay (1200ms)
        await new Promise(r => setTimeout(r, 1600));

        const toastStateAfterSubmit = await evaluate(`document.getElementById('success-toast').classList.contains('active')`);
        console.log(`  Toast active after submit: ${toastStateAfterSubmit}`);
        if (toastStateAfterSubmit) {
            console.log('  [PASS] Success toast displayed.');
        } else {
            console.log('  [FAIL] Success toast did not display.');
        }

        console.log('\nAll assertions completed.');

    } catch (err) {
        console.error('Test execution failed:', err);
    } finally {
        if (client) {
            await client.close();
            console.log('Closed CDP client connection.');
        }
    }
}

runTests();
