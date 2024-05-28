import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 캐릭터 생성 API
router.post("/characters", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { name, health, power, money } = req.body;
  const character = await prisma.characters.create({
    data: {
      UserId: userId,
      name,
      health: 500,
      power: 100,
      money: 10000,
    },
  });

  return res.status(201).json({ data: character });
});

// 캐릭터 삭제
router.delete("/characters/:characterId", authMiddleware, async (req, res, next) => {
  try {
    const characterId = parseInt(req.params.characterId, 10);
    const character = await prisma.characters.findUnique({
      where: {
        CharacterId: characterId,
      },
    });

    if (!character) {
      return res.status(404).json({ message: `캐릭터 ID:${characterId} 를 찾을수 없습니다.` });
    }

    await prisma.characters.delete({
      where: {
        CharacterId: characterId,
      },
    });
    return res.status(200).json({ message: "캐릭터 삭제 성공" });
  } catch (error) {
    res.status(500).json({ message: "캐릭터 삭제 실패" });
  }
});

// 캐릭터 조회
router.get("/characters", async (req, res, next) => {
  const characters = await prisma.characters.findMany({
    select: {
      name: true,
      health: true,
      power: true,
    },
  });
  return res.status(200).json({ data: characters });
});

// 캐릭터 상세 조회
router.get("/characters/:characterId", authMiddleware, async (req, res, next) => {
  const { CharacterId } = req.params;
  const character = await prisma.characters.findFirst({
    where: { characterId: CharacterId },
    select: {
      name: true,
      health: true,
      power: true,
      money: true,
    },
  });
  return res.status(200).json({ data: character });
});

export default router;
