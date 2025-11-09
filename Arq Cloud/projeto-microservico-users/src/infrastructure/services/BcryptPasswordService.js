/**
 * BCRYPT PASSWORD SERVICE (Infrastructure Layer - Adapter)
 * Concrete implementation of IPasswordHashService using bcryptjs
 */

const bcrypt = require('bcryptjs');
const IPasswordHashService = require('../../application/services/IPasswordHashService');

class BcryptPasswordService extends IPasswordHashService {
  constructor(saltRounds = 10) {
    super();
    this.saltRounds = saltRounds;
  }

  async hash(password) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async compare(password, hashedPassword) {
    if (!hashedPassword) return false;
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = BcryptPasswordService;
