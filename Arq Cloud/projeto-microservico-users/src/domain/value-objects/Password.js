/**
 * PASSWORD VALUE OBJECT (Domain Layer)
 * Immutable value object for password validation
 */

class Password {
  constructor(value) {
    this.value = this._validate(value);
  }

  _validate(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Senha é obrigatória');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    return password;
  }

  getValue() {
    return this.value;
  }

  // For security, password value objects should not be compared
  toString() {
    return '***';
  }
}

module.exports = Password;
