import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert } from '@mui/material';
import Input from '../components/Input';
import Button from '../components/Button';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
  const [open, setOpen] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

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

    if (!validateForm()) {
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      {/* Main Card */}
      <motion.div
        className="w-full max-w-5xl grid md:grid-cols-2 bg-surface/30 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10"
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

        {/* Right Panel - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-black/20">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                {formState === 0 ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-gray-400 text-sm">
                {formState === 0 ? 'Welcome back to Streamify' : 'Join the Streamify community'}
              </p>
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

                {error && (
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
                    className="shadow-primary/20"
                  >
                    {formState === 0 ? 'Sign In' : 'Create Account'}
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

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}
