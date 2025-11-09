/**
 * PASSWORD HASH SERVICE INTERFACE (Application Layer - Port)
 * Defines contract for password hashing
 */

class IPasswordHashService {
  async hash(password) {
    throw new Error('Method not implemented');
  }

  async compare(password, hashedPassword) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPasswordHashService;
