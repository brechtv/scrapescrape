require("dotenv").config();

const request = require("request");
const util = require("util");
const cheerio = require("cheerio");
const twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT, 
    process.env.TWILIO_TOKEN
    );

(function() {
    if (
        process.env.TWILIO_ACCOUNT &&
        process.env.TWILIO_TOKEN &&
        process.env.SEARCH_TERM &&
        process.env.MUST_HAVE_TERM &&
        process.env.FROM_NUMBER &&
        process.env.TO_NUMBER &&
        process.env.CHECK_INTERVAL &&
        process.env.SNOOZE_INTERVAL
    ) {
        const searchTerm = process.env.SEARCH_TERM;
        const searchUrl = `https://www.google.com/search?q=${searchTerm}&tbm=nws&tbs=qdr:d`;
        const savedData = [];

        request(searchUrl, function(err, response, html) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            };

            const $ = cheerio.load(html);

            $('div.g').each(function(i, element) {
                const title = $(this).find('.r').text();
                const link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];
                savedData.push({
                    title: title,
                    link: link
                });
            });

            filteredData = savedData.filter(obj => (obj.title.toLowerCase().includes(process.env.MUST_HAVE_TERM.toLowerCase())));

            if (filteredData.length > 0) {
                console.log("Found news ...");

                const news = filteredData[0];

                function sendSMS(to_number, text) {

                    twilioClient.messages
                        .create({
                            body: text,
                            from: process.env.FROM_NUMBER,
                            to: to_number
                        }).then(message => console.log(`Sent SMS to ${to_number} from Twilio!`));
                }

                const numbers = process.env.TO_NUMBER.split(" ");
                console.log(numbers);
                const msg = `News about '${process.env.SEARCH_TERM}': ${news.title} -- ${news.link}`
                numbers.forEach(number => sendSMS(number, msg));


                console.log(`Going to sleep for ${process.env.SNOOZE_INTERVAL}h ...`)
                setTimeout(function() {
                    app();
                }, process.env.SNOOZE_INTERVAL * 3600000);

            } else {
                console.log("No news found ...")
                console.log(`Going to sleep for ${process.env.CHECK_INTERVAL}h ...`)
                setTimeout(function() {
                    app();
                }, process.env.CHECK_INTERVAL * 3600000);
            }
        });
    } else {
        throw new Error("Environment variables not set!");
    }
})();