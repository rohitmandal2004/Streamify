# Streamify - Premium Video Calling App Setup Guide

## 🎨 Design Overview

Streamify features a **royal minimal design** with:
- Deep navy/midnight blue backgrounds
- Royal indigo/violet accents
- Glassmorphism effects with blur and soft glow
- Smooth micro-animations
- Premium SaaS aesthetic similar to Zoom/Google Meet/Linear

## 🚀 Quick Start

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend` directory:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. Start the development server:
```bash
npm start
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Ensure MongoDB connection string is configured in `backend/src/app.js`

4. Start the backend server:
```bash
npm run dev
```

## 🔐 Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as the application type
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
8. Copy the **Client ID**

### Step 2: Configure Frontend

1. Add the Client ID to your `.env` file:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

2. Restart your development server

### Step 3: Test Google Sign-In

1. Navigate to the authentication page
2. Click "Continue with Google"
3. Select your Google account
4. The app will automatically:
   - Generate a username from your email (e.g., `rohitmandal0804@gmail.com` → `rohitmandal0804`)
   - Create your account if it doesn't exist
   - Sign you in if the account already exists

## 📁 Project Structure

```
Streamify/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.jsx          # Reusable Streamify logo
│   │   │   ├── Footer.jsx        # Premium footer with contact info
│   │   │   ├── Toast.jsx         # Enhanced toast notifications
│   │   │   └── LoadingSkeleton.jsx # Loading states
│   │   ├── pages/
│   │   │   ├── landing.jsx        # Landing page with hero section
│   │   │   ├── authentication.jsx # Sign in/Sign up with Google OAuth
│   │   │   └── home.jsx          # Main dashboard
│   │   └── contexts/
│   │       └── AuthContext.jsx   # Authentication context
│   └── .env                      # Environment variables
│
└── backend/
    ├── src/
    │   ├── models/
    │   │   └── user.model.js      # User schema with OAuth support
    │   ├── controllers/
    │   │   └── user.controller.js # Auth controllers including Google OAuth
    │   └── routes/
    │       └── users.routes.js   # User routes
    └── package.json
```

## ✨ Key Features Implemented

### 1. **Logo Component**
- Reusable across all pages
- Appears in navbar, above auth forms, and in footer
- Smooth hover animations
- Responsive sizing

### 2. **Premium Footer**
- Contact information (Name, Email, Phone)
- Social media links (LinkedIn, GitHub, Instagram, Facebook)
- Glassmorphism design with hover effects
- Responsive layout

### 3. **Google OAuth Authentication**
- One-click sign-in with Google
- Auto-generates username from email
- Handles username conflicts (appends numbers)
- Stores profile image and email
- Seamless integration with existing auth system

### 4. **Royal Minimal Design**
- Deep navy backgrounds (#0a0e27)
- Indigo/purple gradient accents
- Glassmorphism cards with backdrop blur
- Smooth micro-animations
- Premium typography

### 5. **Enhanced UX**
- Loading states with skeletons
- Toast notifications (success/error/info)
- Smooth page transitions
- Trust indicators on landing page
- Floating glass UI preview

## 🎯 Design Decisions

### Color Palette
- **Background**: Deep navy (#0a0e27) for premium feel
- **Primary**: Indigo-500 (#6366f1) for royal elegance
- **Accents**: Purple-500 (#8b5cf6) and Pink-400 (#f472b6)
- **Surfaces**: Slate-900 with glassmorphism

### Typography
- **Font**: Inter & Outfit (Google Fonts)
- **Headings**: Bold, large, with gradient text
- **Body**: Medium weight, relaxed line-height

### Animations
- Framer Motion for smooth transitions
- Hover effects on interactive elements
- Loading states with shimmer effects
- Page transitions with AnimatePresence

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

**Backend:**
- MongoDB connection string in `backend/src/app.js`
- Update the connection string for your database

## 📝 Notes

- Google OAuth requires HTTPS in production
- Username generation is automatic for Google users
- Usernames can be edited later from profile settings
- All pages include the premium footer
- Logo is clickable and navigates to home

## 🐛 Troubleshooting

### Google OAuth Not Working
1. Verify `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
2. Check that authorized origins include your domain
3. Ensure the Google Identity Services script loads
4. Check browser console for errors

### Styling Issues
1. Clear browser cache
2. Restart the development server
3. Verify Tailwind CSS is compiling correctly

### Backend Errors
1. Check MongoDB connection
2. Verify user model schema matches database
3. Check server logs for detailed error messages

## 🚀 Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set production environment variables
3. Configure HTTPS (required for Google OAuth)
4. Update authorized origins in Google Cloud Console
5. Deploy backend to a service like Render, Heroku, or AWS

---

**Built with ❤️ for a premium video calling experience**

