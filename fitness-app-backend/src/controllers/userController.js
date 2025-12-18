import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.id
      }
    });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { height, weight, age, gender, dailyStepGoal, calorieGoal } = req.body;

    // 计算 BMI
    let bmi = null;
    if (height && weight) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 10) / 10;
    }

    const profile = await prisma.profile.update({
      where: {
        userId: req.user.id
      },
      data: {
        ...(height !== undefined && { height }),
        ...(weight !== undefined && { weight }),
        ...(age !== undefined && { age }),
        ...(gender !== undefined && { gender }),
        ...(dailyStepGoal !== undefined && { dailyStepGoal }),
        ...(calorieGoal !== undefined && { calorieGoal }),
        ...(bmi !== null && { bmi })
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;

    const user = await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isPremium: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};