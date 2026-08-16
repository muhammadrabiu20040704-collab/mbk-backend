MBK Backend — Authentication & Security Documentation

Project: MBK Backend
Document: Authentication & Security
Version: 1.0
Status: Completed
Branch: "master"
Final Commit: "13f6848"
Sprint: Authentication, RBAC & Security Hardening

---

1. Overview

This document describes the authentication, authorization, password recovery, session management, audit logging, and security-hardening mechanisms implemented in the MBK backend.

The purpose of this security layer is to ensure that:

- Users can securely register and authenticate.
- Access tokens are properly validated.
- Refresh tokens are protected and associated with sessions.
- Users can manage their active sessions.
- Password changes and password resets are protected.
- Password reset uses a short-lived six-digit OTP.
- Role-based permissions control protected operations.
- Sensitive role-management actions are recorded in audit logs.
- Common HTTP security protections are enabled.
- Authentication endpoints are protected against excessive requests.
- Invalid or unauthorized requests receive appropriate HTTP responses.

---

2. Authentication Architecture

MBK uses token-based authentication.

The authentication flow is:

Client
   │
   ▼
Login
   │
   ▼
Validate Credentials
   │
   ▼
Generate Access Token
   │
   ├──────────────► Client
   │
   ▼
Generate Refresh Token
   │
   ▼
Create Session
   │
   ▼
Store Hashed Refresh Token

The client uses the access token when requesting protected resources.

Authorization: Bearer <accessToken>

---

3. User Registration

Registration validates the following information:

- Full name
- Username
- Country
- Phone number
- Password

Validation is performed using Zod.

Username Rules

Username must:

- Be at least 3 characters.
- Not exceed 30 characters.
- Start with a letter.
- Contain only lowercase letters, numbers, and underscores.

Example:

muhammad_rabiu
sanusi_11
mbk_user123

Invalid examples:

123muhammad
-user
Muhammad Rabiu

The username is normalized to lowercase.

---

4. Phone Number Security

Phone numbers are normalized using "libphonenumber-js".

The country supplied during registration is used to normalize the phone number.

Example:

Input:
09135901611

Normalized:
+2349135901611

The normalized phone number is stored in the database.

Phone numbers are unique.

---

5. Password Security

Passwords are never stored as plain text.

MBK uses "bcrypt" for password hashing.

The configured number of salt rounds is controlled through:

BCRYPT_SALT_ROUNDS=10

The User model hashes the password before saving:

Plain Password
      │
      ▼
   bcrypt
      │
      ▼
Hashed Password
      │
      ▼
   MongoDB

Password comparison is performed using bcrypt.

The original password cannot be recovered from the stored hash.

---

6. Login

A user can authenticate using:

- Username
- Phone number

The login process is:

Identifier + Password
        │
        ▼
Normalize Identifier
        │
        ▼
Find User
        │
        ▼
Compare Password
        │
        ▼
Generate Tokens
        │
        ▼
Create Session

Invalid credentials return:

401 Unauthorized

with a generic message:

{
  "success": false,
  "message": "Invalid credentials"
}

The system does not reveal whether the username or password was incorrect.

---

7. JWT Access Token

MBK uses JSON Web Tokens for authenticated requests.

The access token contains:

{
  "sub": "userId",
  "username": "username"
}

The "sub" field identifies the authenticated user.

The access-token expiration is configured through:

JWT_EXPIRES_IN=7d

The value can be changed through the environment configuration.

---

8. JWT Verification

Every protected request passes through the authentication middleware.

The middleware expects:

Authorization: Bearer <token>

The middleware validates:

1. Authorization header exists.
2. Authentication scheme is "Bearer".
3. Token exists.
4. JWT signature is valid.
5. Token has not expired.

Invalid authentication returns:

401 Unauthorized

Example:

{
  "success": false,
  "message": "Unauthorized"
}

---

9. Refresh Token

Refresh tokens are used to obtain new access tokens.

The refresh-token lifetime is:

30 days

Refresh tokens are not stored directly in the database.

Instead, MBK hashes the refresh token using SHA-256:

Refresh Token
     │
     ▼
   SHA-256
     │
     ▼
Token Hash
     │
     ▼
Session Database

This reduces the risk of exposing usable refresh tokens if the database is compromised.

---

10. Refresh Token Rotation

When a refresh token is successfully used:

1. The existing refresh token is validated.
2. Its hash is searched in the session collection.
3. The session is checked.
4. A new access token is generated.
5. A new refresh token is generated.
6. The session's stored token hash is replaced.

This provides refresh-token rotation.

---

11. Session Management

Each successful login creates a session.

A session stores information such as:

- User ID
- Device ID
- Device name
- IP address
- User agent
- Hashed refresh token
- Expiration date
- Revocation date

This allows MBK to support multiple authenticated devices.

Example:

User
 ├── Phone
 ├── Laptop
 └── Tablet

Each device can have its own session.

---

12. Logout

Logout revokes the current session.

The session receives:

revokedAt = current date/time

A revoked session cannot be used again.

---

13. Logout From All Devices

The "logoutAll" functionality revokes all active sessions belonging to the authenticated user.

Example:

User
 ├── Phone      → Revoked
 ├── Laptop     → Revoked
 ├── Tablet     → Revoked
 └── Browser    → Revoked

This is particularly useful after a suspected account compromise.

---

14. Session Revocation

Users can revoke individual sessions.

The backend verifies:

sessionId
+
authenticated userId

This prevents a user from revoking another user's session.

If the session does not belong to the authenticated user, it cannot be revoked.

---

15. Change Password

Authenticated users can change their password.

The system requires:

Current Password
New Password

The backend:

1. Finds the authenticated user.
2. Checks whether the account is active.
3. Verifies the current password.
4. Ensures the new password is different.
5. Hashes the new password through the User model.
6. Saves the new password.
7. Revokes existing active sessions.

This last step is important because changing the password invalidates previously authenticated sessions.

---

16. Forgot Password

MBK provides a secure password-recovery process.

The user provides:

Username
OR
Email
OR
Phone Number

The system intentionally returns a generic response.

Example:

{
  "success": true,
  "message": "If the account exists, a password reset OTP has been sent."
}

This prevents account enumeration.

An attacker cannot easily determine whether a particular email, username, or phone number belongs to a registered user.

---

17. Password Reset OTP

MBK uses a six-digit OTP for password recovery.

Example:

154255

The OTP is generated securely using Node.js cryptographic randomness.

The OTP is never stored as plain text.

Instead:

OTP
 │
 ▼
SHA-256
 │
 ▼
OTP Hash
 │
 ▼
MongoDB

---

18. OTP Expiration

Password reset OTPs expire after:

3 minutes

The expiration time is stored in:

expiresAt

The backend checks:

expiresAt > current time

Expired OTPs cannot be used.

---

19. OTP Channels

The password-reset system supports channels such as:

Email
SMS

The OTP record stores the selected channel.

Example:

{
  "channel": "email"
}

The actual OTP delivery service is separated from the authentication logic.

This allows the system to support production email/SMS providers later without changing the core password-reset flow.

---

20. OTP Verification

The OTP verification process is:

User Identifier
      │
      ▼
OTP
      │
      ▼
Hash OTP
      │
      ▼
Find OTP Record
      │
      ├── Invalid → Reject
      ├── Expired → Reject
      ├── Used → Reject
      │
      ▼
Mark OTP Verified
      │
      ▼
Allow Password Reset

A successful verification returns:

{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "verified": true
  }
}

---

21. OTP Reuse Protection

Once an OTP has been used or verified according to the reset flow, it cannot be reused.

The OTP record maintains fields such as:

usedAt
verifiedAt

This prevents replay attacks against password-reset OTPs.

---

22. Reset Password

After successful OTP verification, the user can submit a new password.

The backend:

1. Validates the reset authorization.
2. Finds the user.
3. Checks that the account is active.
4. Ensures the new password differs from the current password.
5. Saves the new password.
6. Marks the OTP/reset record as used.
7. Invalidates authentication sessions where required.

Successful response:

{
  "success": true,
  "message": "Password reset successfully"
}

---

23. Role-Based Access Control

MBK implements RBAC.

The major concept is:

User
  │
  ▼
Role
  │
  ▼
Permissions
  │
  ▼
Protected Resource

Instead of allowing every authenticated user to perform every operation, permissions are assigned according to the user's role.

---

24. Authorization Middleware

The authorization middleware receives a required permission.

Example concept:

authorize(Permission.CHANGE_USER_ROLE)

The middleware:

1. Checks authentication.
2. Finds the user.
3. Checks whether the account exists.
4. Checks whether the account is active.
5. Retrieves the user's role.
6. Retrieves permissions for that role.
7. Checks whether the requested permission exists.

If the permission is missing:

403 Forbidden

Example:

{
  "success": false,
  "message": "Forbidden"
}

---

25. Unauthorized vs Forbidden

MBK distinguishes between authentication and authorization failures.

401 — Unauthorized

The user is not properly authenticated.

Example:

{
  "success": false,
  "message": "Unauthorized"
}

403 — Forbidden

The user is authenticated but does not have permission.

Example:

{
  "success": false,
  "message": "Forbidden"
}

This distinction makes the API behavior predictable.

---

26. Role Management Security

Role-management operations are protected by RBAC permissions.

An important security rule prevents a user from changing their own role.

Example response:

{
  "success": false,
  "message": "You cannot change your own role"
}

This prevents privilege escalation through self-role modification.

---

27. Audit Logging

Sensitive administrative actions are recorded in the audit system.

For example:

action:
change_user_role

An audit record contains information such as:

actorUserId
targetUserId
action
oldValue
newValue
ipAddress
userAgent
createdAt

Example:

{
  "action": "change_user_role",
  "oldValue": "admin",
  "newValue": "user",
  "ipAddress": "::1",
  "userAgent": "PostmanRuntime/7.39.1"
}

This provides traceability for sensitive operations.

---

28. Audit Log Security

Audit logs are intended to provide accountability.

They can be used to determine:

- Who performed an action.
- Which user was affected.
- What changed.
- The previous value.
- The new value.
- The source IP address.
- The client/user-agent.
- When the action occurred.

Sensitive administrative operations should continue to use the audit service.

---

29. HTTP Security Hardening

MBK uses several HTTP security protections.

Helmet

Helmet is enabled to add common security-related HTTP headers.

app.use(helmet());

---

30. CORS

CORS is configured using the application's client URL.

The configuration is controlled by:

CLIENT_URL=http://localhost:5173

Production environments should use the actual trusted frontend origin.

Credentials are enabled where required:

credentials: true

Only trusted origins should be configured in production.

---

31. Request Body Limits

The application limits request body size.

JSON requests are limited to:

1 MB

URL-encoded requests are also limited.

This reduces unnecessary resource consumption from oversized requests.

---

32. Rate Limiting

MBK implements rate limiting.

There is a general application rate limit and a stricter authentication rate limit.

The purpose is to reduce:

- Brute-force attacks.
- Credential stuffing.
- OTP abuse.
- Excessive login attempts.
- Excessive password-reset requests.
- Basic denial-of-service behavior.

Authentication endpoints receive stricter protection than normal endpoints.

---

33. Error Handling

The application uses centralized error handling.

Known application errors return their appropriate HTTP status.

Example:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error

Unexpected errors return:

{
  "success": false,
  "message": "Internal Server Error"
}

Detailed internal errors are logged server-side rather than exposed to clients.

---

34. Environment Variables

Sensitive configuration is stored using environment variables.

Important variables include:

MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
BCRYPT_SALT_ROUNDS=
CLIENT_URL=
REDIS_URL=
RABBITMQ_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Secrets must never be hardcoded into application source code.

---

35. Secret Management Rules

The following values must remain private:

- JWT secret
- MongoDB credentials
- Email credentials
- Cloudinary API secret
- Redis credentials where applicable
- RabbitMQ credentials where applicable
- Production API keys

The ".env" file must not be committed to Git.

Production secrets should be managed through the deployment environment or a dedicated secret-management system.

---

36. Security Testing

The authentication and security system was tested during the sprint.

Important successful tests included:

Authentication

Login                         PASS
Refresh token                 PASS
Logout                        PASS
Logout all                    PASS
Session retrieval             PASS
Session revocation            PASS

RBAC

Unauthorized request          PASS
Forbidden request             PASS
Permission checking           PASS
Role management               PASS
Self-role-change protection   PASS
Audit logging                 PASS

Password Security

Change password               PASS
Current password validation   PASS
Forgot password               PASS
OTP generation                PASS
OTP email delivery            PASS
OTP verification              PASS
OTP expiration                PASS
Password reset                PASS
New password login            PASS

Security Hardening

Helmet                        PASS
CORS                          PASS
Request size limit            PASS
General rate limiting         PASS
Authentication rate limiting  PASS
JWT validation                PASS

---

37. Build and Code Quality

The final production TypeScript build was tested successfully:

npm run build

Result:

PASS

ESLint was also executed:

npm run lint

Result:

PASS

No ESLint errors or warnings were reported.

---

38. Git Verification

The completed sprint was committed using:

git commit -m "feat: complete authentication and security hardening"

Final commit:

13f6848

The commit was successfully pushed to:

origin/master

The final working tree was clean:

nothing to commit, working tree clean

---

39. Security Principles Implemented

The MBK authentication system follows several important security principles:

Least Privilege

Users receive only the permissions associated with their roles.

Defense in Depth

Security is implemented at multiple levels:

Validation
   +
Authentication
   +
Authorization
   +
Session Security
   +
Rate Limiting
   +
HTTP Security
   +
Audit Logging

Password Protection

Passwords are hashed with bcrypt and are never stored in plain text.

Token Protection

Refresh tokens and OTPs are hashed before database storage.

Account Enumeration Protection

Password-reset requests use generic responses.

Session Invalidation

Password changes and security events can invalidate active sessions.

Auditability

Sensitive administrative actions are recorded.

---

40. Production Recommendations

Before production deployment, the following should be reviewed:

1. Use strong randomly generated JWT secrets.
2. Configure production CORS origins explicitly.
3. Configure production email/SMS providers.
4. Never expose OTPs in server logs in production.
5. Never return OTPs in API responses.
6. Keep ".env" outside Git.
7. Use HTTPS.
8. Configure secure cookies if cookies are used.
9. Configure appropriate reverse-proxy limits.
10. Monitor authentication failures.
11. Monitor suspicious login activity.
12. Add account lockout or progressive delays if required.
13. Configure centralized logging.
14. Configure database backups.
15. Review rate-limit thresholds under real traffic.
16. Rotate secrets when necessary.
17. Keep dependencies updated.
18. Run security testing before production release.

---

41. Authentication Flow Summary

The complete authentication architecture can be summarized as:

                    ┌───────────────┐
                    │     Client    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Validation  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Authentication│
                    └───────┬───────┘
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
      Access Token                   Refresh Token
             │                             │
             ▼                             ▼
      Protected API                    Session
             │                             │
             ▼                             ▼
      Authorization                  Token Rotation
             │
             ▼
        Permissions
             │
             ▼
       Protected Action
             │
             ▼
        Audit Logging

---

42. Password Recovery Flow Summary

User
 │
 ▼
Forgot Password
 │
 ▼
Identifier
 │
 ▼
Find Account
 │
 ├── Not Found ──► Generic Response
 │
 ▼
Generate 6-Digit OTP
 │
 ▼
Hash OTP
 │
 ▼
Store OTP
 │
 ▼
Send Email/SMS
 │
 ▼
User Enters OTP
 │
 ▼
Verify OTP
 │
 ├── Invalid ──► Reject
 ├── Expired ──► Reject
 └── Used ─────► Reject
 │
 ▼
Verified
 │
 ▼
New Password
 │
 ▼
Hash Password
 │
 ▼
Save Password
 │
 ▼
Invalidate/Update Reset State
 │
 ▼
Password Reset Successful

---

43. Final Sprint Status

The authentication and security sprint has been completed.

Authentication              COMPLETE
RBAC                        COMPLETE
Audit Logging               COMPLETE
Password Change             COMPLETE
Forgot Password             COMPLETE
OTP Verification            COMPLETE
Reset Password              COMPLETE
Session Management          COMPLETE
JWT Security                COMPLETE
HTTP Security               COMPLETE
Rate Limiting               COMPLETE
Build                       COMPLETE
ESLint                      COMPLETE
Git Commit                  COMPLETE
GitHub Push                 COMPLETE
Documentation               COMPLETE

Final Git Commit:

13f6848

Branch:

master

Sprint Status:

CLOSED ✅

---

44. Conclusion

The MBK backend now has a structured authentication and security foundation suitable for continued development.

The implemented architecture separates:

Authentication
Authorization
Sessions
Password Recovery
OTP
RBAC
Audit Logging
HTTP Security
Validation
Error Handling

This separation makes the backend easier to maintain, test, extend, and secure as additional MBK features are developed.

Future modules should follow the same security principles and should not bypass the existing authentication, authorization, validation, session, and audit mechanisms.