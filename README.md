# 🚀 DealMind AI — Outsmart the Seller. Own the Deal.

Welcome to **DealMind AI**, a strategic, real-time AI-powered negotiation game platform. This is not just a standard chatbot; it is a competitive game where you attempt to negotiate the lowest possible price with AI sellers mimicking real human negotiation strategies, emotional hesitation, and strict hidden constraints.

---

## 🏗️ 1. Project Overview

**DealMind AI** drops users into a back-and-forth multi-round negotiation to purchase high-value products. Each AI seller has a unique personality (Aggressive, Friendly, Emotional, Logical) and hidden constraints such as a **Minimum Acceptable Price** (that it will mathematically never go below). Players communicate in real-time using a premium, ChatGPT-style chat interface built with Socket.IO, while all their scores and states are dynamically tracked, cached, and analyzed.

---

## ✨ 2. Features

* **Multi-Personality AI Engine:** Sellers powered by Mistral AI adapt their tone dynamically (bluffing, showing hesitation, using logical arguments) without ever revealing their absolute bottom line.
* **Real-time Live Chat:** Instantly send and receive messages and offers, complete with "AI is typing..." indicators powered by Socket.IO.
* **Server-side Constraint Enforcement:** A secure backend that ensures AI responses can *never* hallucinate a price below the mathematically generated constraints.
* **Full Authentication Flow:** Google OAuth 2.0 and JWT-based email/password authentication via Passport.js, integrated tightly with Zustand.
* **Global Leaderboard System:** Compete with players worldwide to get the highest discount percentage.
* **Premium Glassmorphism UI:** Built with Vite + modern React features, using the latest Tailwind CSS v4 `@theme` specifications.
* **Persistent History & Profiles:** ImageKit-powered profile avatars and a robust MongoDB schema to track game history.

---

## 🛠️ 3. Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Zustand (State Management), Framer Motion (Animations), Socket.IO Client.
- **Backend:** Node.js, Express.js, Socket.IO, Mistral AI API, JWT, Passport.js, express-validator.
- **Database:** MongoDB + Mongoose.
- **Caching Layer:** Redis (Upstash) for fast real-time reads and rate limiting.
- **Media Hosting:** ImageKit/Cloudinary for avatar uploads.

---

## 📂 4. Folder Structure Explanation

The application is structured thoughtfully into isolated modules. Note that as per the latest requirements, the major backend components reside under the `Backend/src/` folder.

```
DealMind AI/
├── Backend/
│   ├── src/
│   │   ├── config/        # Database (MongoDB), Redis, ImageKit, Passport auth strategies
│   │   ├── controllers/   # Route logic for auth, games, leaderboards
│   │   ├── middleware/    # JWT auth checks, Rate limiting, File upload handlers
│   │   ├── models/        # Mongoose Schemas (User, Game, Leaderboard)
│   │   ├── routes/        # Express router definitions
│   │   ├── services/      # Core logic decoupled from controllers (Mistral AI Engine, Socket.IO handler)
│   │   └── utils/         # Helper functions (dynamic dynamic pricing calculation)
│   ├── server.js          # Entry point — Initializes Express and binds Socket.IO
│   ├── .env               # Secret keys (Not tracked in version control)
│   └── package.json       
│
└── Frontend/
    ├── src/
    │   ├── components/    # Reusable UI parts (Layout, ProtectedRoute, Sidebar)
    │   ├── pages/         # Full Views (Dashboard, GamePage, AuthPages, Leaderboard, etc.)
    │   ├── services/      # Axios API instances, Socket instance connections
    │   ├── store/         # Zustand global states (authStore, gameStore, themeStore)
    │   ├── App.jsx        # Root routing and Theme wrapper
    │   ├── index.css      # Custom Tailwind v4 @theme configuration and glassmorphism utilities
    │   └── main.jsx       # React DOM entry
    ├── index.html         # Document Template
    ├── vite.config.js     # Proxy configuration and Vite setup
    └── package.json    
```

---

## 🧠 5. AI Negotiation Logic

The heart of the application is the `aiEngine.js` service. 
When a game starts, the backend randomly generates:
* A `targetPrice` and a strict `minPrice`.
* A random API personality (e.g. `Aggressive`).

When a user sends an offer:
1. The AI evaluates the current round count to restrict how generous it can be. 
2. It processes a *System Prompt* explicitly instructing it not to reveal the true minimum.
3. **Failsafe**: Before delivering the response to the user via WebSockets, the backend enforces a Regex/Text scan. If the AI hallucinates a price lower than `minPrice`, the system forcefully alters it back to the safe limit. 

---

## 🎮 6. Game Flow

1. **Selection**: User clicks "Start Game" on the Dashboard.
2. **Setup**: The frontend dispatches an Axios call. The backend establishes `minPrice` and stores the initial Game state in MongoDB and Redis.
3. **Negotiation phase**: The user and AI exchange messages. All messages are synced to Redis (`chat:{gameId}`) so that if the user refreshes, they pick up right where they left off.
4. **Conclusion**: If the user submits an offer that the AI (or backend) determines is reasonable *(usually ≥ minPrice)*, the AI emits a `deal_accepted` Socket.IO event.
5. **Closure**: The score is calculated, the MongoDB `Game` instance marks `status: 'won'`, and it generates a Leaderboard entry.

---

## 🔐 7. Authentication & Security Flow

- **Registration/Login:** The backend hashes passwords via `bcryptjs` and returns a secure JWT.
- **🛡️ JWT Protection:** Every game and profile request is protected by a custom `auth.js` middleware that verifies the user's token from the `Authorization` header.
- **Google OAuth:** One-click login using Google OAuth 2.0. If you're a new user, DealMind AI automatically creates an account for you and syncs your profile picture.
- **📩 Automatic Notifications:** Every time you log in (via Email or Google), the system asynchronously sends a **Welcome Back Email** to your registered inbox to keep your account secure.

### 🔑 Forgot Password System
If you lose your password, follow this automated flow:
1.  Click **"Forgot Password?"** on the login screen.
2.  Enter your email to receive a secure, one-time-use **Reset Link**.
3.  The link contains a unique encrypted token that expires in **15 minutes**.
4.  Open the link in your browser, enter a new password, and your credentials are instantly updated and hashed securelly in the database.

---

## 📧 8. Email & Mail System

DealMind AI uses a decoupled **Mail Service** built on **Nodemailer**. 
- **Service Abstraction:** All emails are handled via `src/services/mailService.js`.
- **Async Execution:** Login emails are sent "fire-and-forget" so that your login speed is never slowed down by network latency from the mail server.
- **Templates:** Uses mobile-responsive HTML templates with custom branding and call-to-action buttons.

---

## ⚡ 9. Redis & State Management

Redis acts as our hyper-fast memory tier holding data that changes frequently:
* **Chat Caching:** `chat:{gameId}` stores an array of the latest conversation roles and messages.
* **Session & AI Context:** Provides extremely fast historic lookups for the Mistral prompt context matrix.
* **Live Leaderboards:** Automatically caches the `top10` output so every user fetching it doesn't incur a heavy MongoDB aggregation cost.
* **Rate Limits:** We implemented `express-rate-limit` connected to Redis to prevent API spam attacks.

---

## 🔌 10. Socket.IO Architecture

Socket.IO completely replaces HTTP polling for the game interface to achieve high immersion.
* Connection requires a valid JWT Handshake sent in the `auth` object.
* The frontend emits a `join_game` event, placing the user in an isolated room matching their `gameId`.
* `send_message` triggers the AI thinking state. The AI replies via `ai_typing` (`true`/`false`) while it pings Mistral, then broadcasts `game_state` when finished, instantly updating the React views automatically.

---

## 📍 11. API Routes

### Authentication (`/api/auth`)
* `POST /register` -> Traditional sign-up.
* `POST /login` -> Sign-in + Welcome Email.
* `POST /forgot-password` -> Triggers Reset Email.
* `POST /reset-password/:token` -> Updates DB with new password.
* `GET /me` -> Retrieves user identity from Token.
* `PUT /profile` -> Update username and bio.
* `POST /avatar` -> ImageKit avatar upload + Cropping.
* `GET /google` -> Redirects to Google Login.

### Game (`/api/game`)
* `POST /start` -> Generates hidden pricing algorithms.
* `GET /history` -> Paginated list of past negotiations.
* `POST /sendMessage` -> Interacts with Mistral.
* `POST /accept` -> Securely checks the last AI offer.

---

## ⚙️ 12. Environment Setup (Beginner Friendly)

To run DealMind AI locally, create a file named `.env` inside the `Backend` folder and paste your keys:

```env
# 🔧 Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# 📂 Database & Cache
MONGO_URI=mongodb+srv://...  # Your MongoDB Connection String
REDIS_URL=redis://...        # Your Redis Connection String

# 🔐 Security
JWT_SECRET=any_long_random_string_here
GOOGLE_CLIENT_ID=...         # From Google Cloud Console
GOOGLE_CLIENT_SECRET=...     # From Google Cloud Console

# 🤖 AI Engine
MISTRAL_API_KEY=...          # get yours at console.mistral.ai

# ✉️ Email (Gmail Setup)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password

# 🖼️ Media (ImageKit)
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...
```

### 💡 How to get a Gmail App Password:
1.  Go to your Google Account settings.
2.  Enable **2-Step Verification**.
3.  Search for **"App Passwords"**.
4.  Create a new one for "Mail" and "Windows Computer".
5.  Copy the 16-character code into `EMAIL_PASS`.

---

## 💻 13. How to Run Locally

1. **Install Node.js** (v18 or higher recommended).
2. **Terminal 1 (Backend):**
   ```bash
   cd Backend
   npm install
   npm run dev
   ```
3. **Terminal 2 (Frontend):**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173` and start negotiating!

---

## 🚀 14. Deployment Strategy
* **Backend**: Push to **Render** or **Railway**.
* **Frontend**: Push to **Vercel** or **Netlify**.
* **Database**: **MongoDB Atlas** (Free Tier).
* **Redis**: **Upstash Redis** (Free Tier).

---

## 🌟 15. Future Roadmap
1. **Multiplayer Showdowns:** Face off against friends in real-time.
2. **Voice Negotiation:** Speak directly to the AI seller.
3. **Achievement Badges:** Unlock "Master Negotiator" and "Whale Hunter" medals.
#   D e a l M i n d _ A I  
 