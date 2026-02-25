const { hash, compare } = require('bcryptjs');
const { isEmail, isEmpty, isLength } = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const { JWT_SECRET } = require('../utils/constants');
const { PAGE_SIZE } = require('../../frontend/src/util/constants');

module.exports = {
  createUser: async ({ userInput }, _context) => {
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
  login: async ({ email, password }, _context) => {
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
  },
  createPost: async ({ postInput }, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated.');
      error.code = 401;
      throw error;
    }

    const { title, content, imageUrl } = postInput;

    const errors = [];
    if (isEmpty(title) || !isLength(title, { min: 6 })) {
      errors.push({ message: 'Title is invalid.' });
    }
    if (isEmpty(content) || !isLength(content, { min: 6 })) {
      errors.push({ message: 'Content is invalid.' });
    }

    if (errors?.length > 0) {
      const error = new Error('Invalid post details');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(userId);

    const post = new Post({ title, content, imageUrl, creator: user });
    const createdPost = await post.save();

    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  },
  posts: async ({ page }, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated.');
      error.code = 401;
      throw error;
    }

    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .populate('creator');

    return {
      posts: posts.map((post) => ({
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
      })),
      totalPosts
    };
  },
  status: async (_args, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated.');
      error.code = 401;
      throw error;
    }

    const user = await User.findById(userId).select('status');

    return user.status;
  },
  updateStatus: async ({ statusText }, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated.');
      error.code = 401;
      throw error;
    }

    const errors = [];

    if (isEmpty(statusText) || !isLength(statusText, { min: 6 })) {
      errors.push('Text missing or invalid.');
    }

    if (errors.length > 0) {
      const error = new Error('Invalid status');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(userId);
    user.status = statusText;
    await user.save();
    return user.status;
  },
  getPost: async ({ postId }, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated.');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Post not found');
      error.code = 404;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }
};
