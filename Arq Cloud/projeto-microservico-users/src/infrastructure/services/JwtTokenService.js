/**
 * JWT TOKEN SERVICE (Infrastructure Layer - Adapter)
 * Concrete implementation of ITokenService using jsonwebtoken
 */

const jwt = require('jsonwebtoken');
const ITokenService = require('../../application/services/ITokenService');

class JwtTokenService extends ITokenService {
  constructor(secret, expiresIn = '7d') {
    super();
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generate(userId) {
    return jwt.sign({ userId }, this.secret, {
      expiresIn: this.expiresIn
    });
  }

  verify(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }
}

module.exports = JwtTokenService;
