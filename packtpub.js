const puppeteer = require('puppeteer');
const axios = require('axios');

require('dotenv').config();

async function extractBookInfo() {
    try {
        const browser = await puppeteer.launch({headless: process.env.HEADLESS === 'true'});
        const page = await browser.newPage();
        await page.goto('https://www.packtpub.com/packt/offers/free-learning');
        await page.waitForSelector('#free-learning-dropin');
        const bookInfo = {
            title: (await page.$eval('h1.product__title', el => el.innerText)).trim(),
            author: (await page.$eval('h1.product__title + p', el => el.innerText)).trim(),
            publicationDate: (await page.$eval('p.product__publication-date', el => el.innerText)).trim()
        };
        await browser.close();
        console.log(bookInfo);
        return bookInfo;
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function notifyTelegramChannel(botToken, channelId, bookInfo) {
    let message = '_Oops! No book for today_';
    let disableNotification = true;

    if (bookInfo != null) {
        message = `*${bookInfo.title}*`;
        if (bookInfo.author.length > 0) {
            message += `\nAuthor: ${bookInfo.author}`
        }
        if (bookInfo.publicationDate.length > 0) {
            message += `\nPublication Date: ${bookInfo.publicationDate}`
        }
        disableNotification = false;
    }

    const data = {
        chat_id: channelId,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: disableNotification,
        text: message
    };
    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, data);
        console.log(response)
    } catch (e) {
        console.error(e)
    }
}

(async () => {
    const bookInfo = await extractBookInfo();
    await notifyTelegramChannel(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHANNEL_ID, bookInfo)
})();
