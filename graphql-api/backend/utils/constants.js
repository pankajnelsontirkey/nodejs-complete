const { CLIENT_URL, MONGODB_URL, JWT_SECRET } = process.env;

const PORT = 8080;

const PAGE_SIZE = 3;

module.exports = { CLIENT_URL, MONGODB_URL, JWT_SECRET, PORT, PAGE_SIZE };
