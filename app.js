const request = require('request');
const util = require('util');
const cheerio = require('cheerio');

require('dotenv').config();

app();

function app() {
    let resultData = [];
    const searchTerm = process.env.SEARCH_TERM
    const searchUrl = 'https://www.google.com/search?q=' + searchTerm + '&tbm=nws&tbs=qdr:d';
    const getNews = util.promisify(request);

    getNews(searchUrl).then(data => {

    	try {


        const $ = cheerio.load(data.body);
        console.log($)

        $('div.g').each(function(i, element) {
            const title = $(this).find('.r').text();
            const link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];

            resultData.push({
                title,
                link
            });
        });

        if (resultData.length > 0) {
            resultData = resultData.filter(obj => {
                return obj.title.toLowerCase().includes(process.env.MUST_HAVE_TERM.toLowerCase())
            })
            resultData = resultData[0];
            console.log(resultData)

            sendSMS("New article: " + resultData.title + " -- " + resultData.link)
            console.log("Found news! Going to sleep for 24h ... ");
            setTimeout(function() {
                app();
            }, 1000 * 60 * 60 * 24);

        } else {
        	console.log("No news, Going to sleep for 30min ... ");
            setTimeout(function() {
                app();
            }, 1000 * 60 * 60 * 24);
        }
    } catch(err) {
    	console.log(err)
    }
    }).catch(err => console.log('error: ', err))
};

function sendSMS(text) {
    this.accountSid = process.env.TWILIO_ACCOUNT;
    this.authToken = process.env.TWILIO_TOKEN;
    this.client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: text,
            from: process.env.FROM_NUMBER,
            to: process.env.TO_NUMBER
        })
        .then(message => console.log("Sent SMS from Twilio " + message.sid));
}