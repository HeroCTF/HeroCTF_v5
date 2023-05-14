// required packages
const puppeteer = require("puppeteer");

// variables
const host = "https://simplenotes.heroctf.fr";

// sleep
const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

// navigate
async function goto(url) {
	const browser = await puppeteer.launch({
		headless: true,
		ignoreHTTPSErrors: true,
		args: [ "--no-sandbox", "--ignore-certificate-errors" ],
		executablePath: "/usr/bin/chromium-browser"
	});

	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(5000);

    // Setup bot context
    await page.goto(host)
	const username = await page.waitForSelector("#username");
	const password = await page.waitForSelector("#password");
	await username.type("super_secret_admin_user");
	await password.type("bcf85313ede5a49e3ae2d8aa8403527d");
	await page.keyboard.press("Enter");
    await page.waitForNavigation();

    // Go to provided URL
	try {
	    await page.goto(url);
	} catch {}

    await delay(1000);

    browser.close();
	return;
}

if (process.argv.length === 2) {
    console.error("No URL provided!");
    process.exit(1);
}

goto(process.argv[2]);
