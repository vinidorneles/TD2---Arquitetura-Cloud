/**
 * EMAIL VALUE OBJECT (Domain Layer)
 * Immutable value object for email validation
 */

class Email {
  constructor(value) {
    this.value = this._validate(value);
  }

  _validate(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email é obrigatório');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalized = email.toLowerCase().trim();

    if (!emailRegex.test(normalized)) {
      throw new Error('Email inválido');
    }

    return normalized;
  }

  getValue() {
    return this.value;
  }

  equals(other) {
    return other instanceof Email && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

module.exports = Email;
