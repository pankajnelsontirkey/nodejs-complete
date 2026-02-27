const { hash, compare } = require('bcryptjs');
const { isEmail, isEmpty, isLength } = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const { JWT_SECRET, PAGE_SIZE } = require('../utils/constants');
const { renameImage, clearImage } = require('../utils/file');

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
    if (isEmpty(imageUrl)) {
      errors.push({ message: 'Image URL is not valid' });
    }

    if (errors?.length > 0) {
      const error = new Error('Invalid post details');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(userId);

    const post = new Post({ title, content, imageUrl, creator: user });

    const originalFilename = post.imageUrl;
    const newfilename = `${post._id.toString()}_${originalFilename}`;
    post.imageUrl = newfilename;
    renameImage(originalFilename, newfilename);

    const createdPost = await post.save();

    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString()
    };
  },
  fetchPosts: async ({ page, pageSize = PAGE_SIZE }, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated.');
      error.code = 401;
      throw error;
    }

    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
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

    if (!user) {
      const error = new Error('User not found!');
      error.code = 404;
      throw error;
    }

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
  },
  updatePost: async ({ postId, postInput }, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated!');
      throw error;
    }

    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Post not found');
      error.code = 404;
      throw error;
    }

    if (post.creator._id.toString() !== userId) {
      const error = new Error('Not authorized!');
      error.code = 403;
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

    post.title = title;
    post.content = content;
    if (imageUrl !== 'undefined') {
      const originalFilename = imageUrl;
      const newfilename = `${post._id.toString()}_${originalFilename}`;
      renameImage(originalFilename, newfilename);

      post.imageUrl = newfilename;
    }

    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString()
    };
  },
  deletePost: async ({ postId }, { req }) => {
    const { isAuth, userId } = req;

    if (!isAuth) {
      const error = new Error('Not authenticated!');
      throw error;
    }

    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not found');
      error.code = 404;
      throw error;
    }

    if (post.creator.toString() !== userId.toString()) {
      const error = new Error('Not authorized!');
      error.code = 403;
      throw error;
    }
    const deleteResult = await post.deleteOne();

    const imageUrl = post.imageUrl;

    if (deleteResult.deletedCount) {
      clearImage(imageUrl);
      const user = await User.findById(userId);
      user.posts.pull(postId);
      await user.save();
    }

    return post._id.toString();
  }
};
