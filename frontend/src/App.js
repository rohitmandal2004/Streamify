import React, { Suspense, lazy } from 'react';
import './App.css';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { Component as EtheralShadow } from './components/ui/etheral-shadow';
import { MorphingSquare } from './components/ui/morphing-square';

const LandingPage = lazy(() => import('./pages/landing'));
const Authentication = lazy(() => import('./pages/authentication'));
const VideoMeetComponent = lazy(() => import('./pages/VideoMeet'));
const HomeComponent = lazy(() => import('./pages/home'));
const History = lazy(() => import('./pages/history'));
const SettingsPage = lazy(() => import('./pages/settings'));
const CalendarPage = lazy(() => import('./pages/calendar'));
const ProfilePage = lazy(() => import('./pages/profile'));

const FullPageLoader = () => (
  <div className="flex w-full h-screen items-center justify-center bg-[#0B0D17]">
    <MorphingSquare message="Loading Experience..." />
  </div>
);

function App() {
  const location = useLocation();

  return (
    <div className="App relative min-h-screen w-full">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <EtheralShadow
          color="rgba(128, 128, 128, 1)"
          animation={{ scale: 100, speed: 90 }}
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>
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
      <App />
    </Router>
  );
}

export default AppWrapper;
