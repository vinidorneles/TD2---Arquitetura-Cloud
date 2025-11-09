/**
 * USER ENTITY (Domain Layer)
 * Pure business logic entity - no dependencies on frameworks or databases
 * Follows Clean Architecture principles
 */

class User {
  constructor({ id, name, email, password, authProvider, profilePicture, location, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.authProvider = authProvider || 'local';
    this.profilePicture = profilePicture || '';
    this.location = location || { lat: null, lng: null };
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Business rules and validations
  isLocalAuth() {
    return this.authProvider === 'local';
  }

  isSocialAuth() {
    return ['google', 'facebook'].includes(this.authProvider);
  }

  requiresPassword() {
    return this.isLocalAuth();
  }

  hasLocation() {
    return this.location && this.location.lat !== null && this.location.lng !== null;
  }

  // Returns user without sensitive data
  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      authProvider: this.authProvider,
      profilePicture: this.profilePicture,
      location: this.location,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Update user data
  update({ name, profilePicture, location }) {
    if (name !== undefined) this.name = name;
    if (profilePicture !== undefined) this.profilePicture = profilePicture;
    if (location !== undefined) this.location = location;
    this.updatedAt = new Date();
  }
}

module.exports = User;
