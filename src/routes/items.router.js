import express from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/index.js";

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

export default router;
