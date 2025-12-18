import express from 'express';
import { body } from 'express-validator';
import { 
  getAllDevices, 
  getDeviceById,
  addDevice, 
  updateDevice,
  deleteDevice,
  syncDevice 
} from '../controllers/deviceController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// 所有设备路由都需要认证
router.use(authenticate);

// 获取所有设备
router.get('/', getAllDevices);

// 获取单个设备
router.get('/:id', getDeviceById);

// 添加设备
router.post('/', [
  body('name').notEmpty().withMessage('Device name is required'),
  body('type').isIn(['watch', 'band', 'scale', 'tracker']).withMessage('Invalid device type'),
  body('model').notEmpty().withMessage('Model is required'),
  body('serialNumber').notEmpty().withMessage('Serial number is required'),
  validate
], addDevice);

// 更新设备
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('isConnected').optional().isBoolean().withMessage('isConnected must be a boolean'),
  body('battery').optional().isInt({ min: 0, max: 100 }).withMessage('Battery must be between 0-100'),
  body('notificationsEnabled').optional().isBoolean(),
  body('autoSyncEnabled').optional().isBoolean(),
  validate
], updateDevice);

// 同步设备
router.post('/:id/sync', syncDevice);

// 删除设备
router.delete('/:id', deleteDevice);

export default router;