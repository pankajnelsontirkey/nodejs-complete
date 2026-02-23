const { hash, compare } = require('bcryptjs');
const { isEmail, isEmpty, isLength } = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { JWT_SECRET } = require('../utils/constants');

module.exports = {
  createUser: async ({ userInput }, req) => {
    const { email, name, password } = userInput;
    const errors = [];
    if (!isEmail(email)) {
      errors.push({ message: 'Email is invalid.' });
    }
    if (isEmpty(password) || !isLength(password, { min: 6 })) {
      errors.push({ message: 'Password too short or empty.' });
    }
    if (isEmpty(name)) {
      errors.push({ message: 'Name is required' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid user details');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User already exists!');
      throw error;
    }

    const hashedPassword = await hash(password, 12);
    const user = new User({ email, password: hashedPassword, name });

    const createduser = await user.save();

    return { ...createduser._doc, _id: createduser._id.toString() };
  },
  login: async ({ email, password }, req) => {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new Error('User not found!');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await compare(password, user.password);

    if (!isEqual) {
      const error = new Error('Password is incorrect!');
      error.statusCode = 401;
      throw error;
    }

    const userId = user._id.toString();
    const token = jwt.sign({ email: user.email, userId }, `${JWT_SECRET}`, {
      expiresIn: '1h'
    });

    return { token, userId };
  }
};
