# ImpactMatch 🌱 
### *The right volunteer, at the right place, at the right time.*

ImpactMatch is a state-of-the-art, full-stack AI-powered platform designed to bridge the gap between NGOs and volunteers. Using **Gemini 2.5 Flash**, it automatically structures community needs and intelligently matches them with the most suitable volunteers based on skills, location, and urgency.

---

## ✨ Key Features

- **🧠 AI-Powered Need Extraction**: NGOs can simply type a description like *"We need 5 people for flood relief in Koramangala this Saturday"* and our AI (Gemini 2.5) will automatically extract the title, category, skills, and urgency.
- **🔢 Intelligent Matching Algorithm**: A weighted scoring system that matches volunteers based on:
  - Skill Overlap (40%)
  - Location Proximity (25%)
  - Availability (20%)
  - Task Urgency (15%)
- **🏆 Social Credit System**: Volunteers earn credits and badges (Seedling → Contributor → Champion → Legend) for completing tasks, with bonuses for "Critical" urgency needs.
- **💬 Real-time Coordination**: Built-in chat system using **Socket.io** for instant communication between NGOs and assigned volunteers.
- **📊 Admin Dashboard**: Comprehensive stats tracking for NGOs, including total needs, open tasks, and volunteers helped.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS |
| **State Management** | Zustand |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas, Mongoose |
| **AI Engine** | Google Gemini 2.5 Flash |
| **Real-time** | Socket.io |
| **Styling** | Modern Glassmorphism & Mesh Gradients |

---

## 📁 Project Structure

```bash
impactmatch/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic (Auth, Needs, Matching)
│   │   ├── models/         # MongoDB Schemas (User, Need, Org)
│   │   ├── routes/         # API Endpoints
│   │   └── services/       # AI & Matching Services
│   └── .env                # Backend configuration
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI (Admin/Volunteer Layouts)
    │   ├── pages/          # Dashboards, Auth, Task Details
    │   └── store/          # Global state (Zustand)
    └── .env                # Frontend configuration
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas Account
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env (see .env.example)
npm run seed     # Seed demo accounts and sample data
npm run dev      # Start dev server on port 5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure your .env (VITE_API_URL=http://localhost:5000)
npm run dev      # Start frontend on port 5173
```

---

## 🔐 Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| **NGO Admin** | `admin@impactmatch.org` | `admin123` |
| **Volunteer** | `arjun@email.com` | `volunteer123` |

---

*Built with ❤️ to empower social impact through technology.*
