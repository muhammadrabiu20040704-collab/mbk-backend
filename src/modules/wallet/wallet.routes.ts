import { Router } from "express";
import { walletController } from "./wallet.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// Get wallet balance
router.get("/balance", authMiddleware, (req, res) => {
  return walletController.getBalance(req, res);
});

// Get wallet transactions
router.get("/transactions", authMiddleware, (req, res) => {
  return walletController.getTransactions(req, res);
});

// Credit wallet
router.post("/credit", authMiddleware, (req, res) => {
  return walletController.credit(req, res);
});

// Debit wallet
router.post("/debit", authMiddleware, (req, res) => {
  return walletController.debit(req, res);
});

// Transfer funds
router.post("/transfer", authMiddleware, (req, res) => {
  return walletController.transfer(req, res);
});

export default router;
