const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

class TwitterScraper {
    constructor() {
        this.mongoClient = new MongoClient(config.MONGODB_URI);
    }

    getProxy() {
        //later we can add multiple servers here 
        const proxymeshServers = [
            'us-ca.proxymesh.com:31280',
        ];
        const proxyServer = proxymeshServers[Math.floor(Math.random() * proxymeshServers.length)];
        return `http://${config.PROXYMESH_USERNAME}:${config.PROXYMESH_PASSWORD}@${proxyServer}`;
    }

    async setupDriver() {
        const proxy = this.getProxy();
        const options = new chrome.Options();
        options.addArguments(`--proxy-server=${proxy}`);

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        return { driver, proxy };
    }

    async loginToTwitter(driver) {
        // await driver.get('https://whatismyipaddress.com/');
        // await driver.sleep(1000);

        
        // Wait for and fill username
        await driver.get('https://x.com/i/flow/login');
        const usernameInput = await driver.wait(
            until.elementLocated(By.css('input[autocomplete="username"], input[name="text"], input[type="text"]')),
            5000
        );
        await usernameInput.sendKeys(config.TWITTER_USERNAME);
        await driver.findElement(By.xpath('//span[text()="Next"]')).click();

        // // Wait for and fill password
        const passwordInput = await driver.wait(
            until.elementLocated(By.css('input[type="password"]')),
            5000
        );
        await passwordInput.sendKeys(config.TWITTER_PASSWORD);

        await driver.findElement(By.xpath('//span[text()="Log in"]')).click();

        // Wait for login to complete
        await driver.sleep(5000);
    }

    async getTrendingTopics() {
        const { driver, proxy } = await this.setupDriver();
        try {
            //login to the twitter
            await this.loginToTwitter(driver);
            console.log("completed Login");
            
            // THis is to get more than 4 trends and homepages consists of only 4
            await driver.get("https://x.com/explore/tabs/for-you")
            const trendsSection = await driver.wait(
                until.elementLocated(By.css('[aria-label="Timeline: Explore"]')),
                5000
            );
            console.log("Got The Trend Section");
            //searchin and retriving of the trends
            const trendElements = await trendsSection.findElements(By.css('[data-testid="trend"]'));

            console.log("Fecthed Trend Elements");

            const trends = await Promise.all(
                trendElements.slice(0, 5).map(element => {
                    var temp = element.getText();
                    return temp;
                })
            );
            // console.log(trends);
            //we have gotten the trends now storing them inside the doc.
            const doc = {
                _id: uuidv4(),
                timestamp: new Date(),
                trend1: [trends[0].split("\n")] || null,
                trend2: [trends[1].split("\n")] || null,
                trend3: [trends[2].split("\n")] || null,
                trend4: [trends[3].split("\n")] || null,
                trend5: [trends[4].split("\n")] || null,
                ip_address: proxy
            };
            // Connecting and Save to MongoDB
            try {
            await this.mongoClient.connect();
            const db = this.mongoClient.db('twitter_trends');
            await db.collection('trending_topics').insertOne(doc);
            }
            catch(err)
            {console.log("Unable to connect/save",err);}
            return doc;
        } 
        catch(err)
        {
            console.log(err);
        }
        finally {
            await driver.quit();
            await this.mongoClient.close();
        }
    }
}

module.exports = TwitterScraper;