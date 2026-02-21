# SocialMRT - Social Media Management Platform

🚀 **Manage all your social media accounts from one powerful dashboard.**

## 🌟 Features

- ✅ Multi-platform posting (Bluesky, Mastodon, Telegram, Discord, Reddit)
- ✅ Smart scheduling with calendar view
- ✅ Analytics dashboard with insights
- ✅ Campaign management
- ✅ Content templates
- ✅ Modern Cosmic Purple UI
- ✅ PWA support (coming soon)

## 📁 Project Structure

```
Social-mrt/
├── client/                 # React.js Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── assets/        # Images, icons
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/        # Database, Swagger config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── templates/     # Email templates
│   │   └── utils/         # Helper functions
│   ├── server.js          # Entry point
│   └── package.json
│
├── database/               # SQL files
│   ├── schema.sql         # Database tables
│   └── stored_procedures.sql
│
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/social-mrt.git
cd social-mrt
```

### 2. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Run schema
source database/schema.sql
source database/stored_procedures.sql
```

### 3. Setup Server

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

### 4. Setup Client

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access the app

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs

## 🎨 Theme: Cosmic Purple

Using the 60-30-10 color rule:

- **60% (Background):** `#0F0F1A` - Deep space dark
- **30% (Surfaces):** `#6366F1` - Indigo
- **10% (Accents):** `#EC4899` - Pink

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/verify-email` | Verify email |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current user |

### Coming Soon

- Social Accounts API
- Posts API
- Campaigns API
- Analytics API

## 📧 Email Templates

Beautiful, responsive email templates included:

- ✉️ Email Verification (with OTP)
- 🎉 Welcome Email
- 🔑 Password Reset

## 🔒 Security

- JWT authentication with refresh tokens
- Bcrypt password hashing
- Helmet security headers
- CORS protection
- Rate limiting
- Input validation

## 📄 License

MIT License - feel free to use this project!

---

**Made with 💜 by SocialMRT Team**
