const { hash } = require('bcryptjs');
const { isEmail, isEmpty, isLength } = require('validator');

const User = require('../models/user');

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
  }
};
