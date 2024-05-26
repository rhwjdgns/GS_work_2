import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { Prisma } from "@prisma/client";

const router = express.Router();

// 사용자 회원가입 API
router.post("/sign-up", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const isExistUser = await prisma.AppUsers.findFirst({
      where: { email },
    });
    if (isExistUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일 입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const AppUsers = await prisma.$transaction(
      async (tx) => {
        const AppUsers = await tx.users.create({
          data: { email, password: hashedPassword },
        });
        return AppUsers;
      },
      {
        isolationLever: Prisma.TransactionIsolationLevel.ReadCommiteed,
      }
    );
  } catch (err) {
    next(err);
  }
  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

export default router;
