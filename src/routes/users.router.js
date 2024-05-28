import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { Prisma } from "@prisma/client";

const router = express.Router();
const emailRegex = /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]+$/;
const minLength = 6;

// 사용자 회원가입 API
router.post("/sign-up", async (req, res, next) => {
  const { email, password, passwordCheck, name } = req.body;

  // 동일한 email 확인
  const isExistUser = await prisma.users.findFirst({
    where: { email },
  });
  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 이메일 입니다." });
  }
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "이메일은 영어 소문자와 숫자 조합으로만 이루어져야 합니다." });
  }
  if (password.length < minLength) {
    return res.status(400).json({ message: `password는 ${minLength}자 이상이어야 합니다.` });
  }
  if (password !== passwordCheck) {
    return res.status(400).json({ message: "password는 passwordCheck와 일치해야 합니다." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      passwordCheck,
      name,
    },
    select: {
      userId: true,
      email: true,
      name: true,
    },
  });

  return res.status(201).json({ data: user });
});

// 사용자 로그인 API
router.post("/sign-in", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  // JWT 발급
  req.session.userId = user.userId;

  return res.status(200).json({ message: "로그인 성공했습니다." });
});

export default router;
