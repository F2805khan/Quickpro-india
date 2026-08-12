import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log("Navigating to https://quickpro-india.onrender.com/ ...");
  try {
    await page.goto('https://quickpro-india.onrender.com/', { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log("Title:", title);
  } catch (err) {
    console.error("Navigation error:", err);
  }

  await browser.close();
})();
