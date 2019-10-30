# scraposcrape

This scrapes Google News of the last 24 hours for articles about a certain topic and sends a text using Twilio when a new article is posted.

## For example...

You can set the topic/search term to 'Elon Musk' and additionally filter on 'Elephant', so as soon as Elon Musk rides an Elephant and it appears on Google News, you'll get notified by text.

## How to install

The easiest way is to deploy to Heroku. You an also run it locally by cloning the repository and running:

```
npm install
npm start
```

Make  sure you set the environment variables with your Twilio credentials and search terms.
### Environment variables

```
TWILIO_ACCOUNT="ABC"
TWILIO_TOKEN="DEF"
SEARCH_TERM="elon+musk" // term(s) to search for on gnews
MUST_HAVE_TERM="jaguar" // term to filter on in the headline of the results
FROM_NUMBER="+123" // the twilio from number
TO_NUMBER="+123 +123" // can be one phone number or multiple, separated by spaces
CHECK_INTERVAL=0.5 // in hours, e.g 0.5 is 30 min
SNOOZE_INTERVAL=12 // in hours, e.g 12 is 12 hours
```
