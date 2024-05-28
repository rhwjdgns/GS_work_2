import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 캐릭터 생성 API
router.post("/characters", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { name, health, power, money } = req.body;
  const character = await prisma.Characters.create({
    data: {
      UserId: userId,
      name,
      health,
      power,
      money,
    },
  });

  return res.status(201).json({ data: character });
});

export default router;
