const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../src/models/user');
const { login, getUserStatus } = require('../src/controllers/auth');

describe('Auth Controller', function () {
  this.timeout(10000);

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

  it('should throw 500 error if accessing the database fails!', async function () {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = { body: { email: 'test@test.com', password: 'test' } };
    const result = await login(req, {}, () => {});

    expect(result).to.be.an('error');
    expect(result).to.have.property('statusCode', 500);

    User.findOne.restore();
  });

  it('should send a response with a valid user status for existing user', async function () {
    const req = { userId: '5c0f66b979af55031b34728a' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      }
    };

    await getUserStatus(req, res, () => {});
    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.be.equal('I am new!');
  });

  after(async function () {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
});
