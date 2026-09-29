MBK Backend — MBK Messages Module

Project: MBK Backend
Document: Messages Module System
Version: 1.0
Status: Completed — Pending Final Git Commit
Branch: "master"
Sprint: Messages Module Foundation

1. Overview

The MBK Messages Module provides real-time direct messaging between authenticated users.

The module supports:

- Direct conversations
- Text messages
- Message history
- Message delivery status
- Message read status
- Message deletion
- Real-time Socket.IO communication
- Conversation rooms
- Authorization and participant validation

---

2. Architecture

React Native Client
│
├── REST API
│
▼
Express Controller
│
▼
Messages Service
│
▼
Message Repository
│
▼
MongoDB

React Native Client
│
│ Socket.IO
▼
Socket Server
│
▼
Messages Socket Events
│
▼
Messages Service
│
▼
MongoDB

---

3. REST API

Base URL:

/api/v1/messages

All endpoints require authentication.

Authorization: Bearer <ACCESS_TOKEN>

---

3.1 Create Conversation

Request

POST /conversations

Body

{
"otherUserId": "USER_ID"
}

Response

{
"success": true,
"message": "Conversation created successfully.",
"data": {
"_id": "CONVERSATION_ID",
"participants": [
"USER_A_ID",
"USER_B_ID"
],
"participantKey": "USER_A_ID:USER_B_ID",
"type": "direct",
"createdAt": "...",
"updatedAt": "..."
}
}

---

3.2 Get Conversations

Request

GET /conversations

Returns conversations belonging to the authenticated user.

---

3.3 Get Conversation

Request

GET /conversations/:conversationId

The authenticated user must be a participant in the conversation.

---

3.4 Send Text Message

Request

POST /conversations/:conversationId/messages

Body

{
"type": "text",
"text": "Hello from MBK"
}

Currently supported:

TEXT

The message is stored with:

status = sent

---

3.5 Get Messages

Request

GET /conversations/:conversationId/messages

Optional:

?limit=20

Cursor pagination:

?limit=20&cursor=CURSOR

Response

{
"success": true,
"message": "Messages retrieved successfully.",
"data": {
"messages": [],
"hasNextPage": false
}
}

---

3.6 Mark Message as Delivered

Request

PATCH /:messageId/delivered

Changes the message delivery state when appropriate.

---

3.7 Mark Message as Read

Request

PATCH /:messageId/read

Changes the message state to:

read

---

3.8 Delete Message

Request

DELETE /:messageId

Only an authorized user can delete the message according to the service authorization rules.

---

4. Message Status

The current message lifecycle is:

SENT
│
▼
DELIVERED
│
▼
READ

Example:

User A sends message
│
▼
SENT
│
│ User B receives message
▼
DELIVERED
│
│ User B reads message
▼
READ

---

5. Socket.IO

Socket.IO is used for real-time messaging.

Client → Server Events

message:conversation:join
message:conversation:leave
message:send
message:delivered
message:read

Server → Client Events

message:new
message:status
socket:error

---

6. Join Conversation

Event

message:conversation:join

Payload

{
"conversationId": "CONVERSATION_ID"
}

Success

{
"success": true
}

Before joining, the server verifies:

1. Socket authentication
2. Conversation ID
3. User identity
4. Conversation membership

The socket is then added to:

conversation:<conversationId>

---

7. Leave Conversation

Event

message:conversation:leave

Payload

{
"conversationId": "CONVERSATION_ID"
}

Success

{
"success": true
}

After leaving the room, the socket remains connected but no longer receives messages emitted to that conversation room.

Tested successfully:

User B connected
│
▼
Join conversation
│
▼
Leave conversation
│
▼
User B remains connected
│
▼
User A sends message
│
▼
User B does NOT receive message

---

8. Send Message

Event

message:send

Payload

{
"conversationId": "CONVERSATION_ID",
"type": "text",
"text": "Hello from MBK Socket.IO"
}

The server:

1. Authenticates the socket
2. Validates the conversation
3. Validates message type
4. Validates message text
5. Saves the message
6. Creates a safe socket representation
7. Emits "message:new"
8. Returns the message ID through acknowledgement

---

9. New Message Event

Event

message:new

Payload

{
"message": {
"id": "MESSAGE_ID",
"conversationId": "CONVERSATION_ID",
"senderId": "USER_ID",
"type": "text",
"text": "Hello from MBK Socket.IO",
"status": "sent",
"createdAt": "...",
"updatedAt": "..."
}
}

The sender's socket is excluded from the broadcast using:

socket.to(room).emit(...)

---

10. Delivered Event

Client → Server

message:delivered

Payload:

{
"messageId": "MESSAGE_ID"
}

The server updates the message and notifies the conversation room using:

message:status

Example:

{
"messageId": "MESSAGE_ID",
"status": "delivered"
}

---

11. Read Event

Client → Server

message:read

Payload:

{
"messageId": "MESSAGE_ID"
}

The resulting status is:

{
"messageId": "MESSAGE_ID",
"status": "read"
}

---

12. Conversation Room

Each conversation has its own Socket.IO room:

conversation:<conversationId>

Example:

conversation:6ab79061010c78149bcbf494

This prevents messages from one conversation being delivered to unrelated users.

---

13. Security

The Messages Module validates:

- Socket authentication
- REST authentication
- MongoDB ObjectId format
- Conversation membership
- Message ownership/authorization
- Message type
- Message text
- Conversation access

Unauthorized users cannot join conversations they do not belong to.

---

14. Testing

REST Tests

Create Conversation ✅
Get Conversations ✅
Get Conversation ✅
Send Message ✅
Get Messages ✅
Mark Delivered ✅
Mark Read ✅
Delete Message ✅

Socket.IO Tests

Socket Authentication ✅
Join Room ✅
Leave Room ✅
Send Message ✅
Receive New Message ✅
Delivered Status ✅
Read Status ✅
Room Isolation ✅

---

15. Current Scope

The current Messages Module supports:

Direct Conversation
│
├── Text Message
├── Message History
├── Sent
├── Delivered
├── Read
├── Delete
└── Real-time Socket.IO

Future messaging features such as typing indicators, online presence, media messages, reactions, replies, and advanced notification behavior will be implemented separately.
