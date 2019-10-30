require("dotenv").config();

const request = require("request");
const util = require("util");
const cheerio = require("cheerio");
const twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT,
    process.env.TWILIO_TOKEN
);

const is_dry_run = process.env.DRY_RUN.toUpperCase() === "TRUE";

app();

function app() {
    if(is_dry_run) {
        console.log("NOTE: This is a dry run ...")
    }
    // check if env vars are set
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
                // if we get an error, log silently and move on
                console.log("Error ...", err)
                console.log(`Going to sleep for ${process.env.CHECK_INTERVAL}h ...`)
                setTimeout(function() {
                    app();
                }, process.env.CHECK_INTERVAL * 3600000);
            } else {
                // parse into jq
                const $ = cheerio.load(html);

                // extract title and links from gnews
                $('div.g').each(function(i, element) {
                    const title = $(this).find('.r').text();
                    const link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];
                    savedData.push({
                        title: title,
                        link: link
                    });
                });

                // filter by keyword on the headline
                filteredData = savedData.filter(obj => (obj.title.toLowerCase().includes(process.env.MUST_HAVE_TERM.toLowerCase())));


                // if we got data back including both keywords
                if (filteredData.length > 0) {
                    console.log("Found news ...");

                    // get the first headline only
                    const news = filteredData[0];
                    console.log(news.title);

                    // sms job for twilio
                    function sendSMS(to_number, text) {

                        if(is_dry_run) {
                            console.log(`Dry run: not sending SMS to ${to_number}. Just pretend it does`)
                            return
                        }

                        twilioClient.messages
                            .create({
                                body: text,
                                from: process.env.FROM_NUMBER,
                                to: to_number
                            }).then(message => console.log(`Sent SMS to ${to_number} from Twilio!`));
                    }

                    // if we have multiple to_numbers, split
                    const numbers = process.env.TO_NUMBER.split(" ");
                    console.log(numbers);
                    const msg = `News about '${process.env.SEARCH_TERM}': ${news.title} -- ${news.link}`
                        // for each to_number, send sms
                    numbers.forEach(number => sendSMS(number, msg));

                    // sleep for a while so we don't get spammed
                    // gnews url timeframe is 24h so best to set SNOOZE_INTERVAL to 24 as well
                    console.log(`Going to sleep for ${process.env.SNOOZE_INTERVAL}h ...`)
                    setTimeout(function() {
                        app();
                    }, process.env.SNOOZE_INTERVAL * 3600000);
                } else {
                    // nothing found, keep checking
                    console.log("No news found ...")
                    console.log(`Going to sleep for ${process.env.CHECK_INTERVAL}h ...`)
                    setTimeout(function() {
                        app();
                    }, process.env.CHECK_INTERVAL * 3600000);
                }
            }
        });
    } else {
        throw new Error("Environment variables not set!");
    }
}