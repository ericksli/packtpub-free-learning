/*
 * Claim the daily free book from Packt.
 */

var config = require('./config.json');
var casper = require('casper').create({
    // verbose: true,
    logLevel: "debug"
});
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36');

var email = config.email;
var password = config.password;
var bookTitle = "";
var bookDesc = "";
var telegramBotToken = config.telegramBotToken;
var telegramChannelId = config.telegramChannelId;

casper.start('https://www.packtpub.com/packt/offers/free-learning', function () {
    this.viewport(1366, 768);

    bookTitle = this.fetchText('.dotd-main-book-summary .dotd-title h2').trim();
    bookDesc = this.fetchText('.dotd-main-book-summary p').trim();
    this.echo("Today's book: " + bookTitle + "\n" + bookDesc, 'INFO');
});
casper.wait(2000, function () {
    // Close the promotion dialog if shown
    if (this.exists("w-div[role='dialog']")) {
        this.echo('Close the promotion dialog', 'INFO');
        this.click("w-div[role='dialog'] span");
    } else {
        this.echo('No promotion dialog shown', 'INFO');
    }
});
casper.then(function () {
    // Click claim button
    this.echo('Click claim button', 'INFO');
    this.click(".book-claim-token-inner input[type='submit']")
});
casper.wait(2500, function () {
    // Fill login form and then submit
    this.echo('Fill the login form', 'INFO');
    this.fill('#packt-user-login-form', {email: email, password: password}, true);
});
casper.waitForSelector(".book-claim-token-inner input[type='submit']", function () {
    // Logged in, click claim button again
    this.echo('Click claim button again', 'INFO');
    this.click(".book-claim-token-inner input[type='submit']")
});
casper.waitForUrl('https://www.packtpub.com/account/my-ebooks', function () {
    // Click logout link
    this.echo('Claimed the book ' + bookTitle + '!', 'GREEN_BAR');
    this.click("a[href='/logout']");
});
casper.then(function () {
    this.echo('Logged out', 'INFO');
});
casper.then(function () {
    var message = "*" + bookTitle + "*\n" +
        bookDesc + "\n" +
        "https://www.packtpub.com/packt/offers/free-learning";

    this.open('https://api.telegram.org/bot' + telegramBotToken + '/sendMessage', {
        method: 'POST',
        data: {
            'chat_id': telegramChannelId,
            'parse_mode': 'Markdown',
            'text': message
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }, function () {
        this.echo('Publish to Telegram channel', 'INFO');
    });
});

casper.run();
