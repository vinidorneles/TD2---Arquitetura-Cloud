/**
 * MONGO USER REPOSITORY (Infrastructure Layer - Adapter)
 * Concrete implementation of IUserRepository using MongoDB/Mongoose
 * This is the adapter that connects domain to database technology
 */

const IUserRepository = require('../../../../domain/repositories/IUserRepository');
const User = require('../../../../domain/entities/User');
const UserModel = require('../models/UserModel');

class MongoUserRepository extends IUserRepository {
  async findById(id) {
    const userDoc = await UserModel.findById(id).select('-password');
    return userDoc ? this._toDomain(userDoc) : null;
  }

  async findByEmail(email) {
    const userDoc = await UserModel.findOne({ email });
    return userDoc ? this._toDomain(userDoc) : null;
  }

  async findAll({ page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const userDocs = await UserModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    const total = await UserModel.countDocuments(query);

    return {
      users: userDocs.map(doc => this._toDomain(doc)),
      total
    };
  }

  async create(user) {
    const userModel = new UserModel({
      name: user.name,
      email: user.email,
      password: user.password,
      authProvider: user.authProvider,
      profilePicture: user.profilePicture,
      location: user.location
    });

    const savedDoc = await userModel.save();
    return this._toDomain(savedDoc);
  }

  async update(id, user) {
    const updateData = {
      name: user.name,
      profilePicture: user.profilePicture,
      location: user.location
    };

    const updatedDoc = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedDoc) {
      throw new Error('Usuário não encontrado');
    }

    return this._toDomain(updatedDoc);
  }

  async delete(id) {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }

  async count(query = {}) {
    return await UserModel.countDocuments(query);
  }

  // Convert Mongoose document to Domain Entity
  _toDomain(userDoc) {
    return new User({
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      password: userDoc.password,
      authProvider: userDoc.authProvider,
      profilePicture: userDoc.profilePicture,
      location: userDoc.location,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    });
  }
}

module.exports = MongoUserRepository;
