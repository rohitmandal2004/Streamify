# 🎥 Streamify - Premium Video Conferencing

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61DAFB.svg?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/backend-Node.js-339933.svg?logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/realtime-Socket.io-010101.svg?logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248.svg?logo=mongodb&logoColor=white)

**Streamify** is a next-generation video calling application designed with a premium customized aesthetic. It combines the reliability of WebRTC with modern UI trends like glassmorphism and 3D elements to create an immersive communication experience.

> **✨ Experience video calls like never before with interactive polls, real-time whiteboards, and a stunning UI.**

---

## 🌟 Key Features

### 📞 Core Communications
- **High-Quality Video & Audio**: Crystal clear peer-to-peer communication using WebRTC.
- **Screen Sharing**: Seamlessly share your screen for presentations and collaboration.
- **Smart Controls**: Easy access to mute, video toggle, and view switching.

### 🤝 Collaboration Tools
- **Real-time Whiteboard**: Draw, sketch, and brainstorm together in real-time.
- **Live Polls**: Create and vote on polls instantly during meetings.
- **Chat System**: Integrated messaging for links, notes, and side conversations.
- **Emoji Reactions**: Express feelings with animated floating emoji bubbles.

### 🎨 Premium UI/UX
- **Glassmorphism Design**: sleek, modern, frosted-glass aesthetics.
- **3D Background Elements**: Interactive floating cubes using Three.js.
- **Responsive Layout**: Perfectly optimized for all screen sizes.
- **Draggable Self-View**: Move your video feed anywhere on the screen.

### 🔐 Security & Auth
- **Google OAuth**: Fast and secure one-click login.
- **Secure Authentication**: JWT-based session management.
- **Meeting History**: Track your past calls and durations.

---

## 🛠️ Technology Stack

| **Area** | **Technologies** |
|----------|-----------------|
| **Frontend** | React, Vite (or CRA), Material UI, Tailwind CSS, Framer Motion, Three.js (R3F) |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB, Mongoose |
| **Real-time** | WebRTC (Peer-to-Peer), Socket.io (Signaling & Events) |
| **Auth** | Google OAuth 2.0, Bcrypt, JWT |

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or Atlas connection string)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/streamify.git
cd streamify
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file in the backend directory
# Add the following variables:
# PORT=8000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# GOOGLE_CLIENT_ID=your_google_client_id

npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create a .env file in the frontend directory
# Add the following variables:
# REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
# REACT_APP_BACKEND_URL=http://localhost:8000

npm start
```

Visit `http://localhost:3000` to view the application.

---

## 📸 Screenshots

| Landing Page | Video Meeting |
|:---:|:---:|
| <img src="./screenshots/landing.png" alt="Landing Page" width="400" /> | <img src="./screenshots/meeting.png" alt="Meeting Room" width="400" /> |

| Whiteboard | Polls |
|:---:|:---:|
| <img src="./screenshots/whiteboard.png" alt="Whiteboard" width="400" /> | <img src="./screenshots/polls.png" alt="Polls" width="400" /> |

*> Note: Replace the standard placeholder paths above with actual screenshots of your application for the best result!*

---

## 📂 Project Structure

```bash
Streamify/
├── backend/                 # Node.js + Express Server
│   ├── src/
│   │   ├── controllers/     # Logic for Auth & Sockets
│   │   ├── models/          # Mongoose Schemas
│   │   └── routes/          # API Endpoints
│   └── ...
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Reusable UI (Polls, Chat, etc.)
│   │   ├── pages/           # Main Views (Home, VideoMeet)
│   │   └── 3d/              # Three.js Components
│   └── ...
└── README.md                # Project Documentation
```

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---

## 📞 Contact

Your Name - Rohit Mandal
Email - rohitmandal0804@gmail.com

Project Link: https://streamifyfrontend.onrender.com
