import { Types } from "mongoose";
import { connectDatabase } from "../../database/connection.js";
import { User } from "../users/user.model.js";
import { Wallet } from "./wallet.model.js";
import { WalletTransaction } from "./wallet-transaction.model.js";
import { walletService } from "./wallet.service.js";
import { WalletTransactionSource, WalletTransactionType } from "./wallet.enums.js";

async function testTransfer() {
  try {
    await connectDatabase();

    // ================================
    // 1. FIND USERS
    // ================================

    const sender = await User.findOne({
      username: "rabiu_dev",
    });

    const receiver = await User.findOne({
      username: "malam_01",
    });

    if (!sender?._id) {
      throw new Error("Sender user not found");
    }

    if (!receiver?._id) {
      throw new Error("Receiver user not found");
    }

    const senderId = new Types.ObjectId(sender._id);
    const receiverId = new Types.ObjectId(receiver._id);

    // ================================
    // 2. GET OR CREATE WALLETS
    // ================================

    const senderWalletBefore = await walletService.getOrCreateWallet(senderId);

    const receiverWalletBefore = await walletService.getOrCreateWallet(receiverId);

    // ================================
    // 3. SAVE BEFORE VALUES
    // ================================

    const senderBalanceBefore = senderWalletBefore.balance;
    const receiverBalanceBefore = receiverWalletBefore.balance;

    const senderSpentBefore = senderWalletBefore.totalSpent;
    const receiverReceivedBefore = receiverWalletBefore.totalReceived;

    // ================================
    // 4. TRANSFER AMOUNT
    // ================================

    const amount = 200;

    if (senderBalanceBefore < amount) {
      throw new Error(`Sender does not have enough coins. Balance: ${senderBalanceBefore}`);
    }

    // ================================
    // 5. UNIQUE IDEMPOTENCY KEY
    // ================================

    const idempotencyKey = `transfer-test-${Date.now()}`;

    // ================================
    // 6. EXECUTE TRANSFER
    // ================================

    const transaction = await walletService.transfer({
      fromUserId: senderId,
      toUserId: receiverId,
      amount,
      source: WalletTransactionSource.USER_GIFT,
      idempotencyKey,
      description: "Real transfer test",
    });

    // ================================
    // 7. GET WALLETS AFTER TRANSFER
    // ================================

    const senderWalletAfter = await Wallet.findOne({
      userId: senderId,
    });

    const receiverWalletAfter = await Wallet.findOne({
      userId: receiverId,
    });

    if (!senderWalletAfter) {
      throw new Error("Sender wallet not found after transfer");
    }

    if (!receiverWalletAfter) {
      throw new Error("Receiver wallet not found after transfer");
    }

    // ================================
    // 8. GET BOTH TRANSACTIONS
    // ================================

    const transactions = await WalletTransaction.find({
      idempotencyKey: {
        $in: [`${idempotencyKey}:debit`, `${idempotencyKey}:credit`],
      },
    }).sort({ createdAt: 1 });

    // ================================
    // 9. DISPLAY TEST RESULT
    // ================================

    console.log("\n🧪 REAL TRANSFER TEST\n");

    console.log({
      sender: sender.username,
      receiver: receiver.username,

      amount,

      // Sender balance
      senderBalanceBefore,
      senderBalanceAfter: senderWalletAfter.balance,
      expectedSenderBalance: senderBalanceBefore - amount,

      // Receiver balance
      receiverBalanceBefore,
      receiverBalanceAfter: receiverWalletAfter.balance,
      expectedReceiverBalance: receiverBalanceBefore + amount,

      // Sender total spent
      senderSpentBefore,
      senderSpentAfter: senderWalletAfter.totalSpent,
      expectedSenderSpent: senderSpentBefore + amount,

      // Receiver total received
      receiverReceivedBefore,
      receiverReceivedAfter: receiverWalletAfter.totalReceived,
      expectedReceiverReceived: receiverReceivedBefore + amount,

      // Transactions
      transactionsCount: transactions.length,

      senderTransactionType: transactions[0]?.type,

      receiverTransactionType: transactions[1]?.type,

      senderTransactionAmount: transactions[0]?.amount,

      receiverTransactionAmount: transactions[1]?.amount,

      senderTransactionId: transactions[0]?._id,

      receiverTransactionId: transactions[1]?._id,

      returnedTransactionId: transaction?._id,
    });

    // ================================
    // 10. VALIDATE SENDER BALANCE
    // ================================

    if (senderWalletAfter.balance !== senderBalanceBefore - amount) {
      throw new Error("❌ Sender balance is incorrect");
    }

    // ================================
    // 11. VALIDATE RECEIVER BALANCE
    // ================================

    if (receiverWalletAfter.balance !== receiverBalanceBefore + amount) {
      throw new Error("❌ Receiver balance is incorrect");
    }

    // ================================
    // 12. VALIDATE TOTAL SPENT
    // ================================

    if (senderWalletAfter.totalSpent !== senderSpentBefore + amount) {
      throw new Error("❌ Sender totalSpent is incorrect");
    }

    // ================================
    // 13. VALIDATE TOTAL RECEIVED
    // ================================

    if (receiverWalletAfter.totalReceived !== receiverReceivedBefore + amount) {
      throw new Error("❌ Receiver totalReceived is incorrect");
    }

    // ================================
    // 14. VALIDATE TRANSACTION COUNT
    // ================================

    if (transactions.length !== 2) {
      throw new Error(`❌ Expected 2 transactions, got ${transactions.length}`);
    }

    // ================================
    // 15. VALIDATE SENDER TRANSACTION
    // ================================

    const senderTransaction = transactions.find(
      (transaction) => transaction.idempotencyKey === `${idempotencyKey}:debit`,
    );

    if (!senderTransaction) {
      throw new Error("❌ Sender DEBIT transaction not found");
    }

    if (senderTransaction.type !== WalletTransactionType.DEBIT) {
      throw new Error("❌ Sender transaction should be DEBIT");
    }

    if (senderTransaction.userId.toString() !== senderId.toString()) {
      throw new Error("❌ Sender transaction belongs to wrong user");
    }

    if (senderTransaction.amount !== amount) {
      throw new Error("❌ Sender transaction amount is incorrect");
    }

    // ================================
    // 16. VALIDATE RECEIVER TRANSACTION
    // ================================

    const receiverTransaction = transactions.find(
      (transaction) => transaction.idempotencyKey === `${idempotencyKey}:credit`,
    );

    if (!receiverTransaction) {
      throw new Error("❌ Receiver CREDIT transaction not found");
    }

    if (receiverTransaction.type !== WalletTransactionType.CREDIT) {
      throw new Error("❌ Receiver transaction should be CREDIT");
    }

    if (receiverTransaction.userId.toString() !== receiverId.toString()) {
      throw new Error("❌ Receiver transaction belongs to wrong user");
    }

    if (receiverTransaction.amount !== amount) {
      throw new Error("❌ Receiver transaction amount is incorrect");
    }

    // ================================
    // 17. VALIDATE BALANCE SNAPSHOTS
    // ================================

    if (senderTransaction.balanceBefore !== senderBalanceBefore) {
      throw new Error("❌ Sender balanceBefore is incorrect");
    }

    if (senderTransaction.balanceAfter !== senderBalanceBefore - amount) {
      throw new Error("❌ Sender balanceAfter is incorrect");
    }

    if (receiverTransaction.balanceBefore !== receiverBalanceBefore) {
      throw new Error("❌ Receiver balanceBefore is incorrect");
    }

    if (receiverTransaction.balanceAfter !== receiverBalanceBefore + amount) {
      throw new Error("❌ Receiver balanceAfter is incorrect");
    }

    // ================================
    // 18. SUCCESS
    // ================================

    console.log("\n✅ REAL TRANSFER TEST PASSED\n");
  } catch (error) {
    console.error("\n❌ REAL TRANSFER TEST FAILED:", error);
  }

  process.exit(0);
}

async function testGetBalance() {
  try {
    await connectDatabase();

    // 1. Find user
    const user = await User.findOne({
      username: "rabiu_dev",
    });

    if (!user?._id) {
      throw new Error("User not found");
    }

    const userId = new Types.ObjectId(user._id);

    // 2. Get wallet directly from database
    const wallet = await Wallet.findOne({
      userId,
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // 3. Get balance using service
    const balance = await walletService.getBalance(userId);

    // 4. Display result
    console.log("\n🧪 GET BALANCE TEST\n");

    console.log({
      username: user.username,
      databaseBalance: wallet.balance,
      serviceBalance: balance,
    });

    // 5. Validate
    if (balance !== wallet.balance) {
      throw new Error("❌ getBalance() returned incorrect balance");
    }

    console.log("\n✅ GET BALANCE TEST PASSED\n");
  } catch (error) {
    console.error("\n❌ GET BALANCE TEST FAILED:", error);
  }

  process.exit(0);
}

async function testGetTransactions() {
  try {
    await connectDatabase();

    // 1. Find user
    const user = await User.findOne({
      username: "rabiu_dev",
    });

    if (!user?._id) {
      throw new Error("User not found");
    }

    const userId = new Types.ObjectId(user._id);

    // 2. Get transactions directly from database
    const databaseTransactions = await WalletTransaction.find({
      userId,
    }).sort({ createdAt: -1 });

    // 3. Get transactions using service
    const result = await walletService.getTransactions({
      userId,
      limit: 20,
    });

    // 4. Display result
    console.log("\n🧪 GET TRANSACTIONS TEST\n");

    console.log({
      username: user.username,

      databaseTransactionsCount: databaseTransactions.length,

      serviceTransactionsCount: result.transactions.length,

      hasNextPage: result.hasNextPage,

      nextCursor: result.nextCursor,

      transactions: result.transactions.map((transaction) => ({
        id: transaction._id,
        type: transaction.type,
        source: transaction.source,
        amount: transaction.amount,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        createdAt: transaction.createdAt,
      })),
    });

    // 5. Validate transactions exist
    if (result.transactions.length === 0) {
      throw new Error("❌ getTransactions() returned no transactions");
    }

    // 6. Validate count
    if (result.transactions.length !== Math.min(databaseTransactions.length, 20)) {
      throw new Error("❌ getTransactions() returned incorrect number of transactions");
    }

    // 7. Validate newest transaction
    const newestDatabaseTransaction = databaseTransactions[0];

    const newestServiceTransaction = result.transactions[0];

    if (newestDatabaseTransaction?._id.toString() !== newestServiceTransaction?._id.toString()) {
      throw new Error("❌ Transactions are not sorted correctly");
    }

    // 8. Validate user ownership
    for (const transaction of result.transactions) {
      if (transaction.userId.toString() !== userId.toString()) {
        throw new Error("❌ Transaction belongs to wrong user");
      }
    }

    // 9. Success
    console.log("\n✅ GET TRANSACTIONS TEST PASSED\n");
  } catch (error) {
    console.error("\n❌ GET TRANSACTIONS TEST FAILED:", error);
  }

  process.exit(0);
}

testGetTransactions();
