/**
 * TOKEN SERVICE INTERFACE (Application Layer - Port)
 * Defines contract for JWT token generation
 */

class ITokenService {
  generate(userId) {
    throw new Error('Method not implemented');
  }

  verify(token) {
    throw new Error('Method not implemented');
  }
}

module.exports = ITokenService;
