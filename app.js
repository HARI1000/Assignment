const express = require('express');
const path = require('path');
const TwitterScraper = require('./scraper');
var cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors())

// The below get is used to get the index.html file while opening the url.

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// The below post is used to get the data from the TwitterScraper and puts the repsonse gotten to the index.html

app.post('/scrape', async (req, res) => {
    const scraper = new TwitterScraper();
    try {
        const result = await scraper.getTrendingTopics();
        res.json({
            success: true,
            data: {
                id: result._id,
                trends: [
                    result.trend1,
                    result.trend2,
                    result.trend3,
                    result.trend4,
                    result.trend5
                ],
                timestamp: result.timestamp.toISOString(),
                ip_address: result.ip_address
            },
            rawData:{result}
        });
    } catch (error) {
        console.error('Scraping error:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});