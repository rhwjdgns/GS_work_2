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

    // 동일한 email 확인
    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });
    if (isExistUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일 입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(
      async (tx) => {
        const user = await tx.users.create({
          data: { email, password: hashedPassword },
        });
        return user;
      },
      {
        isolationLever: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
  } catch (err) {
    next(err);
  }
  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 사용자 로그인 API
router.post("/sign-in", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.Users.findFirst({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  req.session.userId = user.userId;

  return res.status(200).json({ message: "로그인 성공했습니다." });
});

export default router;
