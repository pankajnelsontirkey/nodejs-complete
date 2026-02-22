const { hash } = require('bcryptjs');

const User = require('../models/user');

module.exports = {
  createUser: async ({ userInput }, req) => {
    const { email, name, password } = userInput;
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
