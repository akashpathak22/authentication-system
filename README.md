# 🔐 Robust Authentication & Session Management System

A production-ready Node.js & Express authentication system featuring JWT authentication with short-lived access tokens, long-lived refresh tokens stored in HTTP-only cookies, session tracking with device fingerprinting (IP and User-Agent), token rotation, and multi-device logout capabilities.

---

## 🚀 Features

- **User Registration & Login**: Account creation with hashed credentials and duplicate checks.
- **Dual-Token Architecture**:
  - **Access Token (JWT)**: Short-lived (`15m`) for authorization in request headers (`Bearer <token>`).
  - **Refresh Token (JWT)**: Long-lived (`7d`) stored securely in an `httpOnly`, `secure`, `sameSite: strict` cookie.
- **Session Management & Device Tracking**:
  - Each login creates a dedicated session record storing the user reference, client IP address, and User-Agent.
  - Refresh tokens are hashed using `SHA-256` before storing in the database for added security.
- **Refresh Token Rotation**: Issuing a new access token also rotates the refresh token to mitigate token theft.
- **Single & Multi-Device Logout**:
  - **Logout**: Revokes the current session and clears the cookie.
  - **Logout All**: Invalidates all active sessions across all devices for the user.
- **Database Resilience**: Managed MongoDB connection with lifecycle event handling and graceful termination on failure.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose v8+](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://github.com/auth0/node-jsonwebtoken)
- **Hashing**: Node.js built-in `crypto` (`SHA-256`)
- **HTTP Utilities**: `cookie-parser`, `morgan` (HTTP request logger), `dotenv`

---

## 📁 Project Structure

```text
authentication-system/
├── src/
│   ├── configuration/
│   │   ├── config.js            # Environment variable validation & config export
│   │   └── connectDB.js         # MongoDB connection setup & event handlers
│   ├── controllers/
│   │   └── auth.controller.js   # Authentication & session controllers
│   ├── model/
│   │   ├── sessions.model.js    # Session schema (IP, User-Agent, token hash, revocation)
│   │   └── user.model.js        # User schema (username, email, password)
│   ├── routes/
│   │   └── auth.routes.js       # Authentication routes mapping
│   └── index.js                 # Express app initialization & middleware configuration
├── .env.example                 # Example environment variables template
├── .gitignore                   # Files and directories ignored by Git
├── package.json                 # Project dependencies & scripts
├── README.md                    # Project documentation
└── server.js                    # Server entry point & listener
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd authentication-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/auth_db?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Start the server:**
   - **Development mode (with auto-reload via Nodemon):**
     ```bash
     npm run dev
     ```
   - **Production mode:**
     ```bash
     node server.js
     ```

---

## 📡 API Endpoints

Base URL: `/api/auth`

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new user account |
| `POST` | `/login` | Public | Login with email and password |
| `GET` | `/get-me` | Bearer Token | Fetch authenticated user profile |
| `GET` | `/refresh` | Refresh Cookie | Generate a new access token & rotate refresh token |
| `GET` | `/logout` | Refresh Cookie | Revoke the current active session |
| `GET` | `/logout-all` | Refresh Cookie | Revoke all active sessions across all devices |
| `GET` | `/getall` | Public | Fetch all registered users |

---

### Request & Response Examples

#### 1. Register User
- **URL**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "user registered successfull 🥳",
    "user": {
      "username": "johndoe",
      "email": "johndoe@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  *(Also sets `refreshToken` in `httpOnly` cookie)*

#### 2. User Login
- **URL**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "user logged-in successfully",
    "user": {
      "username": "johndoe",
      "email": "johndoe@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. Get Authenticated User Profile
- **URL**: `GET /api/auth/get-me`
- **Headers**:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "user is fetched",
    "user": {
      "username": "johndoe",
      "email": "johndoe@example.com"
    }
  }
  ```

#### 4. Refresh Access Token
- **URL**: `GET /api/auth/refresh`
- **Cookies**: Requires `refreshToken` cookie
- **Response** (`200 OK`):
  ```json
  {
    "mesage": "new fresh accessToken is generated successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 5. Logout (Current Device)
- **URL**: `GET /api/auth/logout`
- **Cookies**: Requires `refreshToken` cookie
- **Response** (`201 Created`):
  ```json
  {
    "message": "logout successfully"
  }
  ```

#### 6. Logout From All Devices
- **URL**: `GET /api/auth/logout-all`
- **Cookies**: Requires `refreshToken` cookie
- **Response** (`200 OK`):
  ```json
  {
    "message": "loged-out from all devices successfully"
  }
  ```

---

## 🔒 Security Best Practices Implemented

1. **Token Storage**: Refresh tokens are stored strictly inside HTTP-only, SameSite cookies to protect against Cross-Site Scripting (XSS).
2. **Token Hashing at Rest**: Refresh tokens are stored in the database as SHA-256 hashes, meaning even if the database is compromised, active raw tokens cannot be retrieved.
3. **Revocation Tracking**: Active sessions can be individually or globally revoked on demand.
4. **Environment Verification**: Mandatory startup verification of critical configuration keys (`MONGO_URI`, `JWT_SECRET`).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

