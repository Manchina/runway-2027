import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVisualAudit() {
  console.log('🚀 Starting Puppeteer Visual & Functional UI Audit...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  const url = process.env.APP_URL || 'http://localhost:5173';
  console.log(`Navigating to ${url}...`);

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
  } catch (e) {
    console.error('Failed to connect to dev server:', e.message);
    await browser.close();
    process.exit(1);
  }

  // Load demo data if empty to showcase populated dashboard
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Demo Data')) {
      console.log('📦 Hydrating demo data for rich dashboard visuals...');
      await btn.click();
      await delay(500);
      break;
    }
  }

  // 1. Capture Overview Cockpit
  console.log('📸 1. Capturing Executive Cockpit overview...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_executive_cockpit.png'), fullPage: true });

  // 2. Click Track 1: NeetCode 150 Tab
  console.log('👉 2. Navigating to Track 1 (NeetCode)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dsa = btns.find((b) => b.textContent && b.textContent.includes('Track 1'));
    if (dsa) dsa.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_track1_dsa.png'), fullPage: true });

  // 3. Click Track 2: Alex Xu Systems Tab
  console.log('👉 3. Navigating to Track 2 (Alex Xu Systems)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const hld = btns.find((b) => b.textContent && b.textContent.includes('Track 2'));
    if (hld) hld.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_track2_hld.png'), fullPage: true });

  // 4. Click 48-Hour Friction Queue Tab
  console.log('👉 4. Navigating to 48h Friction Queue Tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const q = btns.find((b) => b.textContent && b.textContent.includes('48h Friction'));
    if (q) q.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_friction_queue.png'), fullPage: true });

  // 5. Open Log Modal
  console.log('👉 5. Testing Log Solve Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const log = btns.find((b) => b.textContent && b.textContent.includes('Log Solve'));
    if (log) log.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_log_modal.png') });

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('div[role="dialog"] button, .fixed button');
    if (closeBtn) closeBtn.click();
  });
  await delay(400);

  // 6. Mobile Viewport Check
  console.log('📱 6. Testing Mobile Responsive Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ov = btns.find((b) => b.textContent && b.textContent.includes('Executive Cockpit'));
    if (ov) ov.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mobile_view.png'), fullPage: true });

  await browser.close();

  console.log('\n--- AUDIT REPORT ---');
  if (consoleErrors.length > 0) {
    console.error('⚠️ Console errors detected:', consoleErrors);
  } else {
    console.log('✅ ZERO console/runtime errors detected!');
  }
  console.log('✅ All 6 visual snapshots captured successfully in /screenshots!');
}

runVisualAudit().catch((err) => {
  console.error('Visual audit failed:', err);
  process.exit(1);
});
