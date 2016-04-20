/*
 * Claim the daily free book from Packt.
 */

var casper = require('casper').create({
    // verbose: true,
    logLevel: "debug"
});
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36');

var email;
var password;
var bookTitle;
var bookDesc;

casper.start('https://www.packtpub.com/packt/offers/free-learning', function () {
    this.viewport(1366, 768);

    // Check the parameters
    if (!casper.cli.has(0)) {
        this.die("Missing parameter 1: login email", 1);
    }
    if (!casper.cli.has(1)) {
        this.die("Missing parameter 2: login password", 1);
    }
    email = casper.cli.get(0);
    password = casper.cli.get(1);
});
casper.then(function () {
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

casper.run();
