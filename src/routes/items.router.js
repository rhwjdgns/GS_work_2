import express from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 아이템 생성
router.post("/items", async (req, res, next) => {
  const { item_name, item_stat, item_price } = req.body;

  // 동일한 item_code가 있는지 확인.
  const isExistitem = await prisma.items.findFirst({
    where: { item_name },
  });
  if (isExistitem) {
    return res.status(409).json({ message: "이미 존재하는 아이템 입니다." });
  }

  const item = await prisma.items.create({
    data: {
      item_name,
      item_stat,
      item_price,
    },
  });
  return res.status(201).json({ data: item });
});

// 아이템 수정
router.put("/items/:item_code", async (req, res, next) => {
  const item_code = +req.params.item_code;
  const updatedData = req.body;
  delete updatedData.item_price;

  const item = await prisma.items.findUnique({
    where: { item_code },
  });

  if (!item) {
    return res
      .status(404)
      .json({ message: `아이템 코드 ${item_code}에 해당하는 아이템을 찾을 수 없습니다.` });
  }

  const updatedItem = await prisma.items.update({
    where: { item_code },
    data: updatedData,
  });

  return res.status(200).json({ message: "아이템 수정 성공." });
});

// 아이템 목록 조회
router.get("/items", async (req, res, next) => {
  const item = await prisma.items.findMany({
    select: {
      item_code: true,
      item_name: true,
      item_price: true,
    },
  });
  return res.status(200).json({ data: item });
});

// 아이템 상세 조회
router.get("/items/:item_code", async (req, res, next) => {
  const { item_code } = req.params;
  const item = await prisma.items.findFirst({
    where: { item_code: +item_code },
    select: {
      item_code: true,
      item_name: true,
      item_stat: true,
      item_price: true,
    },
  });
  return res.status(200).json({ data: item });
});

export default router;
