const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../src/middleware/is-auth');

describe('Auth middleware', function () {
  it('should throw error if no authorization header present', function () {
    const req = {
      get: function (headerName) {
        return null;
      }
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      'Not authenticated.'
    );
  });

  it('should throw error if authorization header is a single string', function () {
    const req = {
      get: function (headerName) {
        return `somerandomtokenwithnobearer`;
      }
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should give us a userId after decoding the token', function () {
    const req = {
      get: function (headerName) {
        return `Bearer randomtokenstring`;
      }
    };

    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'abc' });
    authMiddleware(req, {}, () => {});

    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'abc');

    jwt.verify.restore();
  });

  it('should throw an error if the token cannot be verified', function () {
    const req = {
      get: function (headerName) {
        return `Bearer randomtokenstring`;
      }
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
