const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../src/models/user');
const { createPost } = require('../src/controllers/feed');

describe('Feed Controller', function () {
  this.timeout(5000);

  before(async function () {
    await mongoose.connect(`mongodb://127.0.0.1:27017/test`);
    const user = new User({
      email: 'test@test.com',
      password: 'test',
      name: 'Test',
      posts: [],
      _id: '5c0f66b979af55031b34728a'
    });
    await user.save();
  });

  it('should add a created post to the posts of the user', async function () {
    const req = {
      body: {
        title: 'Test post',
        content: 'Test content'
      },
      file: { path: 'testpath' },
      userId: '5c0f66b979af55031b34728a'
    };

    const res = {
      status: function () {
        return this;
      },
      json: function () {}
    };
    const result = await createPost(req, res, () => {});
    expect(result).to.have.property('posts');
    expect(result.posts).to.have.length(1);
  });

  after(async function () {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
});
