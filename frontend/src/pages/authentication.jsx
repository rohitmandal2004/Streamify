import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import Input from '../components/Input';
import Button from '../components/Button';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
  const [open, setOpen] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const { handleRegister, handleLogin, handleGoogleAuth } = React.useContext(AuthContext);

  const validateForm = () => {
    const errors = {};

    if (!username.trim()) {
      errors.username = 'Username is required';
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formState === 1 && !name.trim()) {
      errors.name = 'Name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async () => {
    setError('');
    setFieldErrors({});
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
        setUsername('');
        setPassword('');
        setName('');
        setFormState(0);
      }
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  // Google OAuth handler - Simplified approach
  React.useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    setGoogleLoading(true);
    setError('');
    
    try {
      // Decode the JWT token to get user info
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const googleData = JSON.parse(jsonPayload);
      
      await handleGoogleAuth({
        name: googleData.name,
        email: googleData.email,
        picture: googleData.picture,
        sub: googleData.sub
      });
      
      setMessage('Successfully signed in with Google!');
      setOpen(true);
    } catch (err) {
      console.error('Google auth error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to sign in with Google';
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'your_google_client_id_here') {
      setError('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.');
      setOpen(true);
      setMessage('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    if (window.google && window.google.accounts) {
      setError(''); // Clear any previous errors
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });
      
      // Trigger the sign-in popup
      window.google.accounts.id.prompt();
    } else {
      // Fallback: Show instructions
      setError('Google Sign-In is loading. Please try again in a moment.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      {/* Logo Above Form - Mobile Optimized */}
      <div className="flex justify-center pt-6 sm:pt-8 pb-3 sm:pb-4 relative z-20 px-4">
        <Logo size="md" clickable={true} className="sm:hidden" />
        <Logo size="lg" clickable={true} className="hidden sm:block" />
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative z-10 safe-area-inset">
        {/* Main Card */}
        <motion.div
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-surface/30 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
        {/* Left Panel - Illustration */}
        <div className="hidden md:flex flex-col justify-center p-12 relative bg-gradient-to-br from-primary/20 to-purple-600/20">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]" />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <h2 className="text-4xl font-bold mb-4 font-sans">
              Welcome <span className="text-gradient">Back!</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Connect with your loved ones, team, and friends through seamless, high-quality video calls.
            </p>

            <div className="space-y-4">
              {[
                { text: "HD Video Quality", color: "bg-blue-500" },
                { text: "Real-time Chat", color: "bg-purple-500" },
                { text: "Secure & Private", color: "bg-green-500" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-gray-200"
                >
                  <div className={`w-8 h-8 rounded-full ${item.color}/20 flex items-center justify-center`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Form - Mobile Optimized */}
        <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-center bg-black/20">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {formState === 0 ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                {formState === 0 ? 'Welcome back to Streamify' : 'Join the Streamify community'}
              </p>
            </div>

            {/* Google Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="border-white/20 hover:border-white/30 hover:bg-white/10"
              >
                {googleLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <GoogleIcon className="text-lg" />
                    Continue with Google
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/20 text-gray-400">or</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={formState}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {formState === 1 && (
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={PersonIcon}
                    error={fieldErrors.name}
                    autoFocus
                  />
                )}

                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={PersonIcon}
                  error={fieldErrors.username}
                  autoFocus={formState === 0}
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={LockIcon}
                  error={fieldErrors.password}
                  onKeyPress={handleKeyPress}
                />

                {error && !error.includes('Google OAuth') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAuth}
                    disabled={loading}
                    className="shadow-primary/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {formState === 0 ? 'Signing in...' : 'Creating account...'}
                      </span>
                    ) : (
                      formState === 0 ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => {
                        setFormState(formState === 0 ? 1 : 0);
                        setError('');
                        setFieldErrors({});
                      }}
                      className="text-primary hover:text-blue-400 font-semibold transition-colors focus:outline-none"
                    >
                      {formState === 0 ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Enhanced Toast */}
      <Toast
        open={open}
        onClose={() => setOpen(false)}
        message={message}
        type="success"
      />
      
      {error && (
        <Toast
          open={!!error}
          onClose={() => setError('')}
          message={error}
          type="error"
        />
      )}
    </div>
  );
}
