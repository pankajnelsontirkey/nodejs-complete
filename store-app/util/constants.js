const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
  ORDERS: 'orders'
};

const ITEMS_PER_PAGE = 2;

const {
  PORT,
  BASE_URL,
  MONGODB_URI,
  MONGODB_DB_NAME,
  SESSION_SECRET,
  CSRF_SECRET
} = process.env;

module.exports = {
  COLLECTIONS,
  BASE_URL,
  PORT,
  ITEMS_PER_PAGE,
  MONGODB_URI,
  MONGODB_DB_NAME,
  PORT,
  SESSION_SECRET,
  CSRF_SECRET
};
