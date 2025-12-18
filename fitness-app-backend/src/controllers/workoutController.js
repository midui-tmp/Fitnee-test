import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllWorkouts = async (req, res) => {
  try {
    const { category, level, isCompleted } = req.query;

    const where = {
      userId: req.user.id
    };

    if (category) where.category = category;
    if (level) where.level = level;
    if (isCompleted !== undefined) where.isCompleted = isCompleted === 'true';

    const workouts = await prisma.workout.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
};

export const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;

    const workout = await prisma.workout.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const { title, description, category, level, duration, calories, coverImage } = req.body;

    const workout = await prisma.workout.create({
      data: {
        userId: req.user.id,
        title,
        description,
        category,
        level,
        duration,
        calories,
        coverImage
      }
    });

    res.status(201).json(workout);
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
};

export const completeWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    const workout = await prisma.workout.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });

    // 更新今日活动数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.activity.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      update: {
        calories: {
          increment: workout.calories
        },
        activeMinutes: {
          increment: workout.duration
        }
      },
      create: {
        userId: req.user.id,
        date: today,
        calories: workout.calories,
        activeMinutes: workout.duration
      }
    });

    res.json(updatedWorkout);
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Failed to complete workout' });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.workout.delete({
      where: {
        id,
        userId: req.user.id
      }
    });

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workout' });
  }
};