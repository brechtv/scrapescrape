const request = require('request');
const util = require('util');
const cheerio = require('cheerio');

require('dotenv').config();

app();

function app() {
    const searchTerm = process.env.SEARCH_TERM
    const searchUrl = 'https://www.google.com/search?q=' + searchTerm + '&tbm=nws&tbs=qdr:d';
    const savedData = [];

    request(searchUrl, function(err, response, html) {
        if (err) {
            return res.status(500).send(err);
        }
        var $ = cheerio.load(html);

        $('div.g').each(function(i, element) {
            var title = $(this).find('.r').text();
            var link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];
            savedData.push({
                title: title,
                link: link
            });
        });

        filteredData = savedData.filter(obj => (obj.title.toLowerCase().includes(process.env.MUST_HAVE_TERM.toLowerCase())));

        if(filteredData.length > 0) {
        	console.log("Found news ...")
        	console.log(filteredData);
        	console.log("Going to sleep for 12h ...")
        	setTimeout(function(){ 
        		app();
        	 }, 5000);

        	 // }, 43200000);
        } else {
        	console.log("No news found ...")
        	console.log("Going to sleep for 1h ...")
        	setTimeout(function(){ 
        		app();
        	 }, 5000);
        	 // }, 3600000);
        }





    });
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