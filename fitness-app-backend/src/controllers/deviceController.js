import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDevices = async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await prisma.device.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
};

export const addDevice = async (req, res) => {
  try {
    const { name, type, model, serialNumber } = req.body;

    // 检查设备序列号是否已存在
    const existingDevice = await prisma.device.findUnique({
      where: { serialNumber }
    });

    if (existingDevice) {
      return res.status(400).json({ error: 'Device already registered' });
    }

    const device = await prisma.device.create({
      data: {
        userId: req.user.id,
        name,
        type,
        model,
        serialNumber,
        isConnected: true,
        lastSyncAt: new Date()
      }
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Add device error:', error);
    res.status(500).json({ error: 'Failed to add device' });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isConnected, battery, notificationsEnabled, autoSyncEnabled } = req.body;

    const device = await prisma.device.update({
      where: {
        id,
        userId: req.user.id
      },
      data: {
        ...(name !== undefined && { name }),
        ...(isConnected !== undefined && { isConnected }),
        ...(battery !== undefined && { battery }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
        ...(autoSyncEnabled !== undefined && { autoSyncEnabled }),
        ...(isConnected && { lastSyncAt: new Date() })
      }
    });

    res.json(device);
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.device.delete({
      where: {
        id,
        userId: req.user.id
      }
    });

    res.json({ message: 'Device removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove device' });
  }
};

export const syncDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await prisma.device.update({
      where: {
        id,
        userId: req.user.id
      },
      data: {
        lastSyncAt: new Date()
      }
    });

    res.json({ 
      message: 'Device synced successfully',
      device
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync device' });
  }
};