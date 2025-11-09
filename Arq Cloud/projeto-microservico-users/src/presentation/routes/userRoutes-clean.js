/**
 * USER ROUTES (Clean Architecture)
 * Using Clean Architecture controllers
 */

const express = require('express');
const authMiddleware = require('../../middleware/auth');
const userController = require('../controllers/userController-clean');

const router = express.Router();

// Public routes
router.get('/', userController.getUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));

// Protected routes
router.put('/:id', authMiddleware, userController.updateUser.bind(userController));
router.delete('/:id', authMiddleware, userController.deleteUser.bind(userController));

module.exports = router;
