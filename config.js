const dotenv = require('dotenv');
dotenv.config();
module.exports = {
TWITTER_USERNAME:process.env.TWITTER_USERNAME,
TWITTER_PASSWORD:process.env.TWITTER_PASSWORD,
PROXYMESH_USERNAME:process.env.PROXYMESH_USERNAME,
PROXYMESH_PASSWORD:process.env.PROXYMESH_PASSWORD,
MONGODB_URI:process.env.MONGODB_URI
};