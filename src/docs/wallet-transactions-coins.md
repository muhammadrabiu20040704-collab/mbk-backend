MBK Backend — Wallet & Coin System Documentation

Project: MBK Backend
Document: Wallet & Coin System
Version: 1.0
Status: Completed — Pending Final Git Commit
Branch: "master"
Sprint: Wallet Foundation, Coin Ledger & Transaction Security

---

1. Overview

This document describes the MBK backend Wallet and Coin System.

The Wallet system is responsible for securely managing virtual MBK coins belonging to users.

The system provides:

- Wallet creation.
- Wallet balance management.
- Coin crediting.
- Coin debiting.
- User-to-user coin transfers.
- Transaction history.
- Cursor-based transaction pagination.
- Transaction idempotency.
- Insufficient-balance protection.
- Transaction ledger records.
- Atomic wallet updates using MongoDB transactions.
- Security validation for wallet operations.

The Wallet module is designed as a financial-style ledger engine for MBK's virtual coin system.

The Wallet module does not decide why a user deserves a reward.

For example:

- Debate module decides debate rewards.
- Presentation module decides presentation rewards.
- Achievement module decides achievement rewards.
- Admin/Reward logic may issue configured rewards.

The Wallet module receives the approved operation and securely updates the user's wallet.

---

2. Wallet Architecture

The wallet architecture follows a modular feature-based design.

                    ┌──────────────────┐
                    │   MBK Client     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Wallet Controller│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Wallet Service  │
                    └────────┬─────────┘
                             │
               ┌─────────────┼─────────────┐
               ▼             ▼             ▼
          Wallet Model   Transaction   MongoDB
                           Model

The main responsibility of each layer is:

Controller
    ↓
Request validation / HTTP response

Service
    ↓
Business operation / transaction logic

Wallet Model
    ↓
Current wallet state

Transaction Model
    ↓
Immutable-style transaction history / ledger

MongoDB
    ↓
Persistent storage

---

3. Wallet Module Structure

The Wallet module uses a self-contained feature structure.

src/modules/wallet/

├── wallet.types.ts
├── wallet.enums.ts
├── wallet.model.ts
├── wallet-transaction.types.ts
├── wallet-transaction.model.ts
├── wallet.service.ts
├── wallet.controller.ts
├── wallet.routes.ts
└── wallet.test.ts

Each file has a specific responsibility.

"wallet.types.ts"

Contains Wallet interfaces and service input types.

"wallet.enums.ts"

Contains wallet transaction types and transaction sources.

"wallet.model.ts"

Stores the current wallet state.

"wallet-transaction.types.ts"

Defines transaction ledger structure.

"wallet-transaction.model.ts"

Stores wallet transaction records.

"wallet.service.ts"

Contains wallet business operations.

"wallet.controller.ts"

Handles HTTP requests and responses.

"wallet.routes.ts"

Defines wallet API endpoints.

"wallet.test.ts"

Contains wallet API/service verification tests.

---

4. Wallet Data Model

Each user can have one wallet.

Relationship:

User
 │
 │ 1
 ▼
Wallet

The wallet is associated with a user using:

userId

The wallet stores:

- User ID
- Current balance
- Total earned
- Total spent
- Total received

---

5. Wallet Model

The Wallet model contains:

userId
balance
totalEarned
totalSpent
totalReceived
createdAt
updatedAt

The "userId" field is unique.

This enforces:

One User → One Wallet

The balance cannot be negative.

The model therefore provides an important invariant:

balance >= 0

---

6. Wallet Balance

The wallet balance represents the user's currently available MBK coins.

Example:

Initial Balance
      ↓
     200
      ↓
Credit +100
      ↓
     300
      ↓
Debit -40
      ↓
     260

The wallet service is responsible for maintaining the balance.

Clients cannot directly modify the wallet balance.

---

7. Wallet Statistics

The wallet maintains cumulative statistics.

"totalEarned"

Represents coins earned through supported reward sources.

"totalSpent"

Represents coins removed through spending/debit operations.

"totalReceived"

Represents coins received from another user or supported transfer source.

These values provide useful wallet statistics without requiring aggregation over the entire transaction history for every balance request.

---

8. Wallet Transaction System

Every wallet modification creates a transaction record.

A transaction contains information such as:

userId
type
source
amount
balanceBefore
balanceAfter
referenceId
relatedUserId
idempotencyKey
description
createdAt
updatedAt

This provides an audit-style financial ledger.

Example:

Balance Before
      ↓
     260
      ↓
Debit 50
      ↓
Balance After
      ↓
     210

The transaction records both states.

---

9. Transaction Types

MBK currently supports:

CREDIT
DEBIT
TRANSFER

CREDIT

Adds coins to a wallet.

DEBIT

Removes coins from a wallet.

TRANSFER

Represents a user-to-user coin movement.

Internally, a transfer creates:

Sender
  ↓
DEBIT

Receiver
  ↓
CREDIT

---

10. Transaction Sources

Wallet transactions identify the source of the operation.

Current supported sources include:

DEBATE_TIME_MILESTONE
DEBATE_WIN
DEBATE_LOSS
DEBATE_PERFORMANCE

PRESENTATION_REWARD

ACHIEVEMENT_REWARD

USER_GIFT

ADMIN_REWARD
SYSTEM_REWARD

The source allows MBK to determine why a transaction occurred.

---

11. Wallet Service Responsibilities

The Wallet service currently provides:

getOrCreateWallet()    ✅
credit()               ✅
debit()                ✅
transfer()             ✅
getBalance()           ✅
getTransactions()      ✅
withdrawal()           ⏳ Later

Withdrawal is intentionally outside the current Wallet Foundation sprint.

---

12. Get or Create Wallet

The "getOrCreateWallet()" operation ensures that a user has a wallet.

Flow:

User ID
  │
  ▼
Find Wallet
  │
  ├── Found ──► Return Wallet
  │
  └── Not Found
          │
          ▼
      Create Wallet
          │
          ▼
      Return Wallet

A new wallet starts with:

balance = 0
totalEarned = 0
totalSpent = 0
totalReceived = 0

This also allows a receiver in a transfer operation to receive coins even if their wallet has not previously been created.

---

13. Credit Operation

The credit operation adds coins to a user's wallet.

Input includes:

userId
amount
source
referenceId
idempotencyKey
description

Flow:

Credit Request
      │
      ▼
Validate User ID
      │
      ▼
Validate Amount
      │
      ▼
Check Idempotency
      │
      ▼
Start MongoDB Transaction
      │
      ▼
Get/Create Wallet
      │
      ▼
Calculate New Balance
      │
      ▼
Update Wallet
      │
      ▼
Create Transaction
      │
      ▼
Commit Transaction
      │
      ▼
Return Transaction

---

14. Credit Balance Calculation

Example:

Balance Before = 100
Credit Amount  = 50

Balance After  = 150

The transaction stores:

balanceBefore = 100
amount        = 50
balanceAfter  = 150

---

15. Debit Operation

The debit operation removes coins from a user's wallet.

Input includes:

userId
amount
source
referenceId
idempotencyKey
description

Flow:

Debit Request
      │
      ▼
Validate User
      │
      ▼
Validate Amount
      │
      ▼
Check Idempotency
      │
      ▼
Start Transaction
      │
      ▼
Get Wallet
      │
      ▼
Check Balance
      │
      ├── Insufficient ──► Reject
      │
      ▼
Calculate New Balance
      │
      ▼
Update Wallet
      │
      ▼
Create Transaction
      │
      ▼
Commit

---

16. Insufficient Balance Protection

The Wallet system never allows a wallet to become negative.

Example:

Current Balance = 50
Debit Amount    = 100

The operation is rejected.

Response:

{
  "success": false,
  "message": "Insufficient wallet balance"
}

The wallet remains:

Balance = 50

No transaction is created for the rejected debit.

---

17. Positive Coin Amount Validation

Coin amounts must be positive integers.

Valid:

1
10
50
100

Invalid:

0
-10
10.5

Invalid amounts return:

{
  "success": false,
  "message": "Coin amount must be a positive integer"
}

This rule is enforced by the Wallet service.

---

18. User-to-User Transfer

The Wallet system supports transferring coins between users.

Example:

User A
Balance = 260

       │
       │ Transfer 50
       ▼

User B
Balance = 0

After transfer:

User A = 210
User B = 50

A transfer contains:

Sender
Receiver
Amount
Source
Reference
Idempotency Key
Description

---

19. Transfer Architecture

A transfer consists of two ledger operations.

Sender Wallet
     │
     ▼
   DEBIT
     │
     │ 50 coins
     ▼
Receiver Wallet
     │
     ▼
   CREDIT

Both operations are performed inside one MongoDB transaction.

This is important because the transfer must be atomic.

---

20. Atomic Transfer

A transfer must satisfy:

Sender Debit
      +
Receiver Credit
      =
One Atomic Operation

If any critical operation fails, the MongoDB transaction is rolled back.

Therefore the system avoids a situation where:

Sender loses coins
BUT
Receiver does not receive them

---

21. Transfer Self-Protection

A user cannot transfer coins to themselves.

Example:

Sender = User A
Receiver = User A

The request is rejected.

Response:

{
  "success": false,
  "message": "Cannot transfer coins to yourself"
}

This rule prevents meaningless self-transactions.

---

22. Transfer Validation

The transfer service validates:

1. Sender user ID.
2. Receiver user ID.
3. Sender and receiver are different.
4. Amount is a positive integer.
5. Sender has sufficient balance.
6. Idempotency key is valid for the operation.

Invalid requests are rejected before the wallet balances are changed.

---

23. Transfer Transaction Records

A successful transfer creates two transaction records.

Sender

Type:
DEBIT

Receiver

Type:
CREDIT

Both records can reference the same operation using:

referenceId

and related operation metadata.

This creates a traceable transfer history.

---

24. Idempotency

Wallet operations use idempotency keys.

The purpose is to prevent accidental duplicate financial-style operations.

Example:

Request
idempotencyKey = transfer-001

If the same request is sent again:

transfer-001

the Wallet system recognizes the existing transaction instead of performing another transfer.

---

25. Debit Idempotency

Example:

Initial Balance = 260

Debit 50
idempotencyKey = debit-001

First request:

260 → 210

Same request again:

260 → 210

The second request does not produce:

210 → 160

This prevents duplicate debit operations.

---

26. Transfer Idempotency

Transfers also use idempotency keys.

A transfer internally uses operation-specific transaction keys:

transfer-key:debit
transfer-key:credit

This allows the sender and receiver ledger records to remain unique.

A repeated transfer request using the same idempotency key does not transfer the coins a second time.

---

27. MongoDB Transactions

Wallet balance changes use MongoDB sessions and transactions.

Conceptually:

Start Session
     │
     ▼
Start Transaction
     │
     ▼
Update Wallet
     │
     ▼
Create Ledger Transaction
     │
     ▼
Commit

If an error occurs:

Rollback

This protects wallet consistency.

---

28. Wallet Consistency

The Wallet system follows the principle:

Wallet Balance
      +
Transaction Ledger
      ↓
Consistent State

For a successful debit:

balanceAfter
=
balanceBefore - amount

For a successful credit:

balanceAfter
=
balanceBefore + amount

For a transfer:

Sender After
=
Sender Before - amount

Receiver After
=
Receiver Before + amount

---

29. Transaction History

Users can retrieve their wallet transaction history.

Endpoint:

GET /api/v1/wallet/transactions

Authentication is required.

The system returns transactions belonging to the authenticated user.

A user cannot request another user's private wallet history through the authenticated wallet endpoint.

---

30. Cursor-Based Pagination

The Wallet transaction history uses cursor-based pagination.

Example:

GET /api/v1/wallet/transactions?limit=10

A response can contain:

transactions
hasNextPage
nextCursor

The next request can use:

GET /api/v1/wallet/transactions?limit=10&cursor=<cursor>

Cursor pagination is preferred for large datasets because transaction history can grow significantly over time.

---

31. Transaction Ordering

Transactions are returned from newest to oldest.

Conceptually:

Newest
  ↓
Transaction 5
Transaction 4
Transaction 3
Transaction 2
Transaction 1
  ↓
Oldest

The transaction collection has an index supporting:

userId
createdAt

This improves transaction-history queries.

---

32. Wallet Transaction Indexes

The transaction collection uses indexes including:

userId + createdAt

and:

userId + source + createdAt

These indexes support common wallet-history and source-based queries.

---

33. Unique Idempotency Index

The transaction model uses a unique index on:

idempotencyKey

This provides database-level protection against duplicate transaction identifiers.

The application also checks the idempotency key before performing an operation.

This provides defense in depth:

Application Check
       +
Database Unique Constraint

---

34. Wallet API

The Wallet API is mounted under:

/api/v1/wallet

Available endpoints:

GET  /balance
GET  /transactions

POST /credit
POST /debit
POST /transfer

All wallet endpoints require authentication.

---

35. Get Balance API

Endpoint:

GET /api/v1/wallet/balance

Authentication:

Bearer Access Token

Successful response:

{
  "success": true,
  "data": {
    "balance": 210
  }
}

The authenticated user's ID is taken from the validated JWT.

---

36. Get Transactions API

Endpoint:

GET /api/v1/wallet/transactions

Optional parameters:

limit
cursor

Example:

GET /api/v1/wallet/transactions?limit=10

Invalid limit values are rejected.

Example:

{
  "success": false,
  "message": "Invalid limit"
}

Invalid cursor values are rejected.

Example:

{
  "success": false,
  "message": "Invalid cursor"
}

---

37. Credit API

Endpoint:

POST /api/v1/wallet/credit

Example request:

{
  "amount": 100,
  "source": "system_reward",
  "idempotencyKey": "reward-001",
  "description": "System reward"
}

The operation requires authentication.

The authenticated user's ID is used as the wallet owner.

---

38. Debit API

Endpoint:

POST /api/v1/wallet/debit

Example request:

{
  "amount": 50,
  "source": "user_gift",
  "idempotencyKey": "debit-001",
  "description": "Coin debit"
}

The operation validates:

Authentication
Amount
Wallet balance
Idempotency

---

39. Transfer API

Endpoint:

POST /api/v1/wallet/transfer

Example request:

{
  "toUserId": "USER_ID",
  "amount": 50,
  "source": "user_gift",
  "idempotencyKey": "transfer-001",
  "description": "Coin transfer"
}

The sender is determined from the authenticated JWT.

The client therefore does not provide an arbitrary sender ID.

---

40. Authentication Requirement

All Wallet endpoints use the existing MBK authentication middleware.

Request
   │
   ▼
Authorization Header
   │
   ▼
JWT Validation
   │
   ▼
Authenticated User
   │
   ▼
Wallet Operation

Unauthorized requests return:

401 Unauthorized

Example:

{
  "success": false,
  "message": "Unauthorized"
}

---

41. Wallet Authorization Principle

Wallet operations must always operate on the authenticated user's identity.

For example:

req.user.sub
      ↓
Authenticated User ID
      ↓
Wallet

The client should not be trusted to select another user's wallet as the sender.

This prevents unauthorized wallet manipulation.

---

42. Error Handling

Wallet errors use the existing MBK centralized error middleware.

Known errors are represented using "AppError".

Examples:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error

Wallet-specific examples include:

Invalid user ID
Invalid recipient user ID
Invalid cursor
Invalid limit
Invalid coin amount
Insufficient wallet balance
Cannot transfer coins to yourself

---

43. Wallet Security Principles

The Wallet module follows several security principles.

Authentication

Only authenticated users can access wallet operations.

Authorization

Operations are performed against the authenticated user's wallet.

Validation

User IDs and coin amounts are validated.

Atomicity

Critical balance operations use MongoDB transactions.

Idempotency

Repeated requests do not accidentally duplicate wallet operations.

Database Constraints

Unique indexes protect transaction identifiers.

Ledger Tracking

Wallet modifications create transaction records.

Balance Protection

Negative balances are not allowed.

---

44. Reward Architecture

Rewards are intentionally separated from Wallet.

Example:

Debate Module
     │
     │ Determines reward
     ▼
Reward Logic
     │
     │ Approved +50 coins
     ▼
Wallet Service
     │
     ▼
Credit +50

The Wallet module does not decide whether a user deserves the reward.

---

45. Debate Reward Example

A debate may have configured reward rules.

For example:

Debate
  │
  ├── 5-minute milestone
  ├── 10-minute milestone
  ├── 15-minute milestone
  ├── 20-minute milestone
  ├── 25-minute milestone
  └── 30-minute completion

The Debate/Reward logic determines eligibility.

If a reward is approved:

Debate Reward
      ↓
Wallet.credit()
      ↓
Transaction Ledger

Joining a debate alone does not automatically mean the user receives the full reward.

---

46. Presentation Reward Example

Presentation rewards are also controlled outside the Wallet module.

Possible configured requirements include:

Viewers
Likes
Comments
Completion
Level requirements

The Presentation/Reward logic evaluates the requirements.

If the reward is approved:

Presentation
     ↓
Reward Evaluation
     ↓
Reward Approved
     ↓
Wallet.credit()

This prevents the Wallet from becoming responsible for unrelated business rules.

---

47. Wallet as Ledger Engine

The Wallet module should remain focused on:

Balance
+
Ledger
+
Atomic Operations
+
Idempotency
+
Transaction History

Other modules should remain responsible for:

Reward Eligibility
Debate Rules
Presentation Rules
Achievements
Business Policies

This separation improves maintainability and scalability.

---

48. Transaction Reference

Wallet transactions may contain:

referenceId

The reference can connect the wallet operation to an external business event.

Examples:

Debate ID
Presentation ID
Achievement ID
Gift ID
Reward ID

This creates a relationship between:

Business Event
      ↓
Wallet Transaction

without duplicating the entire business entity inside the Wallet model.

---

49. Related User

Transfers may also contain:

relatedUserId

This allows the system to identify the other user involved in a user-to-user coin operation.

Example:

Sender Transaction
relatedUserId = Receiver

Receiver Transaction
relatedUserId = Sender

This improves transaction-history context.

---

50. Wallet Data Ownership

The Wallet module owns:

Wallet
WalletTransaction

The User module owns:

User identity

Other modules own their own business data.

The architecture therefore avoids duplicating User or Wallet models inside other modules.

---

51. Database Relationships

Conceptually:

User
 │
 └──────────────► Wallet
                      │
                      │
                      ▼
               WalletTransaction

Business modules can reference wallet transactions through:

referenceId

when required.

---

52. Test Strategy

Wallet testing was performed incrementally.

The main objective was to verify:

Happy Path
+
Validation
+
Security
+
Consistency
+
Idempotency
+
Pagination
+
Error Handling

---

53. Wallet Test Results

Test 1 — Get Balance

Result:

PASS

---

Test 2 — Get Transactions

Result:

PASS

---

Test 3 — Transaction Pagination Limit

Result:

PASS

Verified:

limit=1
hasNextPage=true

---

Test 4 — Cursor Pagination

Result:

PASS

Verified that the next request retrieves the next transaction page.

---

Test 5 — Invalid Cursor

Result:

PASS

Response:

{
  "success": false,
  "message": "Invalid cursor"
}

---

Test 6 — Invalid Limit

Result:

PASS

Response:

{
  "success": false,
  "message": "Invalid limit"
}

---

Test 7 — Debit

Result:

PASS

A valid debit successfully reduced the wallet balance and created a transaction.

---

Test 8 — Insufficient Balance

Result:

PASS

Response:

{
  "success": false,
  "message": "Insufficient wallet balance"
}

---

Test 9 — Debit Idempotency

Result:

PASS

Repeated requests using the same idempotency key did not perform a second debit.

---

Test 10 — User Transfer

Result:

PASS

Verified:

Sender Balance ↓
Receiver Balance ↑

The receiver wallet could be automatically created when necessary.

---

Test 11 — Transfer Idempotency

Result:

PASS

Repeated transfer request using the same idempotency key did not transfer coins twice.

---

Test 12 — Transfer Invalid Amount

Result:

PASS

Response:

{
  "success": false,
  "message": "Coin amount must be a positive integer"
}

---

Test 13 — Transfer to Self

Result:

PASS

Response:

{
  "success": false,
  "message": "Cannot transfer coins to yourself"
}

---

54. Final Wallet Test Summary

Balance                    PASS
Transactions               PASS
Pagination                 PASS
Cursor Pagination          PASS
Invalid Cursor             PASS
Invalid Limit              PASS
Debit                      PASS
Insufficient Balance       PASS
Debit Idempotency          PASS
Transfer                   PASS
Transfer Idempotency       PASS
Invalid Transfer Amount    PASS
Self Transfer Protection   PASS

Total:

13 / 13 PASS

---

55. Build Verification

The Wallet module must be included in the complete TypeScript backend build.

Command:

npm run build

Expected result:

PASS

The build must complete without TypeScript compilation errors.

---

56. Lint Verification

ESLint should be executed after the Wallet implementation.

Command:

npm run lint

Expected result:

PASS

The final Wallet sprint should not introduce new lint errors or warnings.

---

57. Git Verification

After the final code review and successful build/lint verification, the Wallet module should be committed.

Recommended commit:

git add src/modules/wallet
git commit -m "feat: complete wallet and coin system"
git push origin master

The final commit hash should be recorded here after the actual commit.

Final Commit:
[PENDING]

---

58. Production Hardening Recommendations

The current Wallet Foundation is suitable for continued MBK development, but additional production hardening should be considered.

1. Compound Cursor

The current transaction pagination can be improved from a timestamp-only cursor to:

createdAt + _id

This avoids ambiguity when multiple transactions have identical timestamps.

---

2. Transfer Concurrency

Concurrent duplicate transfers should be hardened further using:

Database Unique Constraint
+
Idempotency Check
+
Transaction Retry Handling

Duplicate-key transaction races should be handled safely.

---

3. Atomic Wallet Updates

Production wallet operations should continue using MongoDB transactions where atomic consistency is required.

---

4. Input Schema Validation

Wallet request bodies should eventually use dedicated DTO/schema validation for:

amount
source
referenceId
idempotencyKey
description
toUserId

This keeps controller validation consistent.

---

5. Rate Limiting

Sensitive wallet endpoints should eventually receive appropriate rate limits to reduce abuse.

---

6. Audit Monitoring

Important wallet operations should be observable through centralized logging and monitoring.

---

7. Immutable Ledger Principle

Production design should treat transaction records as append-only ledger records.

Corrections should preferably create compensating transactions rather than modifying historical financial records.

---

59. Future Wallet Features

The following features are intentionally outside Wallet Foundation v1.0:

Withdrawal
Payment Integration
Coin Purchase
Advanced Reward Engine
Wallet Analytics
Fraud Detection
Financial Reporting
Admin Wallet Controls
Advanced Coin Economy

These should be implemented only when their business and security requirements are defined.

---

60. Scalability Considerations

MBK is intended to support large-scale growth.

The Wallet architecture therefore avoids storing the complete transaction history inside the Wallet document.

Instead:

Wallet
  ↓
Current State

WalletTransaction
  ↓
Historical Ledger

This prevents the Wallet document from continuously growing.

Transaction history can independently scale through:

Indexes
Pagination
Archiving
Partitioning/Sharding
Read optimization

when required at larger scale.

---

61. Performance Principles

The Wallet system should follow:

Small Wallet Document
+
Indexed Transactions
+
Cursor Pagination
+
Atomic Updates
+
Idempotency

This reduces unnecessary database work.

Balance requests should not require scanning the entire transaction history.

---

62. Wallet Security Model

The security model can be summarized as:

Authentication
      │
      ▼
Authenticated User
      │
      ▼
Wallet Authorization
      │
      ▼
Input Validation
      │
      ▼
Idempotency Check
      │
      ▼
MongoDB Transaction
      │
      ▼
Wallet Update
      │
      ▼
Ledger Transaction
      │
      ▼
Commit

---

63. Wallet Operation Flow

General operation:

Client
  │
  ▼
JWT Authentication
  │
  ▼
Wallet Controller
  │
  ▼
Validate Request
  │
  ▼
Wallet Service
  │
  ▼
Idempotency Check
  │
  ▼
MongoDB Transaction
  │
  ├──────────────► Wallet Update
  │
  └──────────────► Ledger Record
                       │
                       ▼
                    Commit
                       │
                       ▼
                   Response

---

64. Transfer Flow

Client
  │
  ▼
Authenticated User
  │
  ▼
Transfer Request
  │
  ▼
Validate Receiver
  │
  ▼
Validate Amount
  │
  ▼
Check Self Transfer
  │
  ▼
Check Idempotency
  │
  ▼
MongoDB Transaction
  │
  ├──────────────► Sender DEBIT
  │
  └──────────────► Receiver CREDIT
                       │
                       ▼
                     Commit
                       │
                       ▼
                    Response

---

65. Wallet Design Principles

The Wallet module follows these architectural principles.

Single Responsibility

Wallet handles wallet operations, not reward eligibility.

Atomicity

Related balance changes occur atomically.

Consistency

Wallet balance and ledger transactions remain synchronized.

Idempotency

Repeated requests do not duplicate operations.

Least Privilege

Wallet operations use authenticated user identity.

Validation

Invalid input is rejected before modification.

Auditability

Every successful balance modification creates a transaction record.

Scalability

Current balance and transaction history are separated.

---

66. Important Business Rule

A critical MBK architecture rule is:

Reward Logic ≠ Wallet Logic

For example:

Debate
  ↓
Determine Eligibility
  ↓
Determine Reward
  ↓
Wallet.credit()

and:

Presentation
  ↓
Check Requirements
  ↓
Determine Reward
  ↓
Wallet.credit()

This separation prevents business rules from being duplicated inside the Wallet service.

---

67. Current Wallet Foundation Status

The following components are complete:

Wallet Model               COMPLETE
Transaction Model          COMPLETE
Wallet Service             COMPLETE
Wallet Controller          COMPLETE
Wallet Routes              COMPLETE
Balance                    COMPLETE
Credit                     COMPLETE
Debit                      COMPLETE
Transfer                   COMPLETE
Transaction History        COMPLETE
Cursor Pagination          COMPLETE
Idempotency                COMPLETE
Balance Protection         COMPLETE
Self Transfer Protection   COMPLETE
Validation                 COMPLETE
Testing                    COMPLETE

---

68. Sprint Completion Criteria

Wallet Foundation v1.0 is considered complete when:

Models             ✅
Services           ✅
Controllers        ✅
Routes             ✅
Balance            ✅
Credit             ✅
Debit              ✅
Transfer           ✅
History            ✅
Pagination         ✅
Idempotency        ✅
Validation         ✅
Security            ✅
13 Tests           ✅
Build              ⏳ Final verification
Lint               ⏳ Final verification
Git Commit         ⏳ Final commit
Documentation      ✅

---

69. Final Sprint Status

Wallet Foundation       COMPLETE
Coin Ledger             COMPLETE
Credit                  COMPLETE
Debit                   COMPLETE
Transfer                COMPLETE
Transaction History     COMPLETE
Pagination              COMPLETE
Idempotency             COMPLETE
Security Validation     COMPLETE
Testing                 COMPLETE
Documentation           COMPLETE

Final status:

WALLET FOUNDATION v1.0
READY FOR FINAL BUILD/LINT/GIT VERIFICATION

---

70. Conclusion

The MBK backend now contains a structured Wallet and Coin Foundation capable of managing virtual user balances and transaction history.

The architecture separates:

Wallet State
Transaction Ledger
Wallet Operations
Authentication
Validation
Idempotency
Reward Logic
Business Rules

This separation allows future MBK modules such as:

Debates
Presentations
Achievements
Gifts
Coins
Rewards

to interact with the Wallet without duplicating wallet logic.

The Wallet module therefore serves as the centralized coin ledger engine for MBK.

Future modules should use the Wallet service for approved coin operations rather than directly modifying wallet balances.

---

71. Official Wallet Architecture Summary

                    ┌──────────────────┐
                    │    MBK Client    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Authentication   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Wallet Controller│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Wallet Service  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Validation      Idempotency     Transaction
                                            │
                              ┌─────────────┴─────────────┐
                              ▼                           ▼
                       Wallet Model              Transaction Model
                              │                           │
                              └─────────────┬─────────────┘
                                            ▼
                                         MongoDB

---

72. Final Documentation Record

Project: MBK Backend

Document: Wallet & Coin System

Version: 1.0

Sprint: Wallet Foundation, Coin Ledger & Transaction Security

Status: Completed — Pending Final Build/Lint/Git Verification

Tests: 13/13 PASS

Final Commit: "[PENDING]"

Branch: "master"

Wallet Foundation Status:

CLOSED AFTER FINAL VERIFICATION