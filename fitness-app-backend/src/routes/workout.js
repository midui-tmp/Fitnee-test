import express from 'express';
import { body } from 'express-validator';
import { 
  getAllWorkouts, 
  getWorkoutById,
  createWorkout, 
  completeWorkout,
  deleteWorkout 
} from '../controllers/workoutController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// 所有训练路由都需要认证
router.use(authenticate);

// 获取所有训练
router.get('/', getAllWorkouts);

// 获取单个训练
router.get('/:id', getWorkoutById);

// 创建训练
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['cardio', 'strength', 'flexibility', 'balance', 'sports']).withMessage('Invalid category'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  body('description').optional().isString(),
  body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL'),
  validate
], createWorkout);

// 完成训练
router.put('/:id/complete', completeWorkout);

// 删除训练
router.delete('/:id', deleteWorkout);

export default router;