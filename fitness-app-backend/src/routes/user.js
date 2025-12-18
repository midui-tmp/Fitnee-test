import express from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile, updateUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// 所有用户路由都需要认证
router.use(authenticate);

// 获取用户配置
router.get('/profile', getProfile);

// 更新用户配置
router.put('/profile', [
  body('height').optional().isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50-300 cm'),
  body('weight').optional().isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20-500 kg'),
  body('age').optional().isInt({ min: 1, max: 150 }).withMessage('Age must be between 1-150'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('dailyStepGoal').optional().isInt({ min: 1000 }).withMessage('Daily step goal must be at least 1000'),
  body('calorieGoal').optional().isInt({ min: 500 }).withMessage('Calorie goal must be at least 500'),
  validate
], updateProfile);

// 更新用户信息
router.put('/me', [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  validate
], updateUser);

export default router;