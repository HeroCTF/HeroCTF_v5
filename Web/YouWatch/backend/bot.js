var cron = require('node-cron');
var puppeteer = require("puppeteer")
const {sequelize,Message} = require("./models")
  
async function visitPage()
{
    var bot_user = process.env.BOT_USER;
    var bot_pass = process.env.BOT_PASSWORD;
    var frontend = process.env.FRONTEND_BOT
    const admin_video_id = "46634e1e-2738-4898-934d-7f044eb2a364";
    const admin_chat_id = "68d399ca-9c47-4092-a610-6e725c6f6599";
    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: ["--no-sandbox", "--ignore-certificate-errors" ],
        executablePath: "/usr/bin/chromium"
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(5000);
    await page.goto(`${frontend}/`)
    const username = await page.waitForSelector("#pseudo");
    const password = await page.waitForSelector("#password");

    await username.type(bot_user)
    await password.type(bot_pass)
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    await page.goto(`${frontend}/video/view/${admin_video_id}`)
    /** 
    await Message.destroy({
        where: {
            chatId: admin_chat_id
        }
    })*/
    console.log("passed")
    browser.close();
    return;
}

cron.schedule('*/1 * * * *', visitPage);