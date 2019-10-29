const request = require('request');
const util = require('util');
const cheerio = require('cheerio');

require('dotenv').config()


app()


function app() {
    const searchTerm = process.env.SEARCH_TERM
    const searchUrl = 'https://www.google.com/search?q=' + searchTerm + '&tbm=nws&tbs=qdr:d';
    const getNews = util.promisify(request);

    getNews(searchUrl).then(data => {
        const savedData = [];
        const $ = cheerio.load(data.body);

        $('div.g').each(function(i, element) {
            const title = $(this).find('.r').text();
            const link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];

            savedData.push({
                title,
                link
            });
        });

        const relevantData = savedData.find(o => o['title'].toLowerCase().includes(process.env.MUST_HAVE_TERM.toLowerCase()));
        console.log(relevantData)
    }).catch(err => console.log('error: ', err))
}


function sendSMS(text) {
    this.accountSid = process.env.TWILIO_ACCOUNT || 'AC40ac9addeaa7b822429aec40de07965b';
    this.authToken = process.env.TWILIO_TOKEN || 'f518839e3d8ca792f0e302b493421e08';
    this.client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: text,
            from: '+14804280602',
            to: '+353873413251'
        })
        .then(message => console.log(message.sid));
}