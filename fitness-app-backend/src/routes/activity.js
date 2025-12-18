import express from 'express';
import { body } from 'express-validator';
import { 
  getTodayActivity, 
  updateActivity, 
  getWeeklyActivity,
  getActivityStats 
} from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// 所有活动路由都需要认证
router.use(authenticate);

// 获取今日活动
router.get('/today', getTodayActivity);

// 更新今日活动
router.put('/today', [
  body('steps').optional().isInt({ min: 0 }).withMessage('Steps must be a positive integer'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  body('distance').optional().isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('activeMinutes').optional().isInt({ min: 0 }).withMessage('Active minutes must be a positive integer'),
  body('heartRate').optional().isInt({ min: 30, max: 250 }).withMessage('Heart rate must be between 30-250'),
  validate
], updateActivity);

// 获取本周活动
router.get('/weekly', getWeeklyActivity);

// 获取活动统计
router.get('/stats', getActivityStats);

export default router;