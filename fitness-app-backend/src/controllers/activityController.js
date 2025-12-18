import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTodayActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activity = await prisma.activity.findFirst({
      where: {
        userId,
        date: {
          gte: today
        }
      }
    });

    if (!activity) {
      activity = await prisma.activity.create({
        data: {
          userId,
          date: today
        }
      });
    }

    res.json(activity);
  } catch (error) {
    console.error('Get today activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { steps, calories, distance, activeMinutes, heartRate } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await prisma.activity.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      update: {
        ...(steps !== undefined && { steps }),
        ...(calories !== undefined && { calories }),
        ...(distance !== undefined && { distance }),
        ...(activeMinutes !== undefined && { activeMinutes }),
        ...(heartRate !== undefined && { heartRate })
      },
      create: {
        userId,
        date: today,
        steps: steps || 0,
        calories: calories || 0,
        distance: distance || 0,
        activeMinutes: activeMinutes || 0,
        heartRate
      }
    });

    res.json(activity);
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

export const getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        date: {
          gte: weekAgo,
          lte: today
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.json(activities);
  } catch (error) {
    console.error('Get weekly activity error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly activity' });
  }
};

export const getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        date: {
          gte: monthAgo
        }
      }
    });

    const stats = {
      totalSteps: activities.reduce((sum, a) => sum + a.steps, 0),
      totalCalories: activities.reduce((sum, a) => sum + a.calories, 0),
      totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
      totalActiveMinutes: activities.reduce((sum, a) => sum + a.activeMinutes, 0),
      averageSteps: Math.round(activities.reduce((sum, a) => sum + a.steps, 0) / activities.length) || 0,
      daysActive: activities.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
};