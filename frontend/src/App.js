import React, { Suspense, lazy } from 'react';
import './App.css';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const LandingPage = lazy(() => import('./pages/landing'));
const Authentication = lazy(() => import('./pages/authentication'));
const VideoMeetComponent = lazy(() => import('./pages/VideoMeet'));
const HomeComponent = lazy(() => import('./pages/home'));
const History = lazy(() => import('./pages/history'));
const SettingsPage = lazy(() => import('./pages/settings'));
const CalendarPage = lazy(() => import('./pages/calendar'));
const ProfilePage = lazy(() => import('./pages/profile'));

const FullPageLoader = () => (
  <div className="flex w-full h-screen items-center justify-center bg-[var(--background)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 animate-pulse" />
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-[var(--text-secondary)] text-sm font-medium">Loading Streamify...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();

  return (
    <div className="App relative min-h-screen w-full bg-[var(--background)] text-[var(--text-primary)]">
      <div className="relative z-10 w-full min-h-screen">
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Suspense fallback={<FullPageLoader />}>
              <Routes location={location} key={location.pathname}>
                <Route path='/' element={<LandingPage />} />
                <Route path='/auth' element={<Authentication />} />
                <Route path='/home' element={<HomeComponent />} />
                <Route path='/profile' element={<ProfilePage />} />
                <Route path='/history' element={<History />} />
                <Route path='/settings' element={<SettingsPage />} />
                <Route path='/calendar' element={<CalendarPage />} />
                <Route path='/:url' element={<VideoMeetComponent />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </AuthProvider>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Router>
  );
}

export default AppWrapper;
