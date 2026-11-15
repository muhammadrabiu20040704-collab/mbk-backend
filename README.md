# MBK — Student Social, Presentation & Debate Platform

> **Helping students build confidence, communicate effectively, and connect through technology.**

MBK is a student-focused social and communication platform designed to help students express their ideas, improve their communication skills, participate in academic discussions, and develop confidence through presentations and debates.

The platform aims to combine social networking, real-time messaging, student communities, presentations, online debates, and intelligent recommendations in one ecosystem.

**Project status:** Active development  
**Primary audience:** Students, educators, and academic communities  
**Frontend:** React Native + TypeScript  
**Backend:** Node.js + Express + TypeScript  
**Database:** MongoDB

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Vision and Mission](#3-vision-and-mission)
4. [Project Objectives](#4-project-objectives)
5. [Core Features](#5-core-features)
6. [Technology Stack](#6-technology-stack)
7. [System Architecture](#7-system-architecture)
8. [Project Structure](#8-project-structure)
9. [Backend Architecture](#9-backend-architecture)
10. [Authentication and Authorization](#10-authentication-and-authorization)
11. [Messaging System](#11-messaging-system)
12. [Presentation and Debate System](#12-presentation-and-debate-system)
13. [Smart Recommendation System](#13-smart-recommendation-system)
14. [Database Design](#14-database-design)
15. [Security Principles](#15-security-principles)
16. [Installation and Setup](#16-installation-and-setup)
17. [Environment Variables](#17-environment-variables)
18. [Running the Backend](#18-running-the-backend)
19. [API Overview](#19-api-overview)
20. [Real-Time Communication](#20-real-time-communication)
21. [Testing and Code Quality](#21-testing-and-code-quality)
22. [Deployment and Scalability](#22-deployment-and-scalability)
23. [Development Roadmap](#23-development-roadmap)
24. [Development Principles](#24-development-principles)
25. [Contributing](#25-contributing)
26. [License](#26-license)

---

## 1. Project Overview

MBK is a technology project focused on student interaction, communication, and personal development.

It is intended to provide an environment where students can share ideas, publish content, participate in academic debates, communicate privately, and improve their presentation skills.

Unlike a platform focused exclusively on entertainment, MBK places particular emphasis on communication, academic participation, creativity, and student engagement.

The project is being developed with a modular architecture so that new features can be added without unnecessarily coupling unrelated parts of the system.

## 2. Problem Statement

Many students experience challenges such as:

- Fear of speaking in public.
- Difficulty expressing ideas confidently in English.
- Limited opportunities to participate in structured debates.
- Lack of accessible platforms for academic discussion.
- Difficulty connecting with students from other departments and institutions.
- Limited opportunities to practise presentations and receive feedback.

MBK aims to address these challenges by providing digital tools for communication, collaboration, discussion, and learning.

## 3. Vision and Mission

### Vision

To build a student-centered digital platform that empowers students to communicate confidently, exchange knowledge, and connect with academic communities.

### Mission

To make student interaction, presentation practice, academic debate, and idea sharing more accessible through technology.

### Core Values

- **Learning:** Encourage continuous improvement.
- **Communication:** Help students express ideas clearly.
- **Community:** Connect students across departments and institutions.
- **Creativity:** Give students opportunities to share original content.
- **Respect:** Encourage constructive and responsible interaction.
- **Innovation:** Apply technology to meaningful student problems.

## 4. Project Objectives

MBK aims to:

1. Provide a social platform for students.
2. Support private messaging and real-time communication.
3. Encourage presentation practice and public-speaking confidence.
4. Enable structured online debates between students and departments.
5. Recommend relevant content based on student interests.
6. Provide moderation and administrative approval workflows.
7. Support image and video sharing.
8. Establish a secure, maintainable, and scalable technical foundation.
9. Introduce intelligent features to assist students during debates and learning activities.

---

## 5. Core Features

The following describes the intended product scope. Individual features are being implemented progressively.

### 5.1 Student Accounts and Profiles

Students will be able to register, authenticate, and manage their profiles.

Planned profile information includes:

- Full name.
- Username.
- Email address.
- Phone number.
- School or institution.
- Department.
- Academic level.
- Profile picture.
- Cover photo.
- Biography.
- Interests.
- Followers and following.
- Account visibility preferences.

### 5.2 Home Feed

The home feed will provide a central place for student activity.

Planned capabilities include:

- Displaying relevant posts.
- Highlighting active debates.
- Publishing text and media content.
- Liking and commenting on posts.
- Sharing posts.
- Reporting inappropriate content.
- Recommending relevant content.

### 5.3 Posts and Short Videos

Students will be able to share ideas and experiences through text, images, and videos.

Planned capabilities include:

- Text posts with a maximum of 1,000 characters.
- Image and video uploads.
- Short-form videos of up to three minutes.
- Likes, comments, and sharing.
- Content reporting and moderation.

### 5.4 Private Messaging

The messaging system is being developed to support direct communication between students.

The planned capabilities include:

- One-to-one conversations.
- Text messages.
- Image and video messages.
- Sent, delivered, and read statuses.
- Message history and pagination.
- Message ownership checks.
- Real-time delivery through Socket.IO.

### 5.5 Student Network

The network module will support connections between students.

Planned capabilities include:

- Following other students.
- Discovering relevant student profiles.
- Viewing connections.
- Finding students by academic interests and departments.

### 5.6 Presentations

The presentation module will help students practise communicating their ideas.

Planned capabilities include:

- Creating presentation activities.
- Sharing presentation-related media.
- Participating in presentation sessions.
- Receiving feedback and improving communication skills.

### 5.7 Online Debates

MBK will support structured debates between students, teams, and departments.

For example:

**Computer Science vs Biochemistry**

Planned capabilities include:

- Creating debate proposals.
- Challenging another student or department.
- Accepting or declining challenges.
- Submitting debate details for administrative approval.
- Hosting live debate sessions.
- Managing turns between participants.
- Allowing viewers to follow debates.
- Supporting audience interaction and debate engagement.
- Providing reminders and live-session notifications.

Administrative approval will be used where required by the debate workflow.

### 5.8 Notifications

Planned notification categories include:

- Likes.
- Comments.
- Follows.
- Mentions.
- Coins.
- Debate reminders.
- Live debate notifications.

### 5.9 MBK Smart AI Debate Assistant

The proposed AI assistant will help students prepare for and participate in debates.

Potential capabilities include:

- Helping students organize arguments.
- Suggesting relevant discussion points.
- Helping students practise responses.
- Explaining unfamiliar concepts.
- Providing structured feedback on arguments.

AI capabilities will be introduced as the product and its requirements mature.

### 5.10 Administration and Moderation

The administration system is intended to support:

- Student and account management.
- Debate approval workflows.
- Content reports.
- Moderation actions.
- Role and permission management.
- Administrative audit records.
- Configuration of selected platform features.

---

## 6. Technology Stack

MBK uses TypeScript across its planned frontend and backend to improve consistency and maintainability.

| Technology      | Purpose                                    |
| --------------- | ------------------------------------------ |
| React Native    | Cross-platform mobile application          |
| TypeScript      | Static typing and maintainable code        |
| Node.js         | Backend JavaScript runtime                 |
| Express         | HTTP API framework                         |
| MongoDB         | Primary document database                  |
| Mongoose        | MongoDB schemas, models, and queries       |
| Socket.IO       | Planned real-time messaging and events     |
| Redis           | Planned caching and shared real-time state |
| Cloudinary      | Image and video storage                    |
| Multer          | Multipart file upload handling             |
| JSON Web Tokens | Authentication tokens                      |
| bcrypt          | Password hashing                           |
| Helmet          | HTTP security headers                      |
| CORS            | Cross-origin access configuration          |
| Morgan          | HTTP request logging                       |
| RabbitMQ        | Planned asynchronous messaging             |
| Nginx           | Planned reverse proxy and load balancing   |
| Docker          | Planned containerization                   |
| ESLint          | Code quality and linting                   |
| Prettier        | Code formatting                            |

**Important:** A technology being listed here does not mean every integration is already operational. Implementation status is tracked separately in the development roadmap.

---

## 7. System Architecture

### 7.1 High-Level Architecture

```text
                  STUDENT / ADMIN
                         |
                         v
              React Native Application
                         |
                         v
                    HTTP / API
                         |
                         v
                Node.js + Express
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
       Authentication  Modules    Middleware
             |           |           |
             +-----------+-----------+
                         |
                         v
                  Service Layer
                         |
                         v
                 Repository Layer
                         |
                         v
                  Mongoose Models
                         |
                         v
                     MongoDB

External and planned infrastructure:

Cloudinary  -> Media storage
Socket.IO   -> Real-time communication
Redis       -> Shared state and caching
RabbitMQ    -> Asynchronous processing
Nginx       -> Reverse proxy / load balancing
Docker      -> Containerized deployment
```

This diagram represents the intended system architecture rather than a claim that every component has been fully integrated.

### 7.2 Architectural Goals

The architecture aims to provide:

- Clear separation of responsibilities.
- Reusable services and infrastructure.
- Consistent API behavior.
- Secure access to protected resources.
- Independent feature development.
- Easier testing and maintenance.
- A foundation for horizontal scaling.

---

## 8. Project Structure

The repository is being organized around a mobile frontend and a modular backend.

### 8.1 Intended Repository Layout

```text
MBK/
├── mbk-frontend/
│   └── React Native application
│
├── mbk-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── posts/
│   │   │   ├── messages/
│   │   │   ├── network/
│   │   │   ├── notifications/
│   │   │   ├── presentations/
│   │   │   └── debates/
│   │   ├── shared/
│   │   │   ├── jwt/
│   │   │   └── media/
│   │   ├── sockets/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── README.md
```

This is a representative target structure. The actual directories and completed modules may differ as development progresses.

---

## 9. Backend Architecture

The backend uses a modular, layered design.

### 9.1 Controller Layer

Controllers handle HTTP requests and responses.

Responsibilities include:

- Reading route parameters and request data.
- Validating basic request input.
- Calling the appropriate service.
- Returning consistent JSON responses.
- Setting HTTP status codes.

Controllers should not contain substantial business logic or direct database operations.

### 9.2 Service Layer

Services implement application rules and workflows.

Responsibilities include:

- Enforcing business rules.
- Checking permissions and ownership.
- Coordinating repositories and other services.
- Managing message and conversation operations.
- Converting business failures into application errors.

### 9.3 Repository Layer

Repositories encapsulate database access.

Responsibilities include:

- Creating documents.
- Finding records.
- Updating records.
- Deleting records where permitted.
- Implementing query and pagination strategies.

### 9.4 Model Layer

Mongoose models define document structure and database-level constraints.

Responsibilities include:

- Schema definitions.
- Field validation.
- Defaults.
- References.
- Indexes.
- Timestamps.

### 9.5 Shared Infrastructure

Reusable infrastructure is placed in shared modules where appropriate.

Examples include:

- JWT utilities.
- Media types and services.
- Cloudinary configuration.
- Common error handling.
- Authentication middleware.

This separation helps prevent different modules from duplicating the same infrastructure.

---

## 10. Authentication and Authorization

MBK's authentication foundation includes access and refresh token workflows, session management, password hashing, and authorization-related components.

### Planned and implemented security capabilities

- Password hashing with bcrypt.
- JWT access-token verification.
- Refresh-token rotation.
- Session management.
- Logout from the current session.
- Logout from all sessions.
- A configured session limit.
- Role-based access control.
- Permission checks.
- Password change workflows.
- Password reset using one-time codes.
- Audit-related records.

The implemented authentication foundation includes a maximum of four sessions as currently configured.

### Authorization principles

Protected routes must require authentication.

Sensitive operations must also check authorization, including:

- Whether a user belongs to a conversation.
- Whether a user owns a message they want to delete.
- Whether a user has permission to approve a debate.
- Whether an administrative action is allowed.

Authentication confirms identity; authorization determines what that identity may do.

---

## 11. Messaging System

The Messages module is being developed as an independent backend feature.

### 11.1 V1 Scope

- Direct one-to-one conversations.
- Text messages.
- Image and video message support.
- Message status lifecycle.
- Conversation metadata.
- Message retrieval and pagination.
- Participant authorization.
- Message deletion by the sender.
- Media integration through shared infrastructure.
- Real-time communication through a planned Socket.IO integration.

### 11.2 Message Status Lifecycle

```text
SENT
  |
  v
DELIVERED
  |
  v
READ
```

The service layer is responsible for enforcing valid status transitions.

### 11.3 Current Module Layout

```text
src/modules/messages/
├── messages.enums.ts
├── messages.types.ts
├── conversation.types.ts
├── conversation.model.ts
├── conversation.repository.ts
├── message.types.ts
├── message.model.ts
├── message.repository.ts
├── messages.service.ts
├── messages.controller.ts
└── messages.routes.ts
```

Additional files for Socket.IO and automated tests will be introduced as implementation proceeds.

### 11.4 Data and Performance Considerations

The current design includes indexes for conversation participants and message retrieval by conversation and creation time.

Future hardening includes:

- Stable compound cursors using creation time and message ID.
- Atomic message status transitions.
- Consistency handling between message creation and conversation metadata updates.
- Media cleanup after deletion.
- Pagination for conversation lists.
- Real-time event authorization and delivery guarantees.

---

## 12. Presentation and Debate System

The debate and presentation modules are intended to be independent feature modules.

### Debate workflow

```text
Create Debate Proposal
          |
          v
Submit Challenge
          |
          v
Accept / Decline
          |
          v
Submit Debate Details
          |
          v
Administrative Review
          |
          v
Approved Debate Session
          |
          v
Live Participation
```

The exact workflow will depend on the final product rules.

The backend will enforce permissions, validate proposals, and control approval and session state transitions.

### Presentation workflow

The presentation module is intended to support presentation activities, relevant media, and student participation.

These modules will reuse shared infrastructure where appropriate instead of duplicating authentication, media handling, or notification logic.

---

## 13. Smart Recommendation System

MBK plans to recommend content and connections based on student interests and platform activity.

### Potential input signals

- Selected interests during registration.
- Followed accounts.
- Departments and academic interests.
- Posts and topics a student engages with.
- Debate participation.
- Relevant presentation activities.

### Intended objectives

- Make relevant content easier to discover.
- Connect students with related interests.
- Encourage academic participation.
- Help students find relevant debates and presentations.

The recommendation system will be developed incrementally. Its ranking algorithm, data requirements, and evaluation criteria will be documented as the implementation becomes more concrete.

---

## 14. Database Design

MongoDB is the primary database, with Mongoose providing schema definitions and data access.

### Planned core entities

| Entity       | Purpose                             |
| ------------ | ----------------------------------- |
| User         | Student and administrator accounts  |
| Session      | Authentication sessions             |
| Conversation | Messaging participants and metadata |
| Message      | Message content, sender, and status |
| Post         | Student-created content             |
| Comment      | Responses to posts                  |
| Follow       | Relationships between students      |
| Notification | User notifications                  |
| Debate       | Debate proposals and sessions       |
| Presentation | Presentation activities             |
| Report       | Moderation reports                  |
| Audit Record | Relevant administrative activity    |

Not all entities have been implemented.

### Database design principles

- Use references where they support clear domain relationships.
- Create indexes based on actual query patterns.
- Validate important fields.
- Keep frequently accessed data queries efficient.
- Use pagination for growing collections.
- Apply transactions where multi-document consistency requires them.
- Avoid treating cached data as the authoritative source when MongoDB owns the underlying record.

---

## 15. Security Principles

Security is a core requirement for MBK.

### Authentication

- Verify access tokens before protected operations.
- Apply refresh-token rotation and session controls.
- Never store plaintext passwords.
- Keep secrets outside source code.

### Authorization

- Check resource ownership.
- Verify conversation participation before exposing messages.
- Enforce administrative permissions on restricted operations.
- Avoid relying on frontend checks for security.

### Input Validation

- Validate IDs, query parameters, and request bodies.
- Enforce message-length limits.
- Reject invalid message types.
- Validate uploaded media using file signatures and other appropriate checks.

### Media Security

- Do not trust file extensions or client-supplied MIME types alone.
- Enforce file-size limits.
- Validate supported image and video formats.
- Store uploaded media using the configured media provider.
- Avoid exposing private server credentials.

### API Security

- Configure CORS intentionally.
- Use Helmet for HTTP security headers.
- Add appropriate request-rate limits.
- Avoid logging passwords, tokens, or sensitive personal information.
- Return safe error responses.

Security requirements will continue to evolve as the platform grows.

---

## 16. Installation and Setup

### Prerequisites

Install the following tools before setting up the backend:

- Node.js.
- npm.
- Git.
- MongoDB, either locally or through an accessible deployment.
- A Cloudinary account for media integration when required.

Redis and RabbitMQ are additional infrastructure dependencies for their respective integrations; they are not prerequisites for every early development task.

### 16.1 Clone the Repository

Use the actual repository URL once it has been published:

```bash
git clone <YOUR_REPOSITORY_URL>
cd MBK/mbk-backend
```

If the repository has not been published, navigate directly to your local backend directory.

### 16.2 Install Dependencies

```bash
npm install
```

### 16.3 Configure Environment Variables

Create a local `.env` file based on `.env.example`.

Populate it with your own development configuration. Never commit real secrets.

### 16.4 Start MongoDB

Make sure MongoDB is available and that your configured database URI points to it.

### 16.5 Start the Development Server

```bash
npm run dev
```

The development server is configured to use port `5000` unless the application configuration overrides it.

---

## 17. Environment Variables

The backend uses environment variables for configuration and secrets.

An example template may contain:

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

These are representative variable names. Check the actual configuration files in the repository for the complete and authoritative list.

**Important:**

- Use strong, unique secrets.
- Never commit `.env`.
- Never place backend secrets inside the React Native application.
- Do not use production credentials for local development.
- Keep `.env.example` free of real credentials.
- Validate required environment variables during application startup.

---

## 18. Running the Backend

The backend uses the following npm scripts.

### Development

```bash
npm run dev
```

Runs the TypeScript server in watch mode.

### Build

```bash
npm run build
```

Compiles the TypeScript application into the configured output directory.

### Production Start

```bash
npm start
```

Starts the compiled server from `dist/server.js`.

The production start command should only be used after a successful build and appropriate environment configuration.

### Suggested development checks

```bash
npm run build
```

Run the project's configured lint and test scripts when available.

---

## 19. API Overview

The backend exposes REST endpoints for its implemented modules.

The following is an overview of the current messaging route design, not a complete API specification.

### Conversations

| Method | Endpoint                         | Purpose                                         |
| ------ | -------------------------------- | ----------------------------------------------- |
| POST   | `/conversations`                 | Create or retrieve a direct conversation        |
| GET    | `/conversations`                 | Retrieve the authenticated user's conversations |
| GET    | `/conversations/:conversationId` | Retrieve an authorized conversation             |

### Messages

| Method | Endpoint                                  | Purpose                                   |
| ------ | ----------------------------------------- | ----------------------------------------- |
| POST   | `/conversations/:conversationId/messages` | Send a text message                       |
| GET    | `/conversations/:conversationId/messages` | Retrieve paginated messages               |
| PATCH  | `/:messageId/delivered`                   | Mark a message as delivered               |
| PATCH  | `/:messageId/read`                        | Mark a message as read                    |
| DELETE | `/:messageId`                             | Delete the authenticated sender's message |

These paths are relative to the parent prefix at which the Messages router is mounted.

For example, if the application mounts the router at `/api/messages`, the resulting paths will begin with `/api/messages`.

The currently described HTTP send route supports text messages. Image and video support must be confirmed in the actual controller and route integration before being treated as fully available.

A complete API reference will document request bodies, responses, authentication requirements, validation errors, and status codes as the modules stabilize.

---

## 20. Real-Time Communication

Socket.IO is intended to support real-time communication for messaging and other interactive features.

Planned capabilities include:

- Authenticated socket connections.
- Conversation-based rooms.
- Real-time message delivery.
- Delivered and read events.
- Participant authorization.
- Connection and reconnection handling.
- Shared state across multiple backend instances where required.

Real-time communication will complement the REST API rather than replace it entirely.

MongoDB will remain the authoritative store for persisted messages. Redis may later support shared coordination and scaling across multiple Socket.IO servers.

The Socket.IO implementation and its security rules will be documented when they are integrated and tested.

---

## 21. Testing and Code Quality

MBK aims to maintain reliable, readable, and testable code.

### Testing priorities

- Authentication and authorization.
- Invalid input handling.
- Conversation participant checks.
- Message status transitions.
- Message pagination.
- Message ownership and deletion.
- Media validation.
- Database error handling.
- Real-time event authorization and delivery.

### Code quality principles

- Use TypeScript consistently.
- Keep business logic in services.
- Keep database operations in repositories.
- Use shared utilities for reusable infrastructure.
- Apply linting and formatting.
- Review changes before committing.
- Keep documentation aligned with the implementation.

Testing tools and npm scripts should be documented once they are configured in the repository.

---

## 22. Deployment and Scalability

MBK is being designed with future growth in mind, but scalability must be demonstrated through implementation, measurement, and testing rather than assumed from the technology stack.

### Planned infrastructure

- **Docker:** Consistent application environments.
- **Nginx:** Reverse proxy and load balancing.
- **Redis:** Shared state, caching, and selected coordination tasks.
- **RabbitMQ:** Asynchronous background processing.
- **Socket.IO scaling:** Real-time communication across multiple server instances.
- **Monitoring:** Health checks, logs, metrics, and error tracking.
- **CI/CD:** Automated build, test, and deployment workflows.

### Scalability principles

1. Measure performance before optimizing.
2. Add database indexes based on query patterns.
3. Use pagination for large collections.
4. Avoid blocking requests with unnecessary background work.
5. Use queues for suitable asynchronous tasks.
6. Protect APIs against abuse.
7. Design retry behavior for transient failures.
8. Use idempotent processing where duplicate events are possible.
9. Monitor database connections and resource usage.
10. Test horizontal scaling before claiming production capacity.

The long-term ambition is to support a large student community. Any specific capacity target will require load testing and infrastructure planning.

---

## 23. Development Roadmap

Development is organized into incremental phases. Statuses below distinguish the existing foundation from planned integrations.

| Phase | Focus                                                     | Status                               |
| ----- | --------------------------------------------------------- | ------------------------------------ |
| 1     | Product planning and feature definition                   | Completed                            |
| 2     | System design and architecture                            | Completed                            |
| 3     | Authentication and security foundation                    | Implemented foundation               |
| 4     | Messages domain, models, repositories, and REST workflows | In progress                          |
| 5     | Messaging media integration                               | Integration and verification pending |
| 6     | Socket.IO real-time messaging                             | Planned                              |
| 7     | Redis integration and shared real-time state              | Planned                              |
| 8     | Messaging security hardening and tests                    | Planned / ongoing                    |
| 9     | Student network                                           | Planned                              |
| 10    | Posts and social feed                                     | Planned                              |
| 11    | Presentation module                                       | Planned                              |
| 12    | Debate module and approval workflows                      | Planned                              |
| 13    | Notifications                                             | Planned                              |
| 14    | Recommendation system and AI assistant                    | Planned                              |
| 15    | Admin tools and moderation                                | Planned                              |
| 16    | Deployment, monitoring, and performance testing           | Planned                              |

The roadmap may change as implementation, testing, and product requirements reveal new priorities.

---

## 24. Development Principles

The project follows these principles:

### Modular Design

Features should have clear responsibilities and limited unnecessary coupling.

### Separation of Concerns

Controllers, services, repositories, models, and shared infrastructure should have distinct roles.

### Security by Design

Authentication, authorization, validation, and safe error handling should be considered from the beginning.

### Contextual Learning

During development, relevant data structures, algorithms, and UML concepts should be explained when they are used in the actual code.

### Performance Awareness

Query complexity, database indexes, pagination, memory usage, and concurrency should be considered when relevant.

### Incremental Delivery

Build a working foundation, test it, document it, and then extend it.

### Honest Documentation

A feature should only be marked complete after its implementation and required tests have been verified.

---

## 25. Contributing

Contributions and technical feedback are welcome.

Before contributing:

1. Review the project structure and architecture.
2. Identify the module relevant to your change.
3. Keep business logic in the service layer.
4. Use repositories for database access.
5. Validate inputs and enforce authorization.
6. Add tests for important behavior.
7. Run the configured build and quality checks.
8. Document relevant API or architectural changes.

For significant architectural changes, document the reasoning and potential effects on security, maintainability, and scalability.

---

## 26. License

The project's license has not yet been specified.

Before distributing or accepting external contributions, choose an appropriate license and add a corresponding `LICENSE` file to the repository.

---

## Project Status Summary

MBK is an actively developed student social, presentation, and debate platform.

The current engineering focus is establishing a secure backend foundation and building the messaging module with clear separation between business logic and database access.

The next stages will progressively introduce real-time communication, student networking, social content, debates, presentations, notifications, and intelligent recommendations.

**The long-term goal is to create a reliable and useful platform that helps students connect, communicate, and grow.**
