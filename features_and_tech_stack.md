# ImpactMatch: Platform Overview

**ImpactMatch** is a data-driven, real-time volunteer coordination platform designed for social impact. It bridges the gap between NGOs that gather critical community needs and volunteers who have the skills to fulfill them.

---

## 🚀 Core Features

### 1. AI-Powered Data Extraction (Generative AI)
- **Feature**: NGOs often receive messy, unstructured data from field reports, WhatsApp messages, or paper surveys. Instead of manually filling out forms, they can paste a raw paragraph into the "Post a Need" page.
- **How it works**: The platform integrates with the Google Gemini AI API to instantly parse the text and extract structured JSON data (Title, Urgency, Category, Location, and specific Skills Required).
- **Benefit**: Drastically reduces manual data entry time for NGOs during critical emergencies.

### 2. Smart Volunteer Matching Engine
- **Feature**: A dynamic algorithm that pairs available volunteers with open community needs.
- **How it works**: When a volunteer views their dashboard, the backend calculates a personalized "Match Score" (0-100%) for every open need. The score is weighted based on:
  - **Skill Overlap** (e.g., medical skills for disaster relief).
  - **Location Proximity** (matching volunteers to local tasks).
  - **Availability** (matching schedules).
  - **Urgency Level** (Critical tasks automatically boost match scores).
- **Benefit**: Ensures that the most qualified people are sent to the most urgent tasks first.

### 3. Interactive Geospatial "Impact Map"
- **Feature**: A real-time, interactive heatmap visualization of all community needs.
- **How it works**: Plots open, assigned, and fulfilled needs on a map (e.g., Bangalore, Odisha, Mumbai) using dynamic markers. Markers are color-coded based on the highest urgency level in that area (Red = Critical, Orange = High, Yellow = Medium).
- **Benefit**: Allows NGOs and city administrators to instantly see geographical "hotspots" of distress and allocate resources geographically rather than reading through spreadsheets.

### 4. Real-Time Socket Notifications & Chat
- **Feature**: Instant, bidirectional communication and alerts without refreshing the page.
- **How it works**: 
  - **Live Notifications**: When an NGO posts a new need, all connected volunteers instantly receive a "New Task Available" push-style toast notification.
  - **Task Fulfillment**: When a task is marked complete, the owning NGO receives an instant real-time alert.
  - **Live Chat**: Once a volunteer accepts a task, a dedicated real-time chat room is created between the volunteer and the NGO admin to coordinate logistics.
- **Benefit**: Critical in emergencies where delays cost lives; ensures zero latency in communication.

### 5. Gamification & "Social Credits" System
- **Feature**: An incentive mechanism to keep volunteers engaged.
- **How it works**: When an NGO marks a task as "Fulfilled", the system automatically awards "Social Credits" to the volunteers who participated. Volunteers can track their lifetime credits on their profile, alongside a dynamically awarded "Tier Badge" (Bronze, Silver, Gold, Platinum, Diamond) based on their total impact.
- **Benefit**: Drives long-term volunteer retention and community engagement.

### 6. Role-Based Dashboards & Workflows
- **Feature**: Separate, secure experiences for NGOs (Admins) and Volunteers.
- **NGO View**: Analytics on total needs posted, open vs. fulfilled ratios, volunteer metrics, and tools to manage task lifecycles (Open → Assigned → Fulfilled).
- **Volunteer View**: Personalized feed of matched tasks, one-click "Accept Task" functionality, and profile management (updating skills and availability to improve future matches).

---

## 💻 Technology Stack

### Frontend (Client-Side)
* **Framework**: React.js 18
* **Build Tool**: Vite (for ultra-fast HMR and optimized builds)
* **Language**: TypeScript (for strict type-safety and fewer runtime errors)
* **Styling**: Tailwind CSS (Utility-first CSS framework)
* **Design System**: Custom "Dark Glassmorphism" UI (Backdrop blurs, translucent panels, neon-accented borders tailored for a premium aesthetic)
* **State Management**: Zustand (Lightweight, un-opinionated global state for Auth and Notifications)
* **Routing**: React Router DOM v6
* **Icons**: Lucide React
* **Mapping**: Leaflet + React-Leaflet (for the interactive Impact Map)
* **Alerts**: React-Hot-Toast (for rich, customizable real-time popup notifications)

### Backend (Server-Side)
* **Runtime**: Node.js
* **Framework**: Express.js
* **Language**: TypeScript
* **Database**: MongoDB (NoSQL document database, perfect for flexible schemas like chat logs and unstructured needs)
* **ODM**: Mongoose
* **Real-Time Engine**: Socket.io (for WebSockets / bidirectional event-driven communication)
* **Authentication**: JSON Web Tokens (JWT) & bcrypt (for secure password hashing)
* **AI Integration**: `@google/generative-ai` SDK (Connecting to Gemini 1.5 Flash for NLP extraction)

### Architecture Highlights
* **RESTful API**: Standardized endpoints (`/api/needs`, `/api/volunteer`, etc.) protected by custom JWT middleware.
* **Socket Rooms**: Usage of specific Socket.io "rooms" (e.g., `volunteers` room, `admin_<id>` room) to efficiently broadcast targeted real-time events without spamming the entire network.
* **Algorithmic Controllers**: Custom scoring logic executed server-side to prevent client tampering.
